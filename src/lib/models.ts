export type ModelOption = {
  id: string;
  label: string;
  sizeMB: number;
  default?: boolean;
  warn?: boolean;
};

export const MODEL_OPTIONS: ModelOption[] = [
  { id: "Xenova/whisper-tiny", label: "Tiny", sizeMB: 75 },
  { id: "Xenova/whisper-base", label: "Base", sizeMB: 145, default: true },
  { id: "Xenova/whisper-small", label: "Small", sizeMB: 480, warn: true },
];

export const DEFAULT_MODEL = MODEL_OPTIONS.find((m) => m.default)!;
