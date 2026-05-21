export type Segment = {
  start: number;
  end: number;
  text: string;
};

export type TranscriptResult = {
  text: string;
  segments: Segment[];
};

export type MessageIn =
  | { type: "load"; modelId: string }
  | { type: "transcribe"; pcm: Float32Array; language?: string };

export type MessageOut =
  | { type: "model-progress"; loaded: number; total: number; file: string }
  | { type: "model-ready" }
  | { type: "transcribe-progress"; percent: number }
  | { type: "transcribe-done"; text: string; segments: Segment[] }
  | { type: "error"; message: string };
