import { LANGUAGES } from "@/lib/constants";
import { buildVoiceSummary } from "@/lib/i18n";
import type { AnalysisResult, Language } from "@/types/analysis";

export function speakAnalysis(analysis: AnalysisResult, language: Language, onEnd?: () => void): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(buildVoiceSummary({
    language,
    verdict: analysis.overallVerdict,
    refinedOilMl: analysis.weeklyTotals.refinedOilMl,
    addedSugarTeaspoons: analysis.weeklyTotals.addedSugarTeaspoons,
    additiveLoad: analysis.weeklyTotals.additiveLoad,
    productCount: analysis.products.length,
  }));
  utterance.lang = LANGUAGES.find((item) => item.value === language)?.speechTag ?? "en-IN";
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
  return true;
}
