# 001 — Use @huggingface/transformers for Whisper inference

**Status:** Accepted
**Date:** 2026-05-21

## Context

We need in-browser ASR with no backend. Three options were evaluated: transformers.js v3, whisper.cpp compiled to WASM, and the whisper-web reference fork.

## Decision

Use `@huggingface/transformers` v3 with `Xenova/whisper-*` ONNX models in a dedicated Web Worker. Uses WebGPU when available, falls back to WASM (ONNX Runtime).

## Consequences

- Model switching is a single string id; models are automatically cached in browser Cache Storage after first download — no IndexedDB code to write.
- WebGPU path gives ~3–5× speedup on M-series and recent NVIDIA vs WASM.
- Models are hosted on HuggingFace Hub; requires network on first run (acceptable).
- Locks inference to ONNX format — not a concern since all Whisper variants are available.

## Alternatives considered

- **whisper.cpp WASM:** smaller runtime, no WebGPU path, harder model packaging, less active. No material benefit for this use case.
- **whisper-web fork:** essentially transformers.js underneath, adds maintenance overhead with no upside.
