import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ACCEPTED_MIME = [
  "audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "audio/flac",
  "audio/webm", "audio/aac", "audio/x-m4a",
  "video/mp4", "video/webm", "video/quicktime", "video/x-matroska",
  "video/avi", "video/x-msvideo",
];

type Props = {
  onFile: (file: File) => void;
};

export function StepUpload({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(file: File): string | null {
    if (!ACCEPTED_MIME.includes(file.type) && !file.name.match(/\.(mp3|mp4|wav|ogg|flac|webm|m4a|aac|mov|mkv|avi)$/i)) {
      return "Unsupported file type. Please upload a video or audio file.";
    }
    if (file.size > 2 * 1024 * 1024 * 1024) {
      return "File too large. Maximum size is 2 GB.";
    }
    return null;
  }

  function handleFile(file: File) {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError(null);
    onFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-milano uppercase tracking-widest mb-1">Step One</p>
        <h2 className="text-2xl font-semibold text-foreground">Upload Your File</h2>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-colors select-none",
          dragging ? "border-milano bg-milano/5" : "border-border hover:border-milano/50 hover:bg-muted/40"
        )}
      >
        <div className="size-14 rounded-full bg-muted flex items-center justify-center">
          <Upload className="size-7 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">Drop a file here, or <span className="text-milano underline">browse</span></p>
          <p className="text-sm text-muted-foreground mt-1">Video or audio — mp4, mp3, wav, webm, m4a, mkv, and more</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*,video/*"
        className="hidden"
        onChange={onInputChange}
      />

      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}
    </div>
  );
}
