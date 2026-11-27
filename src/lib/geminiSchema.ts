import { Type } from "@google/genai";
import type { Craving } from "@/data/naturalSwaps";
import type { AnalysisMode, ModelExtraction, ModelProductExtraction } from "@/types/analysis";

export const ANALYSIS_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    products: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          brand: { type: Type.STRING },
          packSize: { type: Type.STRING },
          quantityInImage: { type: Type.NUMBER },
          estimatedPriceInr: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
          oilTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
          refinedOilMlPerPackEstimate: { type: Type.NUMBER },
          oilEstimateBasis: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          insCodes: { type: Type.ARRAY, items: { type: Type.STRING } },
          nutritionHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          addedSugarGramsPerPackEstimate: { type: Type.NUMBER },
          craving: { type: Type.STRING, enum: ["crunchy_salty", "sweet", "crispy", "drink"] },
          novaHint: { type: Type.INTEGER },
        },
        required: ["productName", "brand", "packSize", "quantityInImage", "estimatedPriceInr", "confidence", "oilTypes", "refinedOilMlPerPackEstimate", "oilEstimateBasis", "ingredients", "insCodes", "nutritionHighlights", "addedSugarGramsPerPackEstimate", "craving", "novaHint"],
      },
    },
  },
  required: ["products"],
};

export function buildImagePrompt(mode: AnalysisMode, language: string, profile: string): string {
  const languageName = ({ en: "English", hi: "Hindi", kn: "Kannada", te: "Telugu" } as Record<string, string>)[language] ?? "English";
  return `Read this Indian packaged-food image. Mode: ${mode}. Consumer profile: ${profile}. Write nutritionHighlights in ${languageName}; keep printed ingredient names as they appear. Return only the required JSON schema.

Extract visible evidence only. Do not invent brands, products, ingredients, nutrition values, prices or pack quantities. In cart/shelf mode report at most 12 distinguishable products. If text cannot be read, use an empty string/list or zero and reduce confidence.

Estimate refinedOilMlPerPackEstimate only when both oil evidence and a defensible visible quantity are present. Total fat is not the same as refined oil: if the label only gives total fat or lists oil without an amount, use 0 and explain why in oilEstimateBasis. Estimate added sugar only from a visible nutrition panel or explicit label amount; convert nothing here. quantityInImage is the visible count, or 1 when unclear. Price is per pack, or 0 when unreadable. Use craving as one of crunchy_salty, sweet, crispy, drink. novaHint is only a rough product-processing clue from 0 to 4; do not output a verdict, health risk, score, regulatory claim, law, or European formulation. Do not infer a user's medical response.`;
}

const safeText = (value: unknown, fallback = "") => typeof value === "string" ? value.slice(0, 1000).trim() : fallback;
const safeNumber = (value: unknown, fallback = 0) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
const safeStrings = (value: unknown, max = 40) => Array.isArray(value) ? value.slice(0, max).map((item) => safeText(item)).filter(Boolean) : [];
const cravings: Craving[] = ["crunchy_salty", "sweet", "crispy", "drink"];

function normalizeProduct(value: unknown): ModelProductExtraction | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const productName = safeText(raw.productName);
  if (!productName) return null;
  const craving = cravings.includes(raw.craving as Craving) ? raw.craving as Craving : "crunchy_salty";
  return {
    productName,
    brand: safeText(raw.brand, "Brand not read"),
    packSize: safeText(raw.packSize, "Pack size not read"),
    quantityInImage: safeNumber(raw.quantityInImage, 1),
    estimatedPriceInr: safeNumber(raw.estimatedPriceInr),
    confidence: safeNumber(raw.confidence, 0.25),
    oilTypes: safeStrings(raw.oilTypes, 12),
    refinedOilMlPerPackEstimate: safeNumber(raw.refinedOilMlPerPackEstimate),
    oilEstimateBasis: safeText(raw.oilEstimateBasis, "The image did not support a reliable oil-volume estimate."),
    ingredients: safeStrings(raw.ingredients, 80),
    insCodes: safeStrings(raw.insCodes, 40),
    nutritionHighlights: safeStrings(raw.nutritionHighlights, 20),
    addedSugarGramsPerPackEstimate: safeNumber(raw.addedSugarGramsPerPackEstimate),
    craving,
    novaHint: safeNumber(raw.novaHint),
  };
}

export function normalizeExtraction(value: unknown, mode: AnalysisMode): ModelExtraction {
  if (!value || typeof value !== "object") return { mode, products: [] };
  const rawProducts = (value as Record<string, unknown>).products;
  const products = Array.isArray(rawProducts) ? rawProducts.slice(0, 12).map(normalizeProduct).filter((item): item is ModelProductExtraction => item !== null) : [];
  return { mode, products };
}
