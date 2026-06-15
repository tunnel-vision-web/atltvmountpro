import React, { useState, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Link2Off,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Eye,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MediaLibrary from "./MediaLibrary";
import { cn } from "@/lib/utils";

export default function RichTextEditor({ value, onChange, placeholder = "Start typing here…" }) {
  const [mode, setMode] = useState("visual"); // "visual" | "html"
  const [mediaOpen, setMediaOpen] = useState(false);
  const editorRef = useRef(null);

  // Sync value from prop to editor innerHTML (only when different to prevent cursor jump)
  useEffect(() => {
    if (mode === "visual" && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value, mode]);

  const handleEditorInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command, argument = null) => {
    // Ensure editor is focused
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, argument);
    handleEditorInput();
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      execCmd("createLink", url);
    }
  };

  const handleImageSelect = (item) => {
    const imgHtml = `<img src="${item.url}" alt="${item.name || 'image'}" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 12px 0;" />`;
    
    if (mode === "visual") {
      if (editorRef.current) {
        editorRef.current.focus();
      }
      execCmd("insertHTML", imgHtml);
    } else {
      const textarea = document.getElementById("html-textarea");
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const nextValue = text.substring(0, start) + imgHtml + text.substring(end);
        onChange(nextValue);
      } else {
        onChange((value || "") + imgHtml);
      }
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm flex flex-col min-h-[300px]">
      {/* ── TOOLBAR ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/40 p-2 gap-1.5 select-none shrink-0">
        
        {/* Formatting Actions */}
        <div className="flex items-center flex-wrap gap-1">
          {mode === "visual" && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0"
                onClick={() => execCmd("bold")}
                title="Bold"
              >
                <Bold size={15} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0"
                onClick={() => execCmd("italic")}
                title="Italic"
              >
                <Italic size={15} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0"
                onClick={() => execCmd("underline")}
                title="Underline"
              >
                <Underline size={15} />
              </Button>

              <div className="h-4 w-px bg-border mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0 font-bold"
                onClick={() => execCmd("formatBlock", "<h1>")}
                title="Heading 1"
              >
                H1
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0 font-bold"
                onClick={() => execCmd("formatBlock", "<h2>")}
                title="Heading 2"
              >
                H2
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0 font-bold"
                onClick={() => execCmd("formatBlock", "<h3>")}
                title="Heading 3"
              >
                H3
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0 font-bold text-xs"
                onClick={() => execCmd("formatBlock", "<p>")}
                title="Paragraph"
              >
                P
              </Button>

              <div className="h-4 w-px bg-border mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0"
                onClick={() => execCmd("insertUnorderedList")}
                title="Bullet List"
              >
                <List size={15} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0"
                onClick={() => execCmd("insertOrderedList")}
                title="Numbered List"
              >
                <ListOrdered size={15} />
              </Button>

              <div className="h-4 w-px bg-border mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0"
                onClick={() => execCmd("justifyLeft")}
                title="Align Left"
              >
                <AlignLeft size={15} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0"
                onClick={() => execCmd("justifyCenter")}
                title="Align Center"
              >
                <AlignCenter size={15} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0"
                onClick={() => execCmd("justifyRight")}
                title="Align Right"
              >
                <AlignRight size={15} />
              </Button>

              <div className="h-4 w-px bg-border mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0"
                onClick={insertLink}
                title="Insert Link"
              >
                <Link size={15} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="h-8 w-8 p-0"
                onClick={() => execCmd("unlink")}
                title="Remove Link"
              >
                <Link2Off size={15} />
              </Button>
            </>
          )}

          {/* Image Upload / picker button */}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-8 px-2.5 flex items-center gap-1 text-primary hover:text-primary"
            onClick={() => setMediaOpen(true)}
            title="Insert Image from Library"
          >
            <Image size={15} />
            <span className="text-xs font-semibold">Add Media</span>
          </Button>
        </div>

        {/* View Mode Switching */}
        <div className="flex border border-border rounded-md p-0.5 bg-background">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1",
              mode === "visual"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye size={12} /> Visual
          </button>
          <button
            type="button"
            onClick={() => setMode("html")}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1",
              mode === "html"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Code size={12} /> HTML
          </button>
        </div>
      </div>

      {/* ── EDITOR BODY ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative bg-background/50">
        {mode === "visual" ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            className="flex-1 w-full p-4 focus:outline-none min-h-[200px] overflow-y-auto text-sm leading-relaxed prose dark:prose-invert max-w-none prose-sm"
            style={{
              minHeight: "220px",
            }}
          />
        ) : (
          <textarea
            id="html-textarea"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-xs bg-muted/20 border-0 focus:ring-0 focus:outline-none min-h-[220px] text-foreground leading-normal"
            placeholder="Edit raw HTML code here…"
          />
        )}

        {/* Placeholder if empty */}
        {(!value || value === "<br>" || value === "") && mode === "visual" && (
          <span className="absolute left-4 top-4 text-sm text-muted-foreground pointer-events-none select-none opacity-60">
            {placeholder}
          </span>
        )}
      </div>

      {/* ── MEDIA LIBRARY INTEGRATION ────────────────────────────────────────── */}
      <MediaLibrary
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={handleImageSelect}
        filter="image"
      />
    </div>
  );
}
