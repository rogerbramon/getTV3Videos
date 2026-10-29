export type Bytes = Uint8Array<ArrayBuffer>;

interface Box {
  type: string;
  start: number;
  end: number;
  bodyStart: number;
}

function readBoxes(data: Bytes, start = 0, end = data.length): Box[] {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const boxes: Box[] = [];
  let offset = start;

  while (offset + 8 <= end) {
    let size = view.getUint32(offset);
    let headerSize = 8;
    if (size === 1) {
      size = Number(view.getBigUint64(offset + 8));
      headerSize = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    const type = String.fromCharCode(...data.subarray(offset + 4, offset + 8));
    boxes.push({
      type,
      start: offset,
      end: offset + size,
      bodyStart: offset + headerSize,
    });
    offset += size;
  }

  return boxes;
}

function childBoxes(data: Bytes, parent: Box): Box[] {
  return readBoxes(data, parent.bodyStart, parent.end);
}

function findBox(data: Bytes, boxes: Box[], path: string[]): Box {
  const [type, ...rest] = path;
  const box = boxes.find((candidate) => candidate.type === type);
  if (!box) {
    throw new Error(`Missing ${type} box`);
  }
  return rest.length === 0 ? box : findBox(data, childBoxes(data, box), rest);
}

function copyBox(data: Bytes, box: Box): Bytes {
  return data.slice(box.start, box.end);
}

function writeUint32(data: Bytes, offset: number, value: number): void {
  new DataView(data.buffer, data.byteOffset, data.byteLength).setUint32(
    offset,
    value
  );
}

function makeBox(type: string, ...children: Bytes[]): Bytes {
  const size = 8 + children.reduce((total, child) => total + child.length, 0);
  const box = new Uint8Array(size);
  writeUint32(box, 0, size);
  box.set(Array.from(type, (char) => char.charCodeAt(0)), 4);
  let offset = 8;
  for (const child of children) {
    box.set(child, offset);
    offset += child.length;
  }
  return box;
}

function makeMehd(duration: number): Bytes {
  const body = new Uint8Array(12);
  const view = new DataView(body.buffer);
  view.setUint8(0, 1);
  view.setBigUint64(4, BigInt(duration));
  return makeBox("mehd", body);
}

function setTrackId(trak: Bytes, trackId: number): Bytes {
  const tkhd = findBox(trak, childBoxes(trak, readBoxes(trak)[0]), ["tkhd"]);
  const version = trak[tkhd.bodyStart];
  writeUint32(trak, tkhd.bodyStart + (version === 1 ? 20 : 12), trackId);
  return trak;
}

function setTrexTrackId(trex: Bytes, trackId: number): Bytes {
  writeUint32(trex, 12, trackId);
  return trex;
}

export const VIDEO_TRACK_ID = 1;
export const AUDIO_TRACK_ID = 2;

// Builds ftyp + moov describing both tracks, so the moof/mdat pairs of each
// DASH segment can be appended as-is afterwards.
export function mergeInitSegments(
  videoInit: Bytes,
  audioInit: Bytes,
  durationSeconds: number
): Bytes {
  const videoBoxes = readBoxes(videoInit);
  const audioBoxes = readBoxes(audioInit);

  const ftyp = copyBox(videoInit, findBox(videoInit, videoBoxes, ["ftyp"]));
  const mvhdBox = findBox(videoInit, videoBoxes, ["moov", "mvhd"]);
  const mvhd = copyBox(videoInit, mvhdBox);
  writeUint32(mvhd, mvhd.length - 4, AUDIO_TRACK_ID + 1);
  const timescaleOffset = mvhd[8] === 1 ? 28 : 20;
  const timescale = new DataView(mvhd.buffer).getUint32(timescaleOffset);

  const videoTrak = setTrackId(
    copyBox(videoInit, findBox(videoInit, videoBoxes, ["moov", "trak"])),
    VIDEO_TRACK_ID
  );
  const audioTrak = setTrackId(
    copyBox(audioInit, findBox(audioInit, audioBoxes, ["moov", "trak"])),
    AUDIO_TRACK_ID
  );
  const videoTrex = setTrexTrackId(
    copyBox(videoInit, findBox(videoInit, videoBoxes, ["moov", "mvex", "trex"])),
    VIDEO_TRACK_ID
  );
  const audioTrex = setTrexTrackId(
    copyBox(audioInit, findBox(audioInit, audioBoxes, ["moov", "mvex", "trex"])),
    AUDIO_TRACK_ID
  );

  const mvex = makeBox(
    "mvex",
    makeMehd(Math.round(durationSeconds * timescale)),
    videoTrex,
    audioTrex
  );
  const moov = makeBox("moov", mvhd, videoTrak, audioTrak, mvex);

  const output = new Uint8Array(ftyp.length + moov.length);
  output.set(ftyp, 0);
  output.set(moov, ftyp.length);
  return output;
}

// Keeps only the moof/mdat pairs of a media segment, retagging them with the
// merged track id and a global fragment sequence number. Segments use
// default-base-is-moof, so data offsets stay valid when moved.
export function rewriteMediaSegment(
  segment: Bytes,
  trackId: number,
  firstSequenceNumber: number
): { chunks: Bytes[]; nextSequenceNumber: number } {
  const chunks: Bytes[] = [];
  let sequenceNumber = firstSequenceNumber;

  for (const box of readBoxes(segment)) {
    if (box.type === "moof") {
      const children = childBoxes(segment, box);
      const mfhd = findBox(segment, children, ["mfhd"]);
      writeUint32(segment, mfhd.bodyStart + 4, sequenceNumber++);
      for (const traf of children.filter((child) => child.type === "traf")) {
        const tfhd = findBox(segment, childBoxes(segment, traf), ["tfhd"]);
        writeUint32(segment, tfhd.bodyStart + 4, trackId);
      }
    }
    if (box.type === "moof" || box.type === "mdat") {
      chunks.push(segment.subarray(box.start, box.end));
    }
  }

  return { chunks, nextSequenceNumber: sequenceNumber };
}
