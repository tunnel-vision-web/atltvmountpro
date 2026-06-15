import React, { useState } from 'react';
import { Images, Video, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import MediaLibrary from './MediaLibrary';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i;

function looksLikeImage(value) {
  if (!value) return false;
  if (value.startsWith('data:image')) return true;
  if (value.includes('unsplash.com')) return true;
  return IMAGE_EXTENSIONS.test(value);
}

function looksLikeVideo(value) {
  if (!value) return false;
  if (value.startsWith('data:video')) return true;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(value);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MediaPickerButton({
  value,
  onChange,
  accept = 'all',
  label,
  placeholder,
  className,
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);

  const handleSelect = (item) => {
    if (typeof onChange === 'function') {
      onChange(item.url);
    }
  };

  const handleInputChange = (e) => {
    if (typeof onChange === 'function') {
      onChange(e.target.value);
    }
  };

  const showImagePreview = looksLikeImage(value);
  const showVideoPreview = !showImagePreview && looksLikeVideo(value);

  return (
    <div className={cn('space-y-1.5', className)}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      {/* Input row */}
      <div className="flex gap-2 items-center">
        <Input
          type="text"
          value={value ?? ''}
          onChange={handleInputChange}
          placeholder={placeholder ?? 'Enter URL or browse library…'}
          className="flex-1 bg-muted/40 border-border text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setLibraryOpen(true)}
          className="shrink-0 border-border"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Browse Library
        </Button>
      </div>

      {/* Preview */}
      {(showImagePreview || showVideoPreview) && (
        <div className="flex items-center gap-2 mt-1">
          {showImagePreview ? (
            <div className="w-16 h-16 rounded-md border border-border overflow-hidden shrink-0 bg-muted">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-md border border-border flex items-center justify-center bg-muted shrink-0">
              <Video className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            {showImagePreview && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Images className="w-3 h-3" />
                Image preview
              </span>
            )}
            {showVideoPreview && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Video className="w-3 h-3" />
                Video file
              </span>
            )}
            <p className="text-xs text-muted-foreground/70 truncate max-w-[240px] mt-0.5">
              {value}
            </p>
          </div>
        </div>
      )}

      {/* Media Library modal */}
      <MediaLibrary
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={handleSelect}
        filter={accept}
      />
    </div>
  );
}
