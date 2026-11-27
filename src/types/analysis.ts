import type { Craving, NaturalSwap } from "@/data/naturalSwaps";
import type { RegulatoryEntry } from "@/data/regulatoryDb";

export type AnalysisMode = "single" | "cart_shelf";
export type UserProfile = "general" | "diabetic" | "kids" | "fitness";
export type Language = "en" | "hi" | "kn" | "te";
export type Verdict = "CLEAN" | "LIMIT" | "AVOID";
export type AdditiveLoad = "low" | "moderate" | "high";

/** Only fields that can be read or estimated from the supplied image. No law, verdict or risk claim. */
export type ModelProductExtraction = {
  productName: string;
  brand: string;
  packSize: string;
  quantityInImage: number;
  estimatedPriceInr: number;
  confidence: number;
  oilTypes: string[];
  refinedOilMlPerPackEstimate: number;
  oilEstimateBasis: string;
  ingredients: string[];
  insCodes: string[];
  nutritionHighlights: string[];
  addedSugarGramsPerPackEstimate: number;
  craving: Craving;
  novaHint: number;
};

export type ModelExtraction = {
  mode: AnalysisMode;
  products: ModelProductExtraction[];
};

export type BodyImpactTimeline = {
  thirtyMinutes: string;
  thirtyDaysDaily: string;
  longTermPattern: string;
};

export type IndiaEuropeComparison = {
  indiaLabelSummary: string;
  verifiedRules: Array<{ title: string; text: string; basis: string }>;
  typicalPatterns: Array<{ text: string; basis: "typical_pattern" }>;
  unavailableEvidence: string[];
};

export type ProductAnalysis = ModelProductExtraction & {
  addedSugarTeaspoonsPerPackEstimate: number;
  verdict: Verdict;
  oilQualityScore: number;
  processingLevelNova: number;
  additiveLoadScore: number;
  additiveLoad: AdditiveLoad;
  regulatoryMatches: RegulatoryEntry[];
  comparison: IndiaEuropeComparison;
  bodyImpactTimeline: BodyImpactTimeline;
  swaps: { packaged: NaturalSwap; wholeFood: NaturalSwap };
};

export type ReplacementCart = {
  budgetInr: number;
  estimatedTotalInr: number;
  withinBudget: boolean;
  budgetBasis: string;
  lines: Array<{
    sourceProduct: string;
    replacement: NaturalSwap;
    quantity: number;
    lineTotalInr: number;
  }>;
};

export type WebResearch = {
  summary: string;
  sources: Array<{ title: string; url: string }>;
};

/** Public API response. Every judgement and regulatory badge is produced locally. */
export type AnalysisResult = {
  mode: AnalysisMode;
  profile: UserProfile;
  language: Language;
  summary: string;
  overallVerdict: Verdict;
  weeklyTotals: {
    refinedOilMl: number;
    addedSugarTeaspoons: number;
    additiveLoad: AdditiveLoad;
    spendInr: number;
    basis: string;
  };
  replacementCart: ReplacementCart;
  products: ProductAnalysis[];
  webResearch?: WebResearch;
};
