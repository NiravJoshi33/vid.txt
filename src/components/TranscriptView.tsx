import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Segment } from "@/workers/messages";
import { formatTimestamp } from "@/lib/time";

type Props = {
  segments: Segment[];
};

export function TranscriptView({ segments }: Props) {
  const [mode, setMode] = useState<"plain" | "segments">("segments");

  const plainText = segments.map((s) => s.text.trim()).join(" ");

  return (
    <div className="space-y-3">
      <div className="flex gap-1 bg-muted/60 p-1 rounded-lg w-fit">
        {(["segments", "plain"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors",
              mode === m
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "segments" ? "Timestamped" : "Plain text"}
          </button>
        ))}
      </div>

      {mode === "plain" ? (
        <div className="bg-muted/40 rounded-xl p-4 text-sm leading-relaxed max-h-80 overflow-y-auto">
          {plainText || <span className="text-muted-foreground italic">No transcript content.</span>}
        </div>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
          {segments.map((seg, i) => (
            <div key={i} className="flex gap-3 text-sm py-1.5 px-3 rounded-lg hover:bg-muted/40 group">
              <span className="text-xs text-milano font-mono tabular-nums mt-0.5 shrink-0">
                {formatTimestamp(seg.start)}
              </span>
              <span className="leading-relaxed">{seg.text.trim()}</span>
            </div>
          ))}
          {segments.length === 0 && (
            <p className="text-sm text-muted-foreground italic p-3">No segments returned.</p>
          )}
        </div>
      )}
    </div>
  );
}
