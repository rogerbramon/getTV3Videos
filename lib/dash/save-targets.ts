export interface SaveTarget {
  writable: FileSystemWritableFileStream;
  // Resolves to a URL the user must open to save the file, or null when the
  // file is already in its final place.
  complete: () => Promise<string | null>;
}

interface SaveFilePickerWindow {
  showSaveFilePicker: (options: {
    suggestedName: string;
    types: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<FileSystemFileHandle>;
}

const TEMPORARY_DIRECTORY = "dash-downloads";

let temporaryFileUrl: string | null = null;

function hasSaveFilePicker(
  target: Window
): target is Window & SaveFilePickerWindow {
  return "showSaveFilePicker" in target;
}

// iPadOS reports itself as a Mac, so touch support is what gives it away.
export function isMobileDevice(): boolean {
  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  );
}

export function canSaveDirectly(): boolean {
  return hasSaveFilePicker(window);
}

export function canSaveViaBrowserStorage(): boolean {
  return (
    typeof navigator.storage?.getDirectory === "function" &&
    typeof FileSystemFileHandle !== "undefined" &&
    "createWritable" in FileSystemFileHandle.prototype
  );
}

export async function openDirectSaveTarget(
  name: string
): Promise<SaveTarget | null> {
  if (!hasSaveFilePicker(window)) {
    return null;
  }

  let handle: FileSystemFileHandle;
  try {
    handle = await window.showSaveFilePicker({
      suggestedName: name,
      types: [{ description: "Vídeo MP4", accept: { "video/mp4": [".mp4"] } }],
    });
  } catch {
    return null;
  }

  return {
    writable: await handle.createWritable(),
    complete: async () => null,
  };
}

export async function clearTemporaryFiles(): Promise<void> {
  if (temporaryFileUrl) {
    URL.revokeObjectURL(temporaryFileUrl);
    temporaryFileUrl = null;
  }
  const root = await navigator.storage.getDirectory();
  await root
    .removeEntry(TEMPORARY_DIRECTORY, { recursive: true })
    .catch(() => {});
}

export async function availableBrowserStorage(): Promise<number> {
  const { quota = 0, usage = 0 } = await navigator.storage.estimate();
  return quota - usage;
}

// The file is assembled in the origin private file system (on disk, not in
// memory) and then handed to the browser as a regular download.
export async function openBrowserStorageTarget(): Promise<SaveTarget> {
  await clearTemporaryFiles();
  const root = await navigator.storage.getDirectory();
  const directory = await root.getDirectoryHandle(TEMPORARY_DIRECTORY, {
    create: true,
  });
  const handle = await directory.getFileHandle("download.mp4", {
    create: true,
  });

  return {
    writable: await handle.createWritable(),
    complete: async () => {
      temporaryFileUrl = URL.createObjectURL(await handle.getFile());
      return temporaryFileUrl;
    },
  };
}
