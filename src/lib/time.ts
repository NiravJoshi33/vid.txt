export function formatTimestamp(
  seconds: number,
  style: "srt" | "vtt" | "display" = "display"
): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);

  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  const mmm = String(ms).padStart(3, "0");

  if (style === "srt") return `${hh}:${mm}:${ss},${mmm}`;
  if (style === "vtt") return `${hh}:${mm}:${ss}.${mmm}`;
  if (h > 0) return `${hh}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}
