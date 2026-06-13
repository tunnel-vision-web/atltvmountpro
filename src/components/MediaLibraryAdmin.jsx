import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Upload,
  Trash2,
  Video,
  Images,
  Image as ImageIcon,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import MediaUploader, {
  getMediaLibrary,
  deleteMediaItem,
  MEDIA_STORAGE_KEY,
} from "./MediaUploader";

const SEED_ITEMS = [
  {
    id: "seed_1",
    name: "tv-mounting.jpg",
    type: "image",
    mimeType: "image/jpeg",
    url: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80",
    size: 0,
    uploadedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "seed_2",
    name: "drywall.jpg",
    type: "image",
    mimeType: "image/jpeg",
    url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80",
    size: 0,
    uploadedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "seed_3",
    name: "flooring.jpg",
    type: "image",
    mimeType: "image/jpeg",
    url: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&q=80",
    size: 0,
    uploadedAt: "2024-01-01T00:00:00.000Z",
  },
];

function seedLibraryIfEmpty() {
  const existing = getMediaLibrary();
  if (existing.length === 0) {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(SEED_ITEMS));
    return SEED_ITEMS;
  }
  return existing;
}

function formatSize(bytes) {
  if (!bytes || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const TABS = [
  { id: "all", label: "All Media" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
];

function MediaCell({ item, onDelete, canDelete }) {
  const [hovered, setHovered] = useState(false);

  const copyUrl = () => {
    navigator.clipboard?.writeText(item.url);
    toast.success("URL copied to clipboard.");
  };

  return (
    <div
      className="relative group rounded-xl overflow-hidden border border-border bg-card aspect-square"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {item.type === "image" ? (
        <img
          src={item.url}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted gap-2 p-2">
          <Video className="w-10 h-10 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground text-center truncate w-full px-1">
            {item.name}
          </span>
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 pt-6 pb-2">
        <p className="text-[11px] text-white truncate font-medium">{item.name}</p>
        <p className="text-[10px] text-white/60">
          {formatSize(item.size)} • {formatDate(item.uploadedAt)}
        </p>
      </div>

      {hovered && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={copyUrl}>
            Copy URL
          </Button>
          {canDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}

      <span
        className={cn(
          "absolute top-2 left-2 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded",
          item.type === "video"
            ? "bg-purple-500/80 text-white"
            : "bg-primary/80 text-primary-foreground",
        )}
      >
        {item.type}
      </span>
    </div>
  );
}

export default function MediaLibraryAdmin({ canEdit = true }) {
  const [library, setLibrary] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [showUploader, setShowUploader] = useState(true);

  useEffect(() => {
    setLibrary(seedLibraryIfEmpty());
  }, []);

  const refresh = useCallback(() => {
    setLibrary(getMediaLibrary());
  }, []);

  const handleDelete = useCallback(
    (id) => {
      if (!canEdit) return;
      if (id.startsWith("seed_")) {
        toast.error("Demo seed items cannot be deleted.");
        return;
      }
      deleteMediaItem(id);
      setLibrary((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item deleted.");
    },
    [canEdit],
  );

  const handleUploaded = useCallback(
    (items) => {
      refresh();
      toast.success(
        items.length === 1
          ? `"${items[0].name}" uploaded.`
          : `${items.length} files uploaded.`,
      );
    },
    [refresh],
  );

  const filtered = library.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const imageCount = library.filter((i) => i.type === "image").length;
  const videoCount = library.filter((i) => i.type === "video").length;
  const totalSize = library.reduce((s, i) => s + (i.size || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Media Library
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload images and videos with drag &amp; drop. Use the library picker
          anywhere images or videos are needed across the admin.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Files", value: library.length, icon: HardDrive },
          { label: "Images", value: imageCount, icon: ImageIcon },
          { label: "Videos", value: videoCount, icon: Video },
          { label: "Storage Used", value: formatSize(totalSize), icon: Images },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {canEdit && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Upload Files</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowUploader((v) => !v)}
            >
              <Upload className="w-3.5 h-3.5" />
              {showUploader ? "Hide Uploader" : "Show Uploader"}
            </Button>
          </div>
          {showUploader && (
            <MediaUploader
              onUploaded={handleUploaded}
              accept="all"
              multiple
            />
          )}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-border">
          <div className="flex gap-1 border border-border rounded-lg p-0.5 bg-muted/40">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename…"
              className="pl-8 h-9 text-sm bg-muted/40"
            />
          </div>
          <span className="text-xs text-muted-foreground sm:ml-auto">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="p-5">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((item) => (
                <MediaCell
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  canDelete={canEdit}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Images className="w-12 h-12 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                No media found
              </p>
              {canEdit && !search && (
                <Button size="sm" onClick={() => setShowUploader(true)}>
                  <Upload className="w-3.5 h-3.5" />
                  Upload files
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
