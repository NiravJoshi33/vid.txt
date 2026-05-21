import { useState, useRef, useEffect } from "react";
import { Download } from "lucide-react";
import { toJson, toSrt, toTxt, toVtt } from "@/lib/formatters";
import { triggerDownload } from "@/lib/download";
import type { Segment } from "@/workers/messages";

type Props = {
  segments: Segment[];
  basename: string;
};

export function DownloadMenu({ segments, basename }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const name = basename.replace(/\.[^.]+$/, "");

  const downloads = [
    { label: "Plain text (.txt)", ext: "txt", mime: "text/plain", content: () => toTxt(segments) },
    { label: "Subtitles (.srt)", ext: "srt", mime: "text/plain", content: () => toSrt(segments) },
    { label: "WebVTT (.vtt)", ext: "vtt", mime: "text/vtt", content: () => toVtt(segments) },
    { label: "JSON (.json)", ext: "json", mime: "application/json", content: () => toJson(segments) },
  ];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
      >
        <Download className="size-4" />
        Download
      </button>

      {open && (
        <div className="absolute bottom-full right-0 z-50 mb-1 min-w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {downloads.map((d) => (
            <button
              key={d.ext}
              className="w-full cursor-default rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setOpen(false);
                triggerDownload(new Blob([d.content()], { type: d.mime }), `${name}.${d.ext}`);
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
