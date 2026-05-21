import type { MessageIn, MessageOut, Segment } from "./messages";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let asr: any = null;
let loadedModelId: string | null = null;

function post(msg: MessageOut) {
  self.postMessage(msg);
}

async function loadModel(modelId: string) {
  if (asr && loadedModelId === modelId) {
    post({ type: "model-ready" });
    return;
  }

  const { pipeline, env } = await import("@huggingface/transformers");
  env.allowLocalModels = false;

  asr = await pipeline("automatic-speech-recognition", modelId, {
    device: typeof navigator !== "undefined" && "gpu" in navigator ? "webgpu" : "wasm",
    progress_callback: (progress: { status: string; loaded?: number; total?: number; file?: string }) => {
      if (progress.status === "progress" && progress.loaded !== undefined && progress.total !== undefined) {
        post({
          type: "model-progress",
          loaded: progress.loaded,
          total: progress.total,
          file: progress.file ?? "",
        });
      }
    },
  });

  loadedModelId = modelId;
  post({ type: "model-ready" });
}

async function transcribe(pcm: Float32Array, language?: string) {
  if (!asr) {
    post({ type: "error", message: "Model not loaded. Call load first." });
    return;
  }

  const lang = !language || language === "auto" ? undefined : language;

  const output = await asr(pcm, {
    return_timestamps: true,
    chunk_length_s: 30,
    stride_length_s: 5,
    language: lang,
  });

  type ASRChunk = { timestamp: [number, number]; text: string };
  type ASROutput = { text: string; chunks?: ASRChunk[] };
  const result = (Array.isArray(output) ? output[0] : output) as ASROutput;

  const segments: Segment[] = (result.chunks ?? []).map((chunk) => ({
    start: chunk.timestamp[0],
    end: chunk.timestamp[1],
    text: chunk.text,
  }));

  if (segments.length === 0 && result.text) {
    segments.push({ start: 0, end: 0, text: result.text });
  }

  post({ type: "transcribe-done", text: result.text, segments });
}

self.addEventListener("message", async (event: MessageEvent<MessageIn>) => {
  const msg = event.data;
  try {
    if (msg.type === "load") {
      await loadModel(msg.modelId);
    } else if (msg.type === "transcribe") {
      await transcribe(msg.pcm, msg.language);
    }
  } catch (err) {
    post({ type: "error", message: err instanceof Error ? err.message : String(err) });
  }
});
