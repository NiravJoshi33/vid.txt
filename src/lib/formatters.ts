import type { Segment } from "@/workers/messages";
import { formatTimestamp } from "./time";

export function toTxt(segments: Segment[]): string {
  return segments.map((s) => s.text.trim()).join(" ");
}

export function toJson(segments: Segment[]): string {
  return JSON.stringify(segments, null, 2);
}

export function toSrt(segments: Segment[]): string {
  return segments
    .map((s, i) => {
      const start = formatTimestamp(s.start, "srt");
      const end = formatTimestamp(s.end, "srt");
      return `${i + 1}\n${start} --> ${end}\n${s.text.trim()}\n`;
    })
    .join("\n");
}

export function toVtt(segments: Segment[]): string {
  const cues = segments
    .map((s) => {
      const start = formatTimestamp(s.start, "vtt");
      const end = formatTimestamp(s.end, "vtt");
      return `${start} --> ${end}\n${s.text.trim()}`;
    })
    .join("\n\n");
  return `WEBVTT\n\n${cues}`;
}
