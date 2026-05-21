import { AlertCircle, FileAudio, FileVideo } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { DEFAULT_MODEL, MODEL_OPTIONS } from "@/lib/models";
import { PrimaryButton } from "./PrimaryButton";

type Props = {
  file: File;
  onStart: (modelId: string, language?: string) => void;
  onBack: () => void;
};

function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function StepConfigure({ file, onStart, onBack }: Props) {
  const [modelId, setModelId] = useState(DEFAULT_MODEL.id);
  const [language, setLanguage] = useState("auto");

  const selectedModel = MODEL_OPTIONS.find((m) => m.id === modelId) ?? DEFAULT_MODEL;
  const isVideo = file.type.startsWith("video/");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-milano uppercase tracking-widest mb-1">Step Two</p>
        <h2 className="text-2xl font-semibold text-foreground">Configure</h2>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/60">
        {isVideo
          ? <FileVideo className="size-5 text-muted-foreground shrink-0" />
          : <FileAudio className="size-5 text-muted-foreground shrink-0" />}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Whisper Model</label>
          <Select value={modelId} onValueChange={setModelId}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODEL_OPTIONS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <div className="flex items-center gap-2">
                    <span>{m.label}</span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      ~{m.sizeMB} MB
                    </Badge>
                    {m.warn && (
                      <Badge variant="secondary" className="text-xs text-amber-600 bg-amber-50">
                        Slow download
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Language</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Alert className="bg-muted/50 border-border text-muted-foreground">
        <AlertCircle className="size-4" />
        <AlertDescription className="text-xs">
          The {selectedModel.label} model (~{selectedModel.sizeMB} MB) downloads once and is cached in your browser.
          Nothing leaves your device.
        </AlertDescription>
      </Alert>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          Back
        </button>
        <div className="flex-1" />
        <PrimaryButton onClick={() => onStart(modelId, language === "auto" ? undefined : language)}>
          Transcribe
        </PrimaryButton>
      </div>
    </div>
  );
}
