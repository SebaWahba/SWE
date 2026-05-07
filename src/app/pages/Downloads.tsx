import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { deleteDownload, getDownloadedVideo, getDownloads, type DownloadRecord } from "../lib/downloads";
import { Play, Trash2, Download } from "lucide-react";
import { toast } from "sonner";

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export default function Downloads() {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const activeDownload = useMemo(
    () => downloads.find((item) => item.id === activeId) || downloads[0] || null,
    [downloads, activeId]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const list = await getDownloads();
        const sorted = list.sort(
          (a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
        );
        setDownloads(sorted);
        if (!activeId && sorted.length > 0) {
          setActiveId(sorted[0].id);
        }
      } catch (error) {
        toast.error("Failed to load downloads.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const createPlaybackUrl = async () => {
      if (!activeDownload) {
        setActiveUrl(null);
        return;
      }

      const latest = await getDownloadedVideo(activeDownload.id);
      if (!latest) {
        setActiveUrl(null);
        return;
      }
      const nextUrl = URL.createObjectURL(latest.blob);
      setActiveUrl(nextUrl);
    };

    createPlaybackUrl().catch(() => {
      toast.error("Unable to prepare this download for playback.");
    });
  }, [activeDownload?.id]);

  useEffect(() => {
    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [activeUrl]);

  const handleDelete = async (id: string) => {
    const item = downloads.find((download) => download.id === id);
    if (!item) return;
    const confirmed = window.confirm(`Delete "${item.title}" from downloads?`);
    if (!confirmed) return;

    try {
      await deleteDownload(id);
      const remaining = downloads.filter((download) => download.id !== id);
      setDownloads(remaining);
      if (id === activeId) {
        setActiveId(remaining[0]?.id || null);
      }
      toast.success("Download deleted.");
    } catch {
      toast.error("Failed to delete download.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-4 py-24">
        <div className="flex items-center gap-3 mb-8">
          <Download className="text-purple-400" />
          <h1 className="text-3xl font-bold">Downloads</h1>
        </div>

        {isLoading ? (
          <div className="text-gray-400">Loading downloads...</div>
        ) : downloads.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-gray-300">
            No downloads yet. Open a title and tap Download.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              {activeUrl ? (
                <video
                  src={activeUrl}
                  controls
                  className="w-full rounded-xl bg-black"
                  controlsList="nodownload"
                  preload="metadata"
                />
              ) : (
                <div className="aspect-video flex items-center justify-center text-gray-400">
                  Select a downloaded video to play.
                </div>
              )}
              {activeDownload && (
                <div className="mt-4">
                  <h2 className="text-xl font-semibold">{activeDownload.title}</h2>
                  <p className="text-gray-400 text-sm mt-1">{activeDownload.description}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {downloads.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 ${
                    item.id === activeDownload?.id
                      ? "border-purple-500/70 bg-purple-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <button
                    onClick={() => setActiveId(item.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{formatSize(item.sizeBytes)}</p>
                      </div>
                      <Play className="w-4 h-4 text-gray-300" />
                    </div>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="mt-3 inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
