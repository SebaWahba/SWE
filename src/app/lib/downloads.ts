import { videos as Video } from "./table-definitions";

const DB_NAME = "loopy-downloads-db";
const STORE_NAME = "downloads";
const DB_VERSION = 1;

export interface DownloadRecord {
  id: string;
  title: string;
  description: string;
  genre: string;
  duration: number;
  sourceUrl: string;
  downloadedAt: string;
  sizeBytes: number;
  blob: Blob;
}

interface DownloadVideoOptions {
  video: Pick<Video, "id" | "title" | "description" | "genre" | "duration"> & {
    video_file?: string;
    src?: string;
    videoUrl?: string;
  };
  onProgress?: (progressPercent: number) => void;
  onLowStorageWarning?: (message: string) => void;
}

const isBrowser = typeof window !== "undefined";

export const isDownloadSupported = () =>
  isBrowser && "indexedDB" in window && "fetch" in window && "ReadableStream" in window;

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open downloads database"));
  });

const withStore = async <T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void
): Promise<T> => {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    action(store, resolve, reject);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error("Database transaction failed"));
    };
  });
};

export const getDownloads = async (): Promise<DownloadRecord[]> =>
  withStore<DownloadRecord[]>("readonly", (store, resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as DownloadRecord[]) || []);
    req.onerror = () => reject(req.error || new Error("Failed to list downloads"));
  });

export const getDownloadedVideo = async (id: string): Promise<DownloadRecord | null> =>
  withStore<DownloadRecord | null>("readonly", (store, resolve, reject) => {
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as DownloadRecord) || null);
    req.onerror = () => reject(req.error || new Error("Failed to load downloaded video"));
  });

const saveDownload = async (record: DownloadRecord) =>
  withStore<void>("readwrite", (store, resolve, reject) => {
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error || new Error("Failed to save downloaded video"));
  });

export const deleteDownload = async (id: string) =>
  withStore<void>("readwrite", (store, resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error || new Error("Failed to delete downloaded video"));
  });

const waitForReconnect = () =>
  new Promise<void>((resolve) => {
    if (navigator.onLine) {
      resolve();
      return;
    }
    const onOnline = () => {
      window.removeEventListener("online", onOnline);
      resolve();
    };
    window.addEventListener("online", onOnline);
  });

const getTotalBytesFromHeaders = (response: Response): number | null => {
  const contentRange = response.headers.get("content-range");
  if (contentRange?.includes("/")) {
    const possibleTotal = Number(contentRange.split("/")[1]);
    if (!Number.isNaN(possibleTotal)) return possibleTotal;
  }
  const contentLength = Number(response.headers.get("content-length"));
  return Number.isNaN(contentLength) ? null : contentLength;
};

const checkStorageHeadroom = async (expectedBytes: number, onLowStorageWarning?: (message: string) => void) => {
  if (!navigator.storage?.estimate || !expectedBytes) return;
  try {
    const estimate = await navigator.storage.estimate();
    const quota = estimate.quota || 0;
    const usage = estimate.usage || 0;
    const freeBytes = quota - usage;
    if (freeBytes < expectedBytes) {
      onLowStorageWarning?.("Your device may not have enough free space for this download.");
      throw new Error("Insufficient storage for download");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Insufficient storage for download") {
      throw error;
    }
    // Keep download flow resilient even if estimate fails.
  }
};

export const downloadVideo = async ({ video, onProgress, onLowStorageWarning }: DownloadVideoOptions) => {
  if (!isDownloadSupported()) {
    throw new Error("Downloads are not supported on this device.");
  }

  const sourceUrl = video.video_file || video.src || video.videoUrl;
  if (!sourceUrl) {
    throw new Error("Missing video source URL");
  }

  const existing = await getDownloadedVideo(video.id);
  if (existing) {
    onProgress?.(100);
    return existing;
  }

  let receivedBytes = 0;
  let totalBytes: number | null = null;
  const chunks: BlobPart[] = [];
  let retries = 0;
  const maxRetries = 5;
  let mimeType = "video/mp4";

  while (true) {
    try {
      const headers: HeadersInit = {};
      if (receivedBytes > 0) {
        headers.Range = `bytes=${receivedBytes}-`;
      }

      const response = await fetch(sourceUrl, { headers });

      if (!(response.ok || response.status === 206)) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      mimeType = response.headers.get("content-type") || mimeType;
      const headerTotal = getTotalBytesFromHeaders(response);
      if (headerTotal && !totalBytes) {
        totalBytes = receivedBytes > 0 && response.status === 206 ? headerTotal : headerTotal + receivedBytes;
        await checkStorageHeadroom(totalBytes, onLowStorageWarning);
      }

      if (!response.body) {
        const blob = await response.blob();
        const fallbackRecord: DownloadRecord = {
          id: video.id,
          title: video.title,
          description: video.description,
          genre: video.genre,
          duration: video.duration,
          sourceUrl,
          downloadedAt: new Date().toISOString(),
          sizeBytes: blob.size,
          blob,
        };
        await saveDownload(fallbackRecord);
        onProgress?.(100);
        return fallbackRecord;
      }

      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          const chunkBuffer = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
          chunks.push(chunkBuffer);
          receivedBytes += value.byteLength;
          if (totalBytes && totalBytes > 0) {
            onProgress?.(Math.min(100, (receivedBytes / totalBytes) * 100));
          }
        }
      }

      if (!totalBytes || receivedBytes >= totalBytes) {
        const blob = new Blob(chunks, { type: mimeType });
        const record: DownloadRecord = {
          id: video.id,
          title: video.title,
          description: video.description,
          genre: video.genre,
          duration: video.duration,
          sourceUrl,
          downloadedAt: new Date().toISOString(),
          sizeBytes: blob.size,
          blob,
        };
        await saveDownload(record);
        onProgress?.(100);
        return record;
      }
    } catch (error) {
      retries += 1;
      if (retries > maxRetries) {
        throw error;
      }
      await waitForReconnect();
      await new Promise((resolve) => setTimeout(resolve, 500 * retries));
    }
  }
};
