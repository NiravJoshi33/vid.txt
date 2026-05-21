# 002 — Audio extraction via ffmpeg.wasm

**Status:** Accepted
**Date:** 2026-05-21

## Context

Whisper requires 16 kHz mono Float32 PCM. Source files are user-supplied video or audio in arbitrary containers. Two strategies were evaluated.

## Decision

Use `@ffmpeg/ffmpeg` + `@ffmpeg/util` v0.12 with the `@ffmpeg/core-mt` multi-threaded WASM build (loaded at runtime via `toBlobURL` from unpkg). The ffmpeg binary runs `-ar 16000 -ac 1 -f f32le` to produce raw float PCM.

`toBlobURL` fetches CDN resources and wraps them as blob URLs, satisfying COEP without requiring self-hosting.

## Consequences

- Handles every container the user might supply (mp4, mov, mkv, avi, webm, ogg, flac, etc.) — not limited to what browsers can natively decode.
- First-use latency: ~30 MB ffmpeg-core WASM download from unpkg. Mitigated by lazy loading (only after user clicks "Transcribe").
- Requires COOP/COEP headers (`Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp`) for SharedArrayBuffer. These are set in `vite.config.ts` (dev) and `vercel.json` (prod).
- CDN dependency at runtime: if unpkg is down, ffmpeg fails to load. Acceptable for v1.

## Alternatives considered

- **`AudioContext.decodeAudioData`:** zero bundle cost, but browser-dependent codec support. MKV with non-AAC audio and many other containers silently fail. Rejected because the error surface is too opaque and varies by browser/platform.
- **Self-hosting ffmpeg wasm in `/public/ffmpeg/`:** eliminates CDN dependency but requires copying multi-MB files during build. `toBlobURL` achieves the same COEP outcome with simpler setup.
