import type { AdditiveLoad, Verdict } from "@/types/analysis";

export const VERDICT_TONES: Record<Verdict, string> = {
  CLEAN: "bg-[#e3f4ce] text-[#355d31]",
  LIMIT: "bg-[#fff0c9] text-[#89621a]",
  AVOID: "bg-[#fce2d9] text-[#9c402b]",
};
export const VERDICT_STYLES = VERDICT_TONES;
export const METER_COLORS = { oil: "bg-emerald-600", processing: "bg-amber-500", additives: "bg-violet-600" };

export const METER_TONES = {
  positive: { high: "bg-[#6f986d]", mid: "bg-[#d2a541]", low: "bg-[#cb6e52]" },
  inverse: { high: "bg-[#cb6e52]", mid: "bg-[#d2a541]", low: "bg-[#6f986d]" },
};

export function formatInr(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function meterTheme(value: number, inverse = false): string {
  const colors = inverse ? METER_TONES.inverse : METER_TONES.positive;
  return value >= 67 ? colors.high : value >= 34 ? colors.mid : colors.low;
}

export function loadLabel(load: AdditiveLoad): string {
  return load === "high" ? "High" : load === "moderate" ? "Moderate" : "Low";
}

export function wrapCanvasText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else line = candidate;
  }
  if (line) { context.fillText(line, x, y); y += lineHeight; }
  return y;
}

export function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  context.beginPath(); context.roundRect(x, y, width, height, radius); context.closePath();
}
