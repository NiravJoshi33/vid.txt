import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { AppState } from "@/lib/machine";

type Props = {
  state: AppState & { status: "loadingModel" | "extracting" | "transcribing" };
  onCancel: () => void;
};

function PhaseRow({
  label,
  detail,
  percent,
  indeterminate,
  active,
  done,
}: {
  label: string;
  detail?: string;
  percent?: number;
  indeterminate?: boolean;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {active && <Loader2 className="size-4 text-milano animate-spin shrink-0" />}
          <span className={active ? "font-medium text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/50"}>
            {label}
          </span>
          {detail && active && (
            <span className="text-xs text-muted-foreground truncate max-w-48">{detail}</span>
          )}
        </div>
        {active && percent !== undefined && !indeterminate && (
          <span className="text-xs tabular-nums text-muted-foreground">{percent}%</span>
        )}
        {done && <span className="text-xs text-muted-foreground">Done</span>}
      </div>
      {active && indeterminate && (
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
          <div className="absolute inset-y-0 w-1/3 rounded-full bg-primary animate-[shimmer_1.5s_ease-in-out_infinite]" />
        </div>
      )}
      {active && !indeterminate && percent !== undefined && (
        <Progress value={percent} className="h-1.5" />
      )}
    </div>
  );
}

export function StepProcess({ state, onCancel }: Props) {
  const isLoadingModel = state.status === "loadingModel";
  const isExtracting = state.status === "extracting";
  const isTranscribing = state.status === "transcribing";

  const modelPercent = isLoadingModel ? state.modelPercent : undefined;

  const modelDone = isExtracting || isTranscribing;
  const extractDone = isTranscribing;

  let statusLine = "";
  if (isLoadingModel) statusLine = "Downloading Whisper model…";
  if (isExtracting) statusLine = "Extracting audio…";
  if (isTranscribing) statusLine = "Transcribing…";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-milano uppercase tracking-widest mb-1">Step Three</p>
        <h2 className="text-2xl font-semibold text-foreground">Processing</h2>
        <p className="text-sm text-muted-foreground mt-1">{statusLine}</p>
      </div>

      <div className="space-y-5 py-2">
        <PhaseRow
          label="Load model"
          detail={isLoadingModel ? state.modelFile : undefined}
          percent={modelPercent}
          active={isLoadingModel}
          done={modelDone}
        />
        <PhaseRow
          label="Extract audio"
          percent={isExtracting ? state.extractPercent : undefined}
          active={isExtracting}
          done={extractDone}
        />
        <PhaseRow
          label="Transcribe"
          percent={isTranscribing ? state.transcribePercent : undefined}
          indeterminate={isTranscribing}
          active={isTranscribing}
          done={false}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
