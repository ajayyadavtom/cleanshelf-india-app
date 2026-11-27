"use client";
import type { AnalysisMode } from "@/types/analysis";

export function ModeSwitcher({ mode, onChange }: { mode: AnalysisMode; onChange: (mode: AnalysisMode) => void }) {
  return <div role="tablist" aria-label="Analysis mode" className="grid grid-cols-2 rounded-2xl bg-stone-100 p-1.5">
    {([ ["single", "Scan packet label"], ["cart_shelf", "Audit cart / shelf"] ] as const).map(([value, label]) => <button key={value} role="tab" aria-selected={mode === value} onClick={() => onChange(value)} className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${mode === value ? "bg-white text-emerald-900 shadow-sm" : "text-stone-500 hover:text-stone-800"}`}>{label}</button>)}
  </div>;
}
