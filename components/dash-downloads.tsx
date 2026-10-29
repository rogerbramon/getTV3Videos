"use client";

import { useEffect, useState } from "react";
import {
  DashExperimentalDownload,
  type SaveMethod,
} from "@/components/dash-experimental-download";
import { fetchDashManifest, type DashManifest } from "@/lib/dash/mpd";
import {
  canSaveDirectly,
  canSaveViaBrowserStorage,
  isMobileDevice,
} from "@/lib/dash/save-targets";

interface DashDownloadsProps {
  mpdUrl: string;
  title?: string;
}

export function DashDownloads({ mpdUrl, title = "video" }: DashDownloadsProps) {
  const [manifest, setManifest] = useState<DashManifest | null>(null);
  const [method, setMethod] = useState<SaveMethod | null>(null);

  useEffect(() => {
    if (isMobileDevice()) {
      return;
    }
    setMethod(
      canSaveDirectly() ? "direct" : canSaveViaBrowserStorage() ? "browser" : null
    );
    fetchDashManifest(mpdUrl)
      .then(setManifest)
      .catch(() => setManifest(null));
  }, [mpdUrl]);

  if (!manifest || !method) {
    return null;
  }

  return <DashExperimentalDownload manifest={manifest} method={method} title={title} />;
}
