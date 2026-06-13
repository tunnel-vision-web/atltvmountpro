import React, { useState, useRef, useCallback } from 'react';
import { Loader2, Upload, CheckCircle2, X, Image, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Storage helpers ────────────────────────────────────────────────────────

export const MEDIA_STORAGE_KEY = 'atltv_media_library';

export function getMediaLibrary() {
  try {
    const raw = localStorage.getItem(MEDIA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMediaItem(item) {
  const library = getMediaLibrary();
  const updated = [item, ...library];
  localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteMediaItem(id) {
  const library = getMediaLibrary();
  const updated = library.filter((item) => item.id !== id);
  localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

// ─── MIME / accept helpers ───────────────────────────────────────────────────

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

function getAcceptedMimes(accept) {
  if (accept === 'image') return IMAGE_MIMES;
  if (accept === 'video') return VIDEO_MIMES;
  return [...IMAGE_MIMES, ...VIDEO_MIMES];
}

function mimeToType(mimeType) {
  if (IMAGE_MIMES.includes(mimeType)) return 'image';
  if (VIDEO_MIMES.includes(mimeType)) return 'video';
  return 'image';
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateId() {
  return `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Per-file status item ────────────────────────────────────────────────────

function UploadStatusRow({ file }) {
  const isImage = IMAGE_MIMES.includes(file.mimeType);

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/50 border border-border">
      <span className="text-muted-foreground shrink-0">
        {isImage ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
      </span>
      <span className="text-sm text-foreground truncate flex-1 min-w-0">{file.name}</span>
      <span className="text-xs text-muted-foreground shrink-0">{formatSize(file.size)}</span>
      <span className="shrink-0">
        {file.status === 'uploading' && (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        )}
        {file.status === 'done' && (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        )}
        {file.status === 'error' && (
          <X className="w-4 h-4 text-destructive" />
        )}
      </span>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function MediaUploader({
  onUploaded,
  accept = 'all',
  multiple = true,
  compact = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const inputRef = useRef(null);
  const acceptedMimes = getAcceptedMimes(accept);

  // Build the HTML accept string for the file input
  const inputAccept = acceptedMimes.join(',');

  const processFiles = useCallback(
    async (files) => {
      const fileArray = Array.from(files);
      if (!multiple && fileArray.length > 1) {
        toast.error('Only one file can be uploaded at a time.');
        return;
      }

      // Filter and validate
      const valid = [];
      for (const file of fileArray) {
        if (!acceptedMimes.includes(file.type)) {
          toast.error(`"${file.name}" is not an accepted file type.`);
          continue;
        }
        if (file.size > MAX_SIZE_BYTES) {
          toast.error(`"${file.name}" exceeds the 50 MB size limit.`);
          continue;
        }
        valid.push(file);
      }

      if (!valid.length) return;

      // Initialise status entries
      const entries = valid.map((file) => ({
        id: generateId(),
        name: file.name,
        size: file.size,
        mimeType: file.type,
        status: 'uploading',
        result: null,
      }));

      setUploadQueue((prev) => [...entries, ...prev]);

      // Read each file as dataURL
      const savedItems = [];
      for (const entry of entries) {
        const file = valid.find((f) => f.name === entry.name && f.size === entry.size);
        try {
          const dataURL = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('FileReader error'));
            reader.readAsDataURL(file);
          });

          const item = {
            id: entry.id,
            name: entry.name,
            type: mimeToType(entry.mimeType),
            mimeType: entry.mimeType,
            url: dataURL,
            size: entry.size,
            uploadedAt: new Date().toISOString(),
          };
          saveMediaItem(item);
          savedItems.push(item);

          setUploadQueue((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, status: 'done' } : e))
          );
        } catch {
          setUploadQueue((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, status: 'error' } : e))
          );
          toast.error(`Failed to process "${entry.name}".`);
        }
      }

      if (savedItems.length > 0 && typeof onUploaded === 'function') {
        onUploaded(savedItems);
      }
    },
    [accept, acceptedMimes, multiple, onUploaded]
  );

  // ── Drag handlers ──
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };
  const onInputChange = (e) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
      // Reset so the same file can be re-selected
      e.target.value = '';
    }
  };

  const dropZoneHeight = compact ? 'py-4' : 'py-10';
  const iconSize = compact ? 'w-6 h-6' : 'w-10 h-10';

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload files"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'relative flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed cursor-pointer transition-colors select-none',
          dropZoneHeight,
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={inputAccept}
          multiple={multiple}
          className="hidden"
          onChange={onInputChange}
        />

        <Upload
          className={cn(
            iconSize,
            'mb-2',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )}
        />

        {!compact && (
          <>
            <p className="text-sm font-medium text-foreground">
              Drag &amp; drop files here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept === 'image' && 'Images only (JPEG, PNG, WebP, GIF, SVG) — max 50 MB'}
              {accept === 'video' && 'Videos only (MP4, WebM, OGG, MOV) — max 50 MB'}
              {accept === 'all' && 'Images &amp; videos — max 50 MB each'}
            </p>
          </>
        )}

        {compact && (
          <p className="text-xs text-muted-foreground">Click or drop to upload</p>
        )}
      </div>

      {/* Upload progress list */}
      {uploadQueue.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
          {uploadQueue.map((entry) => (
            <UploadStatusRow key={entry.id} file={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
