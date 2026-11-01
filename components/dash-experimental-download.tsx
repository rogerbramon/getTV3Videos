"use client";

import { useEffect } from "react";
import { Download } from "lucide-react";
import { DashDownloadProgress } from "@/components/dash-download-progress";
import { DashQualityButtons } from "@/components/dash-quality-buttons";
import type { DashManifest, DashRepresentation } from "@/lib/dash/mpd";
import { estimateBytes, fileNameFor, formatSize } from "@/lib/dash/format";
import {
  availableBrowserStorage,
  clearTemporaryFiles,
  openBrowserStorageTarget,
  openDirectSaveTarget,
} from "@/lib/dash/save-targets";
import { useDashDownload } from "@/lib/dash/use-dash-download";

export type SaveMethod = "direct" | "browser";

interface DashExperimentalDownloadProps {
  manifest: DashManifest;
  method: SaveMethod;
  title?: string;
}

export function DashExperimentalDownload({
  manifest,
  method,
  title = "video",
}: DashExperimentalDownloadProps) {
  const { activeVideo, progress, error, finished, start, cancel, reset, fail } =
    useDashDownload();

  useEffect(() => {
    if (method === "browser") {
      clearTemporaryFiles();
    }
  }, [method]);

  // Start the save on its own; the button below stays as a fallback in case
  // the browser blocks or asks about downloads that weren't clicked.
  useEffect(() => {
    if (!finished?.saveUrl) {
      return;
    }
    const link = document.createElement("a");
    link.href = finished.saveUrl;
    link.download = finished.name;
    link.click();
  }, [finished]);

  async function handleSelect(video: DashRepresentation): Promise<void> {
    const name = fileNameFor(title, video);
    if (method === "direct") {
      await start(manifest, video, name, () => openDirectSaveTarget(name));
      return;
    }

    const needed = estimateBytes(manifest, video) * 1.05;
    if ((await availableBrowserStorage()) < needed) {
      fail(
        `No hi ha prou espai lliure per a aquesta qualitat (calen uns ${formatSize(needed)}). Allibera espai o tria una qualitat més baixa.`
      );
      return;
    }
    await start(manifest, video, name, openBrowserStorageTarget);
  }

  async function handleSaved(): Promise<void> {
    await clearTemporaryFiles();
    reset();
  }

  return (
    <div className="mb-6">
      <h3 className="text-neutral-200 text-base mb-1">Nou descarregador (beta)</h3>
      <p className="text-neutral-400 text-sm mb-3">
        Tria la qualitat que vulguis. Si alguna cosa falla, fes servir els
        vídeos de dalt.
      </p>

      {activeVideo && progress ? (
        <DashDownloadProgress video={activeVideo} progress={progress} onCancel={cancel} />
      ) : finished?.saveUrl ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="basis-full text-sm text-neutral-400">
            Fet! El vídeo s&apos;està desant a Baixades. Si no comença, fes
            clic al botó.
          </p>
          <a
            href={finished.saveUrl}
            download={finished.name}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-white bg-white text-black hover:bg-neutral-200 hover:border-neutral-300 transition-colors no-underline"
          >
            <Download className="h-4 w-4" />
            Desa el vídeo
          </a>
          <button
            type="button"
            onClick={handleSaved}
            className="text-sm text-neutral-400 underline hover:text-neutral-200"
          >
            Ja l&apos;he desat
          </button>
        </div>
      ) : (
        <DashQualityButtons manifest={manifest} onSelect={handleSelect} />
      )}

      {finished && !finished.saveUrl && (
        <p className="text-green-400 text-sm mt-3">
          Fet! El vídeo s&apos;ha desat com «{finished.name}».
        </p>
      )}
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  );
}
