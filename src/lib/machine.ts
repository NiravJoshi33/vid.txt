import type { Segment, TranscriptResult } from "@/workers/messages";

export type Config = {
  modelId: string;
  language?: string;
};

export type AppState =
  | { status: "idle" }
  | { status: "fileSelected"; file: File }
  | { status: "configuring"; file: File }
  | {
      status: "loadingModel";
      file: File;
      config: Config;
      modelPercent: number;
      modelFile: string;
    }
  | { status: "extracting"; file: File; config: Config; extractPercent: number }
  | {
      status: "transcribing";
      file: File;
      config: Config;
      transcribePercent: number;
    }
  | { status: "done"; file: File; config: Config; result: TranscriptResult }
  | { status: "error"; file: File | null; message: string };

export type AppEvent =
  | { type: "FILE_SELECTED"; file: File }
  | { type: "CONFIRM_FILE" }
  | { type: "START"; modelId: string; language?: string }
  | { type: "MODEL_PROGRESS"; percent: number; file: string }
  | { type: "MODEL_READY" }
  | { type: "EXTRACT_PROGRESS"; percent: number }
  | { type: "TRANSCRIBE_PROGRESS"; percent: number }
  | { type: "EXTRACT_DONE" }
  | { type: "TRANSCRIBE_DONE"; text: string; segments: Segment[] }
  | { type: "ERROR"; message: string }
  | { type: "CANCEL" }
  | { type: "RESET" };

export function reducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case "FILE_SELECTED":
      return { status: "fileSelected", file: event.file };

    case "CONFIRM_FILE":
      if (state.status !== "fileSelected") return state;
      return { status: "configuring", file: state.file };

    case "START":
      if (state.status !== "configuring") return state;
      return {
        status: "loadingModel",
        file: state.file,
        config: { modelId: event.modelId, language: event.language },
        modelPercent: 0,
        modelFile: "",
      };

    case "MODEL_PROGRESS":
      if (state.status !== "loadingModel") return state;
      return {
        ...state,
        modelPercent: event.percent,
        modelFile: event.file,
      };

    case "MODEL_READY":
      if (state.status !== "loadingModel") return state;
      return { status: "extracting", file: state.file, config: state.config, extractPercent: 0 };

    case "EXTRACT_PROGRESS":
      if (state.status !== "extracting") return state;
      return { ...state, extractPercent: event.percent };

    case "EXTRACT_DONE":
      if (state.status !== "extracting") return state;
      return { status: "transcribing", file: state.file, config: state.config, transcribePercent: 0 };

    case "TRANSCRIBE_PROGRESS":
      if (state.status !== "transcribing") return state;
      return { ...state, transcribePercent: event.percent };

    case "TRANSCRIBE_DONE":
      if (state.status !== "transcribing") return state;
      return {
        status: "done",
        file: state.file,
        config: state.config,
        result: { text: event.text, segments: event.segments },
      };

    case "ERROR":
      return {
        status: "error",
        file: "file" in state ? state.file : null,
        message: event.message,
      };

    case "CANCEL":
    case "RESET":
      return { status: "idle" };

    default:
      return state;
  }
}
