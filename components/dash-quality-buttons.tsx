import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DashManifest, DashRepresentation } from "@/lib/dash/mpd";
import { estimateBytes, formatSize, qualityLabel } from "@/lib/dash/format";

interface DashQualityButtonsProps {
  manifest: DashManifest;
  onSelect: (video: DashRepresentation) => void;
}

export function DashQualityButtons({ manifest, onSelect }: DashQualityButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {manifest.videos.map((video) => (
        <button
          key={video.id}
          type="button"
          onClick={() => onSelect(video)}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-white bg-white text-black",
            "hover:bg-neutral-200 hover:border-neutral-300 transition-colors"
          )}
        >
          <Download className="h-4 w-4" />
          {qualityLabel(video)}
          <Badge variant="outline" className="ml-1 text-neutral-600 border-neutral-400">
            {formatSize(estimateBytes(manifest, video))}
          </Badge>
        </button>
      ))}
    </div>
  );
}
