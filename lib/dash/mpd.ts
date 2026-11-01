export interface DashRepresentation {
  id: string;
  height: number;
  bandwidth: number;
  initUrl: string;
  segmentUrl: (index: number) => string;
  startNumber: number;
  segmentSeconds: number;
}

export interface DashManifest {
  durationSeconds: number;
  videos: DashRepresentation[];
  audio: DashRepresentation;
}

function parseIsoDuration(value: string): number {
  const match = value.match(
    /P(?:[\d.]+Y)?(?:[\d.]+M)?(?:([\d.]+)D)?(?:T(?:([\d.]+)H)?(?:([\d.]+)M)?(?:([\d.]+)S)?)?/
  );
  if (!match) {
    return 0;
  }
  const [, days, hours, minutes, seconds] = match.map((part) =>
    Number(part ?? 0)
  );
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

function fillTemplate(
  template: string,
  representationId: string,
  bandwidth: number,
  number: number
): string {
  return template
    .replace(/\$RepresentationID\$/g, representationId)
    .replace(/\$Bandwidth\$/g, String(bandwidth))
    .replace(/\$Number(?:%0(\d+)d)?\$/g, (_, width?: string) =>
      String(number).padStart(Number(width ?? 0), "0")
    );
}

function parseRepresentation(
  representation: Element,
  baseUrl: string
): DashRepresentation | null {
  const template =
    representation.querySelector("SegmentTemplate") ??
    representation.parentElement?.querySelector(":scope > SegmentTemplate");
  const media = template?.getAttribute("media");
  const initialization = template?.getAttribute("initialization");
  if (!template || !media || !initialization) {
    return null;
  }

  const id = representation.getAttribute("id") ?? "";
  const bandwidth = Number(representation.getAttribute("bandwidth") ?? 0);
  const timescale = Number(template.getAttribute("timescale") ?? 1);
  const resolve = (path: string): string => new URL(path, baseUrl).href;

  return {
    id,
    height: Number(representation.getAttribute("height") ?? 0),
    bandwidth,
    initUrl: resolve(fillTemplate(initialization, id, bandwidth, 0)),
    segmentUrl: (index) =>
      resolve(fillTemplate(media, id, bandwidth, index)),
    startNumber: Number(template.getAttribute("startNumber") ?? 1),
    segmentSeconds: Number(template.getAttribute("duration")) / timescale,
  };
}

function representationsOf(
  adaptationSet: Element | undefined,
  baseUrl: string
): DashRepresentation[] {
  if (!adaptationSet) {
    return [];
  }
  return Array.from(adaptationSet.querySelectorAll("Representation"))
    .map((representation) => parseRepresentation(representation, baseUrl))
    .filter((representation) => representation !== null);
}

// Only single-period, unencrypted manifests with numbered segment templates can
// be stitched into one MP4 in the browser.
export async function fetchDashManifest(
  url: string
): Promise<DashManifest | null> {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }

  const doc = new DOMParser().parseFromString(
    await response.text(),
    "application/xml"
  );
  const mpd = doc.documentElement;
  if (
    doc.querySelectorAll("Period").length !== 1 ||
    doc.querySelector("ContentProtection") ||
    doc.querySelector("SegmentTimeline")
  ) {
    return null;
  }

  const adaptationSets = Array.from(doc.querySelectorAll("AdaptationSet"));
  const kindOf = (set: Element): string =>
    set.getAttribute("contentType") ??
    set.getAttribute("mimeType")?.split("/")[0] ??
    "";
  const audioSets = adaptationSets.filter((set) => kindOf(set) === "audio");
  const mainAudioSet =
    audioSets.find((set) =>
      set.querySelector('Role[value="main"]')
    ) ?? audioSets[0];

  const videos = adaptationSets
    .filter((set) => kindOf(set) === "video")
    .flatMap((set) => representationsOf(set, url))
    .sort((a, b) => b.height - a.height);
  const audio = representationsOf(mainAudioSet, url).sort(
    (a, b) => b.bandwidth - a.bandwidth
  )[0];

  if (videos.length === 0 || !audio) {
    return null;
  }

  return {
    durationSeconds: parseIsoDuration(
      mpd.getAttribute("mediaPresentationDuration") ?? ""
    ),
    videos,
    audio,
  };
}
