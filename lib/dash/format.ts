import type { DashManifest, DashRepresentation } from "@/lib/dash/mpd";

export function formatSize(bytes: number): string {
  const gigabytes = bytes / 1e9;
  return gigabytes < 1
    ? `${Math.round(bytes / 1e6)} MB`
    : `${gigabytes.toLocaleString("ca", { maximumFractionDigits: 1 })} GB`;
}

export function qualityLabel(video: DashRepresentation): string {
  if (video.height >= 1080) {
    return "Full HD";
  }
  if (video.height >= 720) {
    return "HD";
  }
  return "Qualitat normal";
}

export function estimateBytes(
  manifest: DashManifest,
  video: DashRepresentation
): number {
  return (
    ((video.bandwidth + manifest.audio.bandwidth) / 8) *
    manifest.durationSeconds
  );
}

export function fileNameFor(title: string, video: DashRepresentation): string {
  const safeTitle = title.replace(/[\\/:*?"<>|]+/g, " ").trim() || "video";
  return `${safeTitle} ${video.height}p.mp4`;
}
