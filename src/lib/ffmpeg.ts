import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

const BASE_URL = "https://unpkg.com/@ffmpeg/core-mt@0.12.9/dist/esm";

async function loadFfmpeg(onProgress?: (percent: number) => void): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg;

  ffmpeg = new FFmpeg();

  if (onProgress) {
    ffmpeg.on("progress", ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  await ffmpeg.load({
    coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.worker.js`, "text/javascript"),
  });

  return ffmpeg;
}

export async function extractMonoPCM16k(
  file: File,
  onProgress?: (percent: number) => void
): Promise<Float32Array> {
  const instance = await loadFfmpeg(onProgress);

  const inputName = `input${getExtension(file.name)}`;
  await instance.writeFile(inputName, await fetchFile(file));

  await instance.exec([
    "-i", inputName,
    "-ar", "16000",
    "-ac", "1",
    "-f", "f32le",
    "output.pcm",
  ]);

  const data = await instance.readFile("output.pcm");
  await instance.deleteFile(inputName);
  await instance.deleteFile("output.pcm");

  const bytes =
    data instanceof Uint8Array ? data : new Uint8Array((data as unknown) as ArrayBuffer);
  return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
}

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot !== -1 ? filename.slice(dot) : "";
}
