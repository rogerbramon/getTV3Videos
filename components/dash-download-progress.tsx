import { X } from "lucide-react";
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
    <div className="flex flex-col gap-2 text-sm text-neutral-200">
      <div className="flex items-center justify-between gap-3">
        <span>
          Descarregant en {qualityLabel(video)}… {percent}%
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-neutral-500 hover:bg-neutral-800 transition-colors"
        >
          <X className="h-4 w-4" />
          Cancel·la
        </button>
      </div>
      <div className="h-2 w-full rounded-full bg-neutral-700 overflow-hidden">
        <div
          className="h-full bg-white transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-neutral-400 text-xs">
        No tanquis aquesta pestanya fins que acabi.
      </p>
    </div>
  );
}
