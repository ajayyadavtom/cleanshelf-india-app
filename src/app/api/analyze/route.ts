import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { matchRegulatoryEntries } from "@/data/regulatoryDb";
import { buildBudgetMatchedCart, Craving, matchSwaps } from "@/data/naturalSwaps";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const languages = ["en", "hi", "kn", "te"] as const;
const profiles = ["general", "diabetic", "kids", "fitness"] as const;
const modes = ["single", "cart_shelf"] as const;

const schema = {
  type: Type.OBJECT,
  properties: {
    mode: { type: Type.STRING, enum: [...modes] },
    summary: { type: Type.STRING },
    overallVerdict: { type: Type.STRING, enum: ["CLEAN", "LIMIT", "AVOID"] },
    weeklyTotals: {
      type: Type.OBJECT,
      properties: {
        refinedOilMl: { type: Type.NUMBER },
        addedSugarTeaspoons: { type: Type.NUMBER },
        additiveLoad: { type: Type.STRING, enum: ["low", "moderate", "high"] },
        basis: { type: Type.STRING },
      },
      required: ["refinedOilMl", "addedSugarTeaspoons", "additiveLoad", "basis"],
    },
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
          verdict: { type: Type.STRING, enum: ["CLEAN", "LIMIT", "AVOID"] },
          oilTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
          refinedOilMlPerPackEstimate: { type: Type.NUMBER },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          insCodes: { type: Type.ARRAY, items: { type: Type.STRING } },
          nutritionHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          addedSugarGramsPerPackEstimate: { type: Type.NUMBER },
          addedSugarTeaspoonsPerPackEstimate: { type: Type.NUMBER },
          craving: { type: Type.STRING, enum: ["crunchy_salty", "sweet", "crispy", "drink"] },
          processingLevelNova: { type: Type.INTEGER },
          oilQualityScore: { type: Type.INTEGER },
          additiveLoadScore: { type: Type.INTEGER },
          comparison: {
            type: Type.OBJECT,
            properties: {
              indiaLabelSummary: { type: Type.STRING },
              euVerifiedRegulatoryDifferences: { type: Type.ARRAY, items: { type: Type.STRING } },
              typicalEuFormulationPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
              unavailableEvidence: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["indiaLabelSummary", "euVerifiedRegulatoryDifferences", "typicalEuFormulationPatterns", "unavailableEvidence"],
          },
          bodyImpactTimeline: {
            type: Type.OBJECT,
            properties: {
              thirtyMinutes: { type: Type.STRING },
              thirtyDaysDaily: { type: Type.STRING },
              longTermPattern: { type: Type.STRING },
            },
            required: ["thirtyMinutes", "thirtyDaysDaily", "longTermPattern"],
          },
        },
        required: ["productName", "brand", "packSize", "quantityInImage", "estimatedPriceInr", "confidence", "verdict", "oilTypes", "refinedOilMlPerPackEstimate", "ingredients", "insCodes", "nutritionHighlights", "addedSugarGramsPerPackEstimate", "addedSugarTeaspoonsPerPackEstimate", "craving", "processingLevelNova", "oilQualityScore", "additiveLoadScore", "comparison", "bodyImpactTimeline"],
      },
    },
  },
  required: ["mode", "summary", "overallVerdict", "weeklyTotals", "products"],
};

type ModelProduct = {
  productName: string;
  brand: string;
  packSize: string;
  quantityInImage: number;
  estimatedPriceInr: number;
  confidence: number;
  verdict: "CLEAN" | "LIMIT" | "AVOID";
  oilTypes: string[];
  refinedOilMlPerPackEstimate: number;
  ingredients: string[];
  insCodes: string[];
  nutritionHighlights: string[];
  addedSugarGramsPerPackEstimate: number;
  addedSugarTeaspoonsPerPackEstimate: number;
  craving: Craving;
  processingLevelNova: number;
  oilQualityScore: number;
  additiveLoadScore: number;
  comparison: {
    indiaLabelSummary: string;
    euVerifiedRegulatoryDifferences: string[];
    typicalEuFormulationPatterns: string[];
    unavailableEvidence: string[];
  };
  bodyImpactTimeline: { thirtyMinutes: string; thirtyDaysDaily: string; longTermPattern: string };
};

function clamp(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const image = form.get("image");
    const mode = form.get("mode");
    const language = form.get("language");
    const userProfile = form.get("userProfile");

    if (!(image instanceof File)) return Response.json({ error: "Add one clear label or cart/shelf image to continue." }, { status: 400 });
    if (!modes.includes(mode as (typeof modes)[number])) return Response.json({ error: "Mode must be single or cart_shelf." }, { status: 400 });
    if (!languages.includes(language as (typeof languages)[number])) return Response.json({ error: "Choose a supported summary language." }, { status: 400 });
    if (!profiles.includes(userProfile as (typeof profiles)[number])) return Response.json({ error: "Choose a supported profile." }, { status: 400 });
    if (!image.type.startsWith("image/") || !["image/jpeg", "image/png", "image/webp"].includes(image.type)) return Response.json({ error: "Upload a JPEG, PNG or WebP image." }, { status: 415 });
    if (image.size === 0 || image.size > MAX_IMAGE_BYTES) return Response.json({ error: "Image must be between 1 byte and 8 MB." }, { status: 413 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return Response.json({ error: "Image analysis is not configured. Set GEMINI_API_KEY on the server." }, { status: 503 });

    const bytes = Buffer.from(await image.arrayBuffer());
    const base64 = bytes.toString("base64");
    const ai = new GoogleGenAI({ apiKey });
    const languageName = { en: "English", hi: "Hindi", kn: "Kannada", te: "Telugu" }[language as (typeof languages)[number]];
    const prompt = `Analyze this Indian packaged-food image. Mode: ${mode}. Consumer profile: ${userProfile}. Write user-facing summary, nutrition notes and body-impact timeline in ${languageName}. Product/ingredient extraction strings may retain the printed label language.

Return only the required schema. Read only visible evidence; do not invent products, brands, label values, legal findings, prices, quantities, or formulations. Use empty arrays or conservative zero estimates for unreadable evidence, and reduce confidence. In cart/shelf mode identify each reasonably distinguishable product once, up to 12 products. quantityInImage is the visible count of that product (use 1 if quantity cannot be read); estimatedPriceInr is per pack and 0 if not visible. If nutrition facts or serving/pack size are unreadable, report zero for calculated amounts and explain this in weeklyTotals.basis.

Estimate oil ml per pack only when oil/fat mass can be reasonably derived from label facts. If total fat is the only fact, it is not all refined oil: return 0 and explicitly say the label does not identify how much is refined oil. Estimate added sugars only from explicit nutrition/ingredient evidence. For audit totals, treat visible item quantities as one week's purchases (not consumption) and sum per-pack estimates times quantity. Do not extrapolate daily or lifetime exposure. Convert sugar grams to teaspoons using 4 g per teaspoon. Return no more than 30 products.

Only call an additive load high when multiple additives are visible or a notable additive is present; do not equate legal permission with health risk. Verdicts are shopping guidance, not safety determinations. NOVA is a rough classification; use 4 only when the formulation clearly indicates an ultra-processed product, otherwise use 1-3 or 0 if unclear. Scores are 0-100, where higher oilQualityScore means a more favorable oil profile, and higher additiveLoadScore means greater visible additive load. Keep all scores conservative and label evidence-sensitive.

In comparison, euVerifiedRegulatoryDifferences may contain only an actual legal difference that follows from visible ingredient/code and stable official law; clearly say it is a rule difference, not proof of the EU version's recipe. For colors E102, E110, E122, E124 and E129 the EU child activity/attention warning requirement is a verified labelling rule. E171 is not authorised in EU food since 2022. Otherwise use empty list unless certain. Typical EU patterns must be explicitly framed as general market patterns, never as a verified counterpart product. Since no counterpart pack is supplied, state that fact in unavailableEvidence and do not invent a European formulation.

Timeline: use cautious general nutrition language, not predicted physiological events, diagnosis, or treatment. At 30 minutes describe possible digestion/energy response only if relevant. At 30 days describe what repeated dietary pattern may contribute to, with uncertainty. Long-term pattern should focus on overall diet and established nutrition factors. For kids or diabetic profile, give general food-label context and suggest a qualified professional for personal diet needs. Do not claim a single serving causes disease. Do not provide medicinal advice.`;

    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: image.type, data: base64 } }] }],
      config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.1, maxOutputTokens: 4096, thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } },
    });

    const raw = result.text;
    if (!raw) return Response.json({ error: "The image could not be analyzed. Try a closer, brighter photo." }, { status: 422 });
    let parsed: { mode: string; summary: string; overallVerdict: "CLEAN" | "LIMIT" | "AVOID"; weeklyTotals: { refinedOilMl: number; addedSugarTeaspoons: number; additiveLoad: string; basis: string }; products: ModelProduct[] };
    try { parsed = JSON.parse(raw); } catch { return Response.json({ error: "The analysis response was incomplete. Please try again." }, { status: 502 }); }
    if (!Array.isArray(parsed.products)) return Response.json({ error: "The image could not be read as a food label or shelf." }, { status: 422 });

    const products = parsed.products.slice(0, 12).map((product) => {
      const dbEntries = matchRegulatoryEntries(product.ingredients ?? [], product.insCodes ?? []);
      const craving = product.craving ?? "crunchy_salty";
      const swaps = matchSwaps(craving, product.estimatedPriceInr > 0 ? product.estimatedPriceInr : undefined);
      return {
        ...product,
        confidence: clamp(product.confidence, 0, 1),
        quantityInImage: clamp(product.quantityInImage, 1, 100),
        processingLevelNova: clamp(product.processingLevelNova, 0, 4),
        oilQualityScore: clamp(product.oilQualityScore, 0, 100),
        additiveLoadScore: clamp(product.additiveLoadScore, 0, 100),
        regulatoryMatches: dbEntries,
        swaps,
      };
    });

    const refinedOilMl = products.reduce((sum, product) => sum + Math.max(0, product.refinedOilMlPerPackEstimate) * product.quantityInImage, 0);
    const addedSugarTeaspoons = products.reduce((sum, product) => sum + Math.max(0, product.addedSugarTeaspoonsPerPackEstimate) * product.quantityInImage, 0);
    const additiveLoad = products.length === 0 ? "low" : products.some((product) => product.additiveLoadScore >= 67) ? "high" : products.some((product) => product.additiveLoadScore >= 34) ? "moderate" : "low";
    const replacementCart = buildBudgetMatchedCart(products.map((product) => ({ productName: product.productName, craving: product.craving, quantity: product.quantityInImage, estimatedPriceInr: Math.max(0, product.estimatedPriceInr) })));

    return Response.json({
      mode,
      summary: parsed.summary,
      overallVerdict: parsed.overallVerdict,
      weeklyTotals: { refinedOilMl: Number(refinedOilMl.toFixed(1)), addedSugarTeaspoons: Number(addedSugarTeaspoons.toFixed(1)), additiveLoad, basis: parsed.weeklyTotals?.basis ?? "Totals estimate the visible pack quantities as one week's purchases; label data may be incomplete." },
      products,
      replacementCart,
      regulatorySource: "FSSAI and EU matches are attached from the local reference catalog. Permissions vary by food category and current amendments.",
    });
  } catch (error) {
    console.error("CleanShelf analysis failed", error);
    const status = typeof error === "object" && error !== null && "status" in error && typeof error.status === "number" ? error.status : 500;
    if (status === 401 || status === 403) return Response.json({ error: "Gemini rejected the API key. Check that it is active and has Gemini API access." }, { status: 503 });
    if (status === 404) return Response.json({ error: "The configured Gemini model is unavailable to this project. Set GEMINI_MODEL to a model enabled for your API key." }, { status: 503 });
    if (status === 429) return Response.json({ error: "Gemini's quota or request limit has been reached. Wait for the quota reset or review the project's API limits and billing." }, { status: 429 });
    if (status === 503) return Response.json({ error: "Gemini is temporarily at capacity. Please try the image again in a few minutes." }, { status: 503 });
    return Response.json({ error: "Gemini could not analyze this image. Check your connection and try again." }, { status: 502 });
  }
}
