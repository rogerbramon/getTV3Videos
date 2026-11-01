"use client";

import { useEffect, useRef, useState } from "react";
import type { DashManifest, DashRepresentation } from "@/lib/dash/mpd";
import type { SaveTarget } from "@/lib/dash/save-targets";
import { downloadDash, type DashDownloadProgress } from "@/lib/dash/download-dash";

export interface FinishedDownload {
  name: string;
  saveUrl: string | null;
}

interface UseDashDownloadResult {
  activeVideo: DashRepresentation | null;
  progress: DashDownloadProgress | null;
  error: string | null;
  finished: FinishedDownload | null;
  start: (
    manifest: DashManifest,
    video: DashRepresentation,
    name: string,
    openTarget: () => Promise<SaveTarget | null>
  ) => Promise<void>;
  cancel: () => void;
  reset: () => void;
  fail: (message: string) => void;
}

function friendlyError(error: unknown): string {
  console.error(error);
  if (error instanceof DOMException && error.name === "QuotaExceededError") {
    return "No hi ha prou espai lliure a l'ordinador. Allibera espai o tria una qualitat més baixa.";
  }
  return "No s'ha pogut descarregar el vídeo. Comprova la connexió i torna-ho a provar.";
}

export function useDashDownload(): UseDashDownloadResult {
  const [activeVideo, setActiveVideo] = useState<DashRepresentation | null>(null);
  const [progress, setProgress] = useState<DashDownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState<FinishedDownload | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!activeVideo) {
      return;
    }
    const warnBeforeLeaving = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [activeVideo]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function start(
    manifest: DashManifest,
    video: DashRepresentation,
    name: string,
    openTarget: () => Promise<SaveTarget | null>
  ): Promise<void> {
    setError(null);
    setFinished(null);

    let target: SaveTarget | null;
    try {
      target = await openTarget();
    } catch (openError) {
      setError(friendlyError(openError));
      return;
    }
    if (!target) {
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setActiveVideo(video);
    setProgress({ fraction: 0, bytesWritten: 0 });

    try {
      await downloadDash({
        manifest,
        video,
        writable: target.writable,
        signal: controller.signal,
        onProgress: setProgress,
      });
      setFinished({ name, saveUrl: await target.complete() });
    } catch (downloadError) {
      await target.writable.abort().catch(() => {});
      if (!controller.signal.aborted) {
        setError(friendlyError(downloadError));
      }
    } finally {
      abortRef.current = null;
      setActiveVideo(null);
      setProgress(null);
    }
  }

  return {
    activeVideo,
    progress,
    error,
    finished,
    start,
    cancel: () => abortRef.current?.abort(),
    reset: () => {
      setFinished(null);
      setError(null);
    },
    fail: setError,
  };
}
