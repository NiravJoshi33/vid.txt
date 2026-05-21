import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { TranscriptResult } from "@/workers/messages";
import { toTxt } from "@/lib/formatters";
import { DownloadMenu } from "./DownloadMenu";
import { TranscriptView } from "./TranscriptView";

type Props = {
  result: TranscriptResult;
  filename: string;
  onReset: () => void;
};

export function StepResult({ result, filename, onReset }: Props) {
  function copyToClipboard() {
    const text = toTxt(result.segments);
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard");
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-milano uppercase tracking-widest mb-1">Step Four</p>
        <h2 className="text-2xl font-semibold text-foreground">Transcript</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {result.segments.length} segment{result.segments.length !== 1 ? "s" : ""}
        </p>
      </div>

      <TranscriptView segments={result.segments} />

      <Separator />

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={copyToClipboard}>
            <Copy className="size-4" />
            Copy
          </Button>
          <DownloadMenu segments={result.segments} basename={filename} />
        </div>
        <button
          onClick={onReset}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          Transcribe another file
        </button>
      </div>
    </div>
  );
}
