# vid.txt

In-browser video and audio transcription. Drop in a file, get a transcript. Nothing leaves your device — all inference runs locally via WebGPU (fast path) or WASM (fallback). Deploys as a static site with no backend.

---

## How it works

1. **Upload** — select a video or audio file
2. **Configure** — choose a Whisper model and language
3. **Process** — audio is extracted in-browser (ffmpeg.wasm), then Whisper runs in a Web Worker
4. **Result** — timestamped transcript ready to copy or download

Supported output formats: `.txt`, `.srt`, `.vtt`, `.json`

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript 5 + Vite 5 |
| Styling | Tailwind v4 + shadcn/ui (new-york) |
| Inference | `@huggingface/transformers` v3 — Whisper via ONNX Runtime |
| Audio extraction | `@ffmpeg/ffmpeg` + `@ffmpeg/util` v0.12 |
| State | `useReducer` FSM — no external state lib |
| Deploy | Vercel (static, COOP/COEP headers required) |

---

## Models

| Model | Size | Notes |
|---|---|---|
| whisper-tiny | ~75 MB | Fastest |
| whisper-base | ~145 MB | Default |
| whisper-small | ~480 MB | Slow on first load |

Models are cached in the browser after the first download — repeat visits skip the network fetch.

---

## Running locally

```sh
pnpm install
pnpm dev
```

Open `http://localhost:5173`. Check DevTools: `crossOriginIsolated` must be `true` for SharedArrayBuffer (required by WASM threads).

```sh
pnpm build     # production bundle
pnpm preview   # serve the dist folder locally
```

---

## Privacy

All processing happens in the browser. No audio, video, or transcript data is sent to any server. The only network requests after the initial page load are model weight downloads from Hugging Face (cached after first use).

---

## Known limits

- Files longer than ~60 minutes may hit memory limits (~230 MB PCM for 60 min audio). Chunked streaming is planned for a later version.
- Safari WebGPU support varies by hardware — the app falls back to WASM automatically.
- Speaker diarization, transcript editing, translation, and batch processing are out of scope for v1.

---

## Deployment

The app requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers to enable `SharedArrayBuffer`. These are set in `vercel.json` for production and injected by Vite dev middleware locally.

```sh
vercel deploy
```
