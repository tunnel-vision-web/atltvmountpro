import React, { useState, useEffect, useCallback } from 'react';
import { Search, Upload, Trash2, Video, X, Images } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import MediaUploader, {
  getMediaLibrary,
  deleteMediaItem,
  MEDIA_STORAGE_KEY,
} from './MediaUploader';

// ─── Unsplash seed items ─────────────────────────────────────────────────────

const SEED_ITEMS = [
  {
    id: 'seed_1',
    name: 'tv-mounting.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
    size: 0,
    uploadedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_2',
    name: 'drywall.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',
    size: 0,
    uploadedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_3',
    name: 'flooring.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&q=80',
    size: 0,
    uploadedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_4',
    name: 'tv-room.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1698047945367-112339b04d51?w=800&q=80',
    size: 0,
    uploadedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_5',
    name: 'painting.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1629195352955-850830e4d6c9?w=800&q=80',
    size: 0,
    uploadedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'seed_6',
    name: 'handyman.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&q=80',
    size: 0,
    uploadedAt: '2024-01-01T00:00:00.000Z',
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Grid cell ────────────────────────────────────────────────────────────────

function MediaCell({ item, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative group rounded-md overflow-hidden border border-border bg-muted aspect-square cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      {item.type === 'image' ? (
        <img
          src={item.url}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted gap-1">
          <Video className="w-8 h-8 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground px-1 text-center truncate w-full">
            {item.name}
          </span>
        </div>
      )}

      {/* Bottom bar (always visible) */}
      <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-1 flex items-center gap-1">
        <span className="text-[10px] text-white truncate flex-1 min-w-0">{item.name}</span>
        <span className="text-[10px] text-white/60 shrink-0">{formatSize(item.size)}</span>
      </div>

      {/* Hover overlay */}
      {hovered && (
        <div className="absolute inset-0 border-2 border-primary rounded-md pointer-events-none" />
      )}

      {/* "Use" button on hover */}
      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item);
          }}
          className="absolute inset-0 flex items-center justify-center"
          aria-label={`Use ${item.name}`}
        >
          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg pointer-events-auto">
            Use
          </span>
        </button>
      )}

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item.id);
        }}
        aria-label={`Delete ${item.name}`}
        className={cn(
          'absolute top-1 right-1 p-1 rounded bg-black/60 text-white hover:bg-destructive transition-colors',
          hovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Videos' },
];

function FilterTabs({ active, onChange }) {
  return (
    <div className="flex gap-1 border border-border rounded-md p-0.5 bg-muted/40">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded transition-colors',
            active === tab.id
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MediaLibrary({ open, onClose, onSelect, filter = 'all' }) {
  const [library, setLibrary] = useState([]);
  const [activeTab, setActiveTab] = useState(filter);
  const [search, setSearch] = useState('');
  const [showUploader, setShowUploader] = useState(false);

  // Load / seed library whenever the dialog opens
  useEffect(() => {
    if (open) {
      setLibrary(seedLibraryIfEmpty());
      setActiveTab(filter);
      setSearch('');
      setShowUploader(false);
    }
  }, [open, filter]);

  const refresh = useCallback(() => {
    setLibrary(getMediaLibrary());
  }, []);

  const handleDelete = useCallback((id) => {
    deleteMediaItem(id);
    setLibrary((prev) => prev.filter((item) => item.id !== id));
    toast.success('Item deleted from library.');
  }, []);

  const handleUploaded = useCallback(
    (items) => {
      refresh();
      setShowUploader(false);
      toast.success(
        items.length === 1
          ? `"${items[0].name}" uploaded successfully.`
          : `${items.length} files uploaded successfully.`
      );
    },
    [refresh]
  );

  const handleSelect = useCallback(
    (item) => {
      if (typeof onSelect === 'function') onSelect(item);
      if (typeof onClose === 'function') onClose();
    },
    [onSelect, onClose]
  );

  // Filtered + searched items
  const filtered = library.filter((item) => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent
        className={cn(
          'w-full max-w-4xl p-0 overflow-hidden flex flex-col bg-card border-border',
          'max-h-[85vh]'
        )}
      >
        {/* Header */}
        <DialogHeader className="flex-row items-center justify-between px-5 py-4 border-b border-border shrink-0 space-y-0">
          <DialogTitle className="text-base font-semibold text-foreground">
            Media Library
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showUploader ? 'secondary' : 'default'}
              onClick={() => setShowUploader((v) => !v)}
            >
              <Upload className="w-3.5 h-3.5" />
              {showUploader ? 'Cancel Upload' : 'Upload'}
            </Button>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 hover:opacity-100 text-foreground transition-opacity focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0">
          <FilterTabs active={activeTab} onChange={setActiveTab} />
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files…"
              className="pl-8 h-8 text-sm bg-muted/40 border-border"
            />
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          {/* Inline uploader */}
          {showUploader && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <MediaUploader
                onUploaded={handleUploaded}
                accept="all"
                multiple
                compact={false}
              />
            </div>
          )}

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {filtered.map((item) => (
                <MediaCell
                  key={item.id}
                  item={item}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Images className="w-12 h-12 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No media found</p>
              {search && (
                <p className="text-xs text-muted-foreground/70">
                  No files match &ldquo;{search}&rdquo;
                </p>
              )}
              {!search && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowUploader(true)}
                  className="mt-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload your first file
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
