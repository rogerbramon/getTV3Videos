import type { DashRepresentation } from "@/lib/dash/mpd";
import type { DashDownloadProgress as Progress } from "@/lib/dash/download-dash";
import { qualityLabel } from "@/lib/dash/format";

interface DashDownloadProgressProps {
  video: DashRepresentation;
  progress: Progress;
  onCancel: () => void;
}

export function DashDownloadProgress({ video, progress, onCancel }: DashDownloadProgressProps) {
  const percent = Math.floor(progress.fraction * 100);

  return (
    <div className="flex flex-col gap-2 text-sm text-neutral-200 max-w-md">
      <div className="flex items-baseline justify-between gap-3">
        <span>Descarregant en {qualityLabel(video)}…</span>
        <span className="tabular-nums text-neutral-400">{percent}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-white transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-baseline justify-between gap-3 text-xs text-neutral-500">
        <span>No tanquis aquesta pestanya fins que acabi.</span>
        <button
          type="button"
          onClick={onCancel}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          Cancel·la
        </button>
      </div>
    </div>
  );
}
