import type { DashManifest, DashRepresentation } from "@/lib/dash/mpd";
import {
  type Bytes,
  AUDIO_TRACK_ID,
  VIDEO_TRACK_ID,
  mergeInitSegments,
  rewriteMediaSegment,
} from "@/lib/dash/fragmented-mp4";

export interface DashDownloadProgress {
  fraction: number;
  bytesWritten: number;
}

interface DownloadDashOptions {
  manifest: DashManifest;
  video: DashRepresentation;
  writable: FileSystemWritableFileStream;
  signal: AbortSignal;
  onProgress: (progress: DashDownloadProgress) => void;
}

const PARALLEL_SEGMENTS_PER_TRACK = 4;
const MAX_ATTEMPTS = 4;

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// Resolves to null on 404, which marks the end of the segment list: the MPD
// duration is rounded, so the exact segment count is not known up front.
async function fetchSegment(
  url: string,
  signal: AbortSignal
): Promise<Bytes | null> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { signal });
      if (response.status === 404) {
        return null;
      }
      if (response.ok) {
        return new Uint8Array(await response.arrayBuffer());
      }
      if (attempt >= MAX_ATTEMPTS) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
    } catch (error) {
      if (signal.aborted || attempt >= MAX_ATTEMPTS) {
        throw error;
      }
    }
    await wait(1000 * attempt);
  }
}

async function* fetchSegmentsInOrder(
  representation: DashRepresentation,
  signal: AbortSignal
): AsyncGenerator<Bytes> {
  const pending: Promise<Bytes | null>[] = [];
  let nextIndex = representation.startNumber;

  const fill = (): void => {
    while (pending.length < PARALLEL_SEGMENTS_PER_TRACK) {
      const request = fetchSegment(
        representation.segmentUrl(nextIndex++),
        signal
      );
      request.catch(() => {});
      pending.push(request);
    }
  };

  fill();
  while (true) {
    const segment = await pending.shift();
    if (!segment) {
      return;
    }
    yield segment;
    fill();
  }
}

async function fetchInit(
  representation: DashRepresentation,
  signal: AbortSignal
): Promise<Bytes> {
  const init = await fetchSegment(representation.initUrl, signal);
  if (!init) {
    throw new Error(`Missing init segment ${representation.initUrl}`);
  }
  return init;
}

export async function downloadDash({
  manifest,
  video,
  writable,
  signal,
  onProgress,
}: DownloadDashOptions): Promise<void> {
  const { audio, durationSeconds } = manifest;
  const [videoInit, audioInit] = await Promise.all([
    fetchInit(video, signal),
    fetchInit(audio, signal),
  ]);

  let bytesWritten = 0;
  const write = async (chunk: Bytes): Promise<void> => {
    await writable.write(chunk);
    bytesWritten += chunk.length;
  };

  await write(mergeInitSegments(videoInit, audioInit, durationSeconds));

  const tracks = [
    {
      trackId: VIDEO_TRACK_ID,
      segments: fetchSegmentsInOrder(video, signal),
      expected: Math.ceil(durationSeconds / video.segmentSeconds),
      done: 0,
      finished: false,
    },
    {
      trackId: AUDIO_TRACK_ID,
      segments: fetchSegmentsInOrder(audio, signal),
      expected: Math.ceil(durationSeconds / audio.segmentSeconds),
      done: 0,
      finished: false,
    },
  ];
  let sequenceNumber = 1;

  while (tracks.some((track) => !track.finished)) {
    const results = await Promise.all(
      tracks.map((track) =>
        track.finished ? null : track.segments.next()
      )
    );

    for (const [index, result] of results.entries()) {
      const track = tracks[index];
      if (!result) {
        continue;
      }
      if (result.done) {
        track.finished = true;
        continue;
      }
      const rewritten = rewriteMediaSegment(
        result.value,
        track.trackId,
        sequenceNumber
      );
      sequenceNumber = rewritten.nextSequenceNumber;
      for (const chunk of rewritten.chunks) {
        await write(chunk);
      }
      track.done++;
    }

    const done = tracks.reduce((total, track) => total + track.done, 0);
    const expected = tracks.reduce((total, track) => total + track.expected, 0);
    onProgress({ fraction: Math.min(done / expected, 1), bytesWritten });
  }

  await writable.close();
}
