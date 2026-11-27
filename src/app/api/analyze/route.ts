import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { buildImagePrompt, ANALYSIS_RESPONSE_SCHEMA, normalizeExtraction } from "@/lib/geminiSchema";
import { MAX_IMAGE_BYTES } from "@/lib/constants";
import { runEngine } from "@/lib/regulatoryEngine";
import type { AnalysisMode, Language, UserProfile } from "@/types/analysis";

export const runtime = "nodejs";
export const maxDuration = 60;

const modes: AnalysisMode[] = ["single", "cart_shelf"];
const languages: Language[] = ["en", "hi", "kn", "te"];
const profiles: UserProfile[] = ["general", "diabetic", "kids", "fitness"];
const imageTypes = ["image/jpeg", "image/png", "image/webp"];

type RequestImage = { bytes: Buffer; mimeType: string; mode: AnalysisMode; language: Language; profile: UserProfile };

async function readInput(request: Request): Promise<RequestImage | Response> {
  const contentType = request.headers.get("content-type") ?? "";
  let mode: unknown;
  let language: unknown;
  let profile: unknown;
  let mimeType: unknown;
  let imageBytes: Buffer | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    mode = form.get("mode"); language = form.get("language"); profile = form.get("userProfile") ?? form.get("profile");
    const image = form.get("image");
    if (!(image instanceof File)) return Response.json({ error: "Add one clear label or cart/shelf image to continue." }, { status: 400 });
    mimeType = image.type;
    if (image.size > MAX_IMAGE_BYTES) return Response.json({ error: "Image must be 8 MB or smaller." }, { status: 413 });
    imageBytes = Buffer.from(await image.arrayBuffer());
  } else if (contentType.includes("application/json")) {
    const body = await request.json() as Record<string, unknown>;
    mode = body.mode; language = body.language; profile = body.userProfile ?? body.profile; mimeType = body.mimeType;
    const encoded = typeof body.imageBase64 === "string" ? body.imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "") : "";
    if (!encoded || encoded.length > Math.ceil(MAX_IMAGE_BYTES * 1.4)) return Response.json({ error: "JSON requests need imageBase64 containing an image up to 8 MB." }, { status: 400 });
    imageBytes = Buffer.from(encoded, "base64");
    if (imageBytes.byteLength > MAX_IMAGE_BYTES) return Response.json({ error: "Image must be 8 MB or smaller." }, { status: 413 });
  } else {
    return Response.json({ error: "Send multipart/form-data or application/json with an image." }, { status: 415 });
  }

  if (!modes.includes(mode as AnalysisMode)) return Response.json({ error: "Mode must be single or cart_shelf." }, { status: 400 });
  if (!languages.includes(language as Language)) return Response.json({ error: "Choose en, hi, kn or te as the language." }, { status: 400 });
  if (!profiles.includes(profile as UserProfile)) return Response.json({ error: "Choose general, diabetic, kids or fitness as the profile." }, { status: 400 });
  if (typeof mimeType !== "string" || !imageTypes.includes(mimeType)) return Response.json({ error: "Upload a JPEG, PNG or WebP image." }, { status: 415 });
  if (!imageBytes?.length) return Response.json({ error: "The uploaded image was empty." }, { status: 400 });
  return { bytes: imageBytes, mimeType, mode: mode as AnalysisMode, language: language as Language, profile: profile as UserProfile };
}

export async function POST(request: Request) {
  try {
    const input = await readInput(request);
    if (input instanceof Response) return input;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return Response.json({ error: "Image analysis is not configured. Set GEMINI_API_KEY on the server." }, { status: 503 });

    const primaryModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";
    const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 20_000, retryOptions: { attempts: 1 } } });
    const modelRequest = {
      contents: [{ role: "user" as const, parts: [{ text: buildImagePrompt(input.mode, input.language, input.profile) }, { inlineData: { mimeType: input.mimeType, data: input.bytes.toString("base64") } }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_RESPONSE_SCHEMA,
        temperature: 0.1,
        maxOutputTokens: 4096,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    };

    let response;
    try {
      response = await ai.models.generateContent({ model: primaryModel, ...modelRequest });
    } catch (primaryError) {
      const status = typeof primaryError === "object" && primaryError !== null && "status" in primaryError && typeof primaryError.status === "number" ? primaryError.status : 0;
      const retryableSdkError = primaryError instanceof Error && primaryError.message.startsWith("Retryable HTTP Error:");
      if ((!retryableSdkError && ![500, 502, 503, 504].includes(status)) || fallbackModel === primaryModel) throw primaryError;
      console.warn(`Gemini model ${primaryModel} unavailable; retrying with ${fallbackModel}.`);
      response = await ai.models.generateContent({ model: fallbackModel, ...modelRequest });
    }

    if (!response.text) return Response.json({ error: "The image could not be read clearly. Try a closer, brighter photo." }, { status: 422 });
    let parsed: unknown;
    try { parsed = JSON.parse(response.text); }
    catch { return Response.json({ error: "Gemini returned an incomplete extraction. Please try again." }, { status: 502 }); }
    const imageStatus = typeof parsed === "object" && parsed !== null && "imageAssessment" in parsed && typeof parsed.imageAssessment === "object" && parsed.imageAssessment !== null && "status" in parsed.imageAssessment && typeof parsed.imageAssessment.status === "string"
      ? parsed.imageAssessment.status
      : "unclear";
    if (imageStatus === "non_food") return Response.json({ error: "This looks like a medicine or another non-food item. CleanShelf analyzes packaged foods only; it cannot assess medicines." }, { status: 422 });
    if (imageStatus === "food_front") return Response.json({ error: "I can see a food product, but not its ingredient or nutrition panel. Please upload a clear photo of the back label. I won't guess ingredients from the product name." }, { status: 422 });
    if (imageStatus !== "food_label") return Response.json({ error: "I couldn't confirm a readable packaged-food label in this photo. Try a sharp, well-lit photo of the back panel." }, { status: 422 });
    const extraction = normalizeExtraction(parsed, input.mode);
    if (extraction.products.length === 0) return Response.json({ error: "No products could be read. Keep the ingredients and nutrition panel in focus and try again." }, { status: 422 });
    if (extraction.products.some((product) => product.ingredients.length === 0)) return Response.json({ error: "The ingredient list isn't readable enough to verify the product. Please upload a clear photo of the back label." }, { status: 422 });
    if (extraction.products.some((product) => product.confidence < 0.55)) return Response.json({ error: "The product or label text is too uncertain to give a reliable analysis. Move closer, avoid glare, and include the full ingredients and nutrition panels." }, { status: 422 });
    return Response.json(runEngine(extraction, input.profile, input.language));
  } catch (error) {
    console.error("CleanShelf analysis failed", error);
    const status = typeof error === "object" && error !== null && "status" in error && typeof error.status === "number" ? error.status : 500;
    const retryableSdkError = error instanceof Error && error.message.startsWith("Retryable HTTP Error:");
    if (status === 401 || status === 403) return Response.json({ error: "Gemini rejected the server API key. Add an active Google AI Studio Gemini API key as GEMINI_API_KEY in Vercel, then redeploy." }, { status: 503 });
    if (status === 404) return Response.json({ error: "The configured Gemini model is unavailable to this project. Check GEMINI_MODEL and the model's project access." }, { status: 503 });
    if (status === 429) return Response.json({ error: "Gemini's quota or request limit has been reached. Wait for the quota reset or review the project's API limits and billing." }, { status: 429 });
    if (status === 503 || retryableSdkError) return Response.json({ error: "Gemini's image-analysis models are temporarily unavailable. Please try again in a few minutes." }, { status: 503 });
    if (status === 400) return Response.json({ error: "Gemini rejected this image request. Check the image format and model configuration." }, { status: 422 });
    if (status === 0) return Response.json({ error: "The image-analysis request timed out or lost its connection to Gemini. Try again with a clear, smaller photo." }, { status: 502 });
    return Response.json({ error: "Gemini could not analyze this image. Check your connection and try again." }, { status: 502 });
  }
}
