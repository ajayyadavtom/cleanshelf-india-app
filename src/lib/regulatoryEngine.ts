import { buildBudgetMatchedCart, matchSwaps, type Craving } from "@/data/naturalSwaps";
import { matchRegulatoryEntries } from "@/data/regulatoryDb";
import type {
  AdditiveLoad,
  AnalysisResult,
  BodyImpactTimeline,
  IndiaEuropeComparison,
  Language,
  ModelExtraction,
  ModelProductExtraction,
  ProductAnalysis,
  UserProfile,
  Verdict,
} from "@/types/analysis";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));

function scoreAdditives(product: ModelProductExtraction, entries: ReturnType<typeof matchRegulatoryEntries>): { score: number; load: AdditiveLoad } {
  const score = clamp(entries.reduce((total, entry) => total + (entry.riskLevel === "high" ? 34 : entry.riskLevel === "moderate" ? 18 : 8), 0), 0, 100);
  return { score, load: score >= 60 ? "high" : score >= 25 ? "moderate" : "low" };
}

function scoreOil(product: ModelProductExtraction, entries: ReturnType<typeof matchRegulatoryEntries>): number {
  const oilEntries = entries.filter((entry) => entry.category === "oil");
  let penalty = 0;
  for (const entry of oilEntries) {
    if (entry.code === "OIL-PALM-HYDRO") penalty += 55;
    else if (entry.code === "OIL-INTERESTERIFIED") penalty += 28;
    else if (entry.code.includes("PALM")) penalty += 23;
    else penalty += 12;
  }
  if (product.oilTypes.some((oil) => /partially hydrogenated|vanaspati/i.test(oil))) penalty = Math.max(penalty, 55);
  return clamp(100 - penalty, 0, 100);
}

function scoreNova(product: ModelProductExtraction, entries: ReturnType<typeof matchRegulatoryEntries>): number {
  const ingredientText = product.ingredients.join(" ").toLowerCase();
  const additives = entries.filter((entry) => !["oil", "hidden_sugar"].includes(entry.category)).length;
  const sugarOrRefined = /maida|refined flour|maltodextrin|glucose syrup|liquid glucose/.test(ingredientText);
  const baseline = additives >= 2 || (additives >= 1 && sugarOrRefined) ? 4 : additives === 1 || sugarOrRefined ? 3 : product.ingredients.length > 0 ? 2 : 0;
  return clamp(Math.max(baseline, Math.round(product.novaHint)), 0, 4);
}

function verdictFor(product: ModelProductExtraction, additiveLoadScore: number, nova: number, oilScore: number, profile: UserProfile): Verdict {
  const sugar = product.addedSugarGramsPerPackEstimate;
  let verdict: Verdict = nova >= 4 || additiveLoadScore >= 40 || oilScore < 55 || sugar >= 12 ? "LIMIT" : "CLEAN";
  if ((nova >= 4 && sugar >= 18) || (nova >= 4 && oilScore < 30) || additiveLoadScore >= 75) verdict = "AVOID";
  if (profile === "diabetic" && sugar >= 5 && verdict === "CLEAN") verdict = "LIMIT";
  if (profile === "kids" && additiveLoadScore >= 25 && verdict === "CLEAN") verdict = "LIMIT";
  if (profile === "fitness" && (sugar >= 10 || nova >= 4) && verdict === "CLEAN") verdict = "LIMIT";
  return verdict;
}

function impactTimeline(product: ModelProductExtraction, profile: UserProfile): BodyImpactTimeline {
  const hasSugar = product.addedSugarGramsPerPackEstimate >= 5;
  const isSweetened = profile === "diabetic" && hasSugar;
  return {
    thirtyMinutes: isSweetened
      ? "A sweetened snack can affect post-meal blood glucose; the response depends on the person, portion and meal."
      : "Digestion and fullness vary with portion size and what else you eat. A label scan cannot predict an individual response.",
    thirtyDaysDaily: "If this routinely replaces higher-fibre foods, it may contribute to a less balanced eating pattern. Frequency and portion size matter.",
    longTermPattern: "Long-term health is shaped by the whole diet and lifestyle. One product or serving does not determine a health outcome.",
  };
}

function comparisonFor(product: ModelProductExtraction, entries: ReturnType<typeof matchRegulatoryEntries>): IndiaEuropeComparison {
  const verifiedRules = entries.map((entry) => ({
    title: `${entry.commonName} · FSSAI / EU`,
    text: `India: ${entry.fssaiStatus} EU: ${entry.euEfsaStatus}`,
    basis: entry.statusBasis === "regulatory" ? "Local regulatory reference; food-category and use limits still apply." : "Ingredient context; this is not a category-specific legal determination.",
  }));
  const typicalPatterns: IndiaEuropeComparison["typicalPatterns"] = [];
  const unavailableEvidence = ["No European counterpart label or laboratory analysis was provided, so an exact recipe comparison cannot be verified."];
  return {
    indiaLabelSummary: `${product.ingredients.length} visible ingredient entries were extracted from the Indian pack image.`,
    verifiedRules,
    typicalPatterns,
    unavailableEvidence,
  };
}

function overallVerdict(products: ProductAnalysis[]): Verdict {
  if (products.some((product) => product.verdict === "AVOID")) return "AVOID";
  if (products.some((product) => product.verdict === "LIMIT")) return "LIMIT";
  return "CLEAN";
}

export function runEngine(extraction: ModelExtraction, profile: UserProfile, language: Language): AnalysisResult {
  const products: ProductAnalysis[] = extraction.products.map((raw) => {
    const entries = matchRegulatoryEntries(raw.ingredients, raw.insCodes);
    const oilQualityScore = scoreOil(raw, entries);
    const additives = scoreAdditives(raw, entries);
    const processingLevelNova = scoreNova(raw, entries);
    const verdict = verdictFor(raw, additives.score, processingLevelNova, oilQualityScore, profile);
    const sugarTeaspoons = Number((raw.addedSugarGramsPerPackEstimate / 4).toFixed(1));
    return {
      ...raw,
      confidence: clamp(raw.confidence, 0, 1),
      quantityInImage: clamp(Math.round(raw.quantityInImage), 1, 100),
      estimatedPriceInr: clamp(raw.estimatedPriceInr, 0, 100000),
      refinedOilMlPerPackEstimate: clamp(raw.refinedOilMlPerPackEstimate, 0, 1000),
      addedSugarGramsPerPackEstimate: clamp(raw.addedSugarGramsPerPackEstimate, 0, 1000),
      addedSugarTeaspoonsPerPackEstimate: sugarTeaspoons,
      oilQualityScore,
      processingLevelNova,
      additiveLoadScore: additives.score,
      additiveLoad: additives.load,
      verdict,
      regulatoryMatches: entries,
      comparison: comparisonFor(raw, entries),
      bodyImpactTimeline: impactTimeline(raw, profile),
      swaps: matchSwaps(raw.craving as Craving, raw.estimatedPriceInr > 0 ? raw.estimatedPriceInr : undefined, raw.productName),
    };
  });

  const totals = products.reduce((result, product) => {
    result.refinedOilMl += product.refinedOilMlPerPackEstimate * product.quantityInImage;
    result.addedSugarTeaspoons += product.addedSugarTeaspoonsPerPackEstimate * product.quantityInImage;
    result.spendInr += product.estimatedPriceInr * product.quantityInImage;
    return result;
  }, { refinedOilMl: 0, addedSugarTeaspoons: 0, spendInr: 0 });
  const additiveLoad: AdditiveLoad = products.some((product) => product.additiveLoad === "high") ? "high" : products.some((product) => product.additiveLoad === "moderate") ? "moderate" : "low";
  const verdict = overallVerdict(products);
  const cart = buildBudgetMatchedCart(products.map((product) => ({ productName: product.productName, craving: product.craving, quantity: product.quantityInImage, estimatedPriceInr: product.estimatedPriceInr })));
  const oilBasis = products.some((product) => product.refinedOilMlPerPackEstimate === 0)
    ? "Refined-oil volume is counted only where the image supports an estimate. Total fat is not treated as refined oil."
    : "Estimated per-pack refined-oil amounts multiplied by visible quantities; these are purchases, not measured consumption.";
  return {
    mode: extraction.mode,
    profile,
    language,
    summary: products.length === 0 ? "No packaged-food products could be read clearly. Try a closer photo with ingredients and nutrition in focus." : `${products.length} product${products.length === 1 ? "" : "s"} reviewed. ${verdict === "CLEAN" ? "The visible labels look relatively simple." : verdict === "LIMIT" ? "A few labels suggest choosing these less often or comparing alternatives." : "Several visible label signals make these items better as occasional choices."}`,
    overallVerdict: verdict,
    weeklyTotals: {
      refinedOilMl: Number(totals.refinedOilMl.toFixed(1)),
      addedSugarTeaspoons: Number(totals.addedSugarTeaspoons.toFixed(1)),
      additiveLoad,
      spendInr: Number(totals.spendInr.toFixed(0)),
      basis: `${oilBasis} Visible item counts are treated as one week's purchases. Added-sugar estimates use 4 g per teaspoon.`,
    },
    replacementCart: { ...cart, lines: cart.lines },
    products,
  };
}
