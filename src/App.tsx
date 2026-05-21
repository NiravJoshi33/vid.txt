import { useCallback, useEffect, useReducer, useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { reducer } from "@/lib/machine";
import type { AppEvent } from "@/lib/machine";
import { extractMonoPCM16k } from "@/lib/ffmpeg";
import type { MessageOut } from "@/workers/messages";
import { Stepper } from "./components/Stepper";
import { StepUpload } from "./components/StepUpload";
import { StepConfigure } from "./components/StepConfigure";
import { StepProcess } from "./components/StepProcess";
import { StepResult } from "./components/StepResult";

const STEPS = [
  { label: "Upload" },
  { label: "Configure" },
  { label: "Process" },
  { label: "Result" },
];

function statusToStep(status: string): number {
  switch (status) {
    case "idle":
    case "fileSelected":
      return 0;
    case "configuring":
      return 1;
    case "loadingModel":
    case "extracting":
    case "transcribing":
      return 2;
    case "done":
      return 3;
    default:
      return 0;
  }
}

export default function App() {
  const [state, rawDispatch] = useReducer(reducer, { status: "idle" });
  const workerRef = useRef<Worker | null>(null);
  const pcmRef = useRef<Float32Array | null>(null);
  // Tracks bytes per file so progress is cumulative across all model files
  const modelFilesRef = useRef<Record<string, { loaded: number; total: number }>>({});

  const dispatch = useCallback((event: AppEvent) => {
    rawDispatch(event);
  }, []);

  useEffect(() => {
    const worker = new Worker(
      new URL("./workers/transcriber.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e: MessageEvent<MessageOut>) => {
      const msg = e.data;
      switch (msg.type) {
        case "model-progress": {
          const files = modelFilesRef.current;
          files[msg.file] = { loaded: msg.loaded, total: msg.total };
          const totalLoaded = Object.values(files).reduce((s, f) => s + f.loaded, 0);
          const totalBytes = Object.values(files).reduce((s, f) => s + f.total, 0);
          const percent = totalBytes > 0 ? Math.round((totalLoaded / totalBytes) * 100) : 0;
          dispatch({ type: "MODEL_PROGRESS", percent, file: msg.file });
          break;
        }
        case "model-ready":
          dispatch({ type: "MODEL_READY" });
          break;
        case "transcribe-progress":
          dispatch({ type: "TRANSCRIBE_PROGRESS", percent: msg.percent });
          break;
        case "transcribe-done":
          dispatch({ type: "TRANSCRIBE_DONE", text: msg.text, segments: msg.segments });
          break;
        case "error":
          dispatch({ type: "ERROR", message: msg.message });
          break;
      }
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, [dispatch]);

  useEffect(() => {
    if (state.status === "loadingModel" && workerRef.current) {
      modelFilesRef.current = {};
      workerRef.current.postMessage({ type: "load", modelId: state.config.modelId });
    }
  }, [state.status]);

  useEffect(() => {
    if (state.status !== "extracting") return;

    const file = state.file;

    let cancelled = false;

    (async () => {
      try {
        const pcm = await extractMonoPCM16k(file, (percent) => {
          if (!cancelled) dispatch({ type: "EXTRACT_PROGRESS", percent });
        });

        if (cancelled) return;

        pcmRef.current = pcm;
        dispatch({ type: "EXTRACT_DONE" });
      } catch (err) {
        if (!cancelled) {
          dispatch({ type: "ERROR", message: err instanceof Error ? err.message : String(err) });
        }
      }
    })();

    return () => { cancelled = true; };
  }, [state.status]);

  useEffect(() => {
    if (state.status === "transcribing" && pcmRef.current && workerRef.current) {
      workerRef.current.postMessage({
        type: "transcribe",
        pcm: pcmRef.current,
        language: state.config.language,
      });
    }
  }, [state.status]);

  const currentStep = state.status === "error" ? statusToStep("idle") : statusToStep(state.status);

  return (
    <div className="min-h-screen bg-cararra flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold tracking-tight text-foreground">vid</span>
            <span className="text-xl font-bold tracking-tight text-milano">.txt</span>
          </div>
          <p className="text-xs text-muted-foreground">Everything stays on your device</p>
        </div>

        {/* Main card */}
        <Card className="p-8 shadow-sm">
          {/* Stepper */}
          {state.status !== "error" && (
            <div className="mb-8">
              <Stepper steps={STEPS} current={currentStep} />
            </div>
          )}

          {/* Step content */}
          {state.status === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
              <button
                onClick={() => dispatch({ type: "RESET" })}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                <RefreshCw className="size-3.5" />
                Start over
              </button>
            </div>
          )}

          {(state.status === "idle" || state.status === "fileSelected") && (
            <StepUpload
              onFile={(file) => {
                dispatch({ type: "FILE_SELECTED", file });
                dispatch({ type: "CONFIRM_FILE" });
              }}
            />
          )}

          {state.status === "configuring" && (
            <StepConfigure
              file={state.file}
              onStart={(modelId, language) =>
                dispatch({ type: "START", modelId, language })
              }
              onBack={() => dispatch({ type: "RESET" })}
            />
          )}

          {(state.status === "loadingModel" ||
            state.status === "extracting" ||
            state.status === "transcribing") && (
            <StepProcess
              state={state}
              onCancel={() => {
                workerRef.current?.terminate();
                const worker = new Worker(
                  new URL("./workers/transcriber.worker.ts", import.meta.url),
                  { type: "module" }
                );
                worker.onmessage = workerRef.current?.onmessage ?? null;
                workerRef.current = worker;
                dispatch({ type: "CANCEL" });
              }}
            />
          )}

          {state.status === "done" && (
            <StepResult
              result={state.result}
              filename={state.file.name}
              onReset={() => dispatch({ type: "RESET" })}
            />
          )}
        </Card>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
}
