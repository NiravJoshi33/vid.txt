# 001 — Client-side video/audio transcription

**Status:** Done
**Owner:** blockchainwebdir@gmail.com
**Created:** 2026-05-21

## Why

A private, no-upload transcription tool. Drop in a video or audio file, get a transcript. Nothing leaves the device; all inference runs in the browser via WebGPU (fast) or WASM (fallback). Deploys as a static site.

## What

A single-page React app with a 4-step flow: Upload → Configure → Process → Result.

For video inputs, audio is extracted in-browser via ffmpeg.wasm. Whisper (transformers.js) runs in a Web Worker to keep the UI responsive. The transcript is displayed with timestamps and offered as .txt / .srt / .vtt / .json downloads.

**Out of scope (v1):** speaker diarization, transcript editing, translation, multi-file batch, mobile-first polish, PWA/offline shell, UI i18n.

## How

### Stack
- **Vite 5 + React 18 + TypeScript 5** — standard SPA toolchain.
- **Tailwind v4 + shadcn/ui (new-york style)** — CSS-first, `@theme inline` in `src/index.css`. Theme: Milano Red `#BB080B` (primary) on Cararra `#F0EDE8` (background).
- **`@huggingface/transformers` v3** — Whisper via ONNX Runtime. WebGPU when available, WASM fallback. See ADR-001.
- **`@ffmpeg/ffmpeg` + `@ffmpeg/util` v0.12** — universal audio/video extraction. See ADR-002.
- **`useReducer` FSM** — no external state lib. States: `idle → fileSelected → configuring → loadingModel → extracting → transcribing → done` (plus `error`).

### Key files
| File | Purpose |
|------|---------|
| `src/lib/machine.ts` | FSM reducer, all states and events |
| `src/workers/transcriber.worker.ts` | Whisper pipeline, model caching, progress events |
| `src/workers/messages.ts` | Typed worker message protocol |
| `src/lib/ffmpeg.ts` | `extractMonoPCM16k(file)` → `Float32Array` at 16 kHz mono |
| `src/lib/formatters.ts` | `toTxt`, `toSrt`, `toVtt`, `toJson` |
| `src/App.tsx` | Root: worker lifecycle, FSM wiring, step routing |
| `src/components/Stepper.tsx` | Top numbered pills (red active, checkmark done) |
| `src/components/StepProcess.tsx` | Three-phase progress display |
| `src/components/StepResult.tsx` | Transcript + copy + download menu |
| `vite.config.ts` | COOP/COEP dev headers + Tailwind v4 plugin |
| `vercel.json` | COOP/COEP production headers |

### Worker message protocol
```ts
type MessageIn =
  | { type: "load"; modelId: string }
  | { type: "transcribe"; pcm: Float32Array; language?: string };

type MessageOut =
  | { type: "model-progress"; loaded: number; total: number; file: string }
  | { type: "model-ready" }
  | { type: "transcribe-progress"; percent: number }
  | { type: "transcribe-done"; text: string; segments: Segment[] }
  | { type: "error"; message: string };
```

### Model options
| Model | Size | Notes |
|-------|------|-------|
| Xenova/whisper-tiny | ~75 MB | Fastest |
| Xenova/whisper-base | ~145 MB | **Default** |
| Xenova/whisper-small | ~480 MB | Slow download warning |

## Acceptance criteria

- [x] `pnpm build` produces a clean dist bundle.
- [ ] `pnpm dev` — DevTools console: `crossOriginIsolated === true`.
- [ ] Upload mp3 → transcript with timestamped segments appears.
- [ ] Upload mp4 → ffmpeg extraction runs → same transcript output.
- [ ] All four download formats produce valid files (SRT, VTT, TXT, JSON).
- [ ] Copy-to-clipboard shows a sonner toast.
- [ ] Model loads from Cache Storage on repeat visit (no network fetch in DevTools).
- [ ] Cancel during processing returns to Upload step cleanly.
- [ ] Vercel deploy: production page is cross-origin isolated.

## Risks

- **Model download size** (75–480 MB first run). Mitigated by tiny option, "cached" alert, live progress.
- **Long-file memory** (~230 MB PCM for 60 min audio). Documented cap; chunked streaming is v2.
- **COOP/COEP scope** breaks 3rd-party iframes. App is self-contained so impact is contained.
- **Safari WebGPU** not GA on all hardware; auto-falls back to WASM.
