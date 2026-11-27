"use client";
import { useRef, useState } from "react";
import { Camera, ImagePlus, LoaderCircle, Sparkles } from "lucide-react";
import { MAX_IMAGE_EDGE } from "@/lib/constants";
import type { AnalysisMode, AnalysisResult, Language, UserProfile } from "@/types/analysis";

async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas"); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d"); if (!context) throw new Error("Could not prepare this image.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  return await new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not prepare this image.")), "image/jpeg", 0.88));
}

async function readAnalysisResponse(response: Response): Promise<AnalysisResult> {
  const body = await response.text();
  let data: unknown;

  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    const message = response.status >= 500
      ? "The image-analysis server returned an unexpected error. Try again in a minute. If it keeps happening, check the Vercel function logs."
      : "The server returned an unreadable response. Please try again.";
    throw new Error(message);
  }

  if (!response.ok) {
    const message = typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
      ? data.error
      : response.status >= 500
        ? "The image-analysis server could not finish this request. Try again in a minute."
        : `Image analysis failed (HTTP ${response.status}). Please try again.`;
    throw new Error(message);
  }

  if (typeof data !== "object" || data === null || !("products" in data)) {
    throw new Error("The server returned an incomplete analysis. Please try again.");
  }

  return data as AnalysisResult;
}

export function ImageUploader({ mode, profile, language, busy, onBusy, onResult, onError }: { mode: AnalysisMode; profile: UserProfile; language: Language; busy: boolean; onBusy: (value: boolean) => void; onResult: (value: AnalysisResult) => void; onError: (value: string) => void }) {
  const ref = useRef<HTMLInputElement>(null); const [filename, setFilename] = useState("");
  async function submit(file?: File) {
    if (!file) return; setFilename(file.name); onError(""); onBusy(true);
    try {
      const image = await downscale(file); const body = new FormData(); body.append("image", image, "cleanshelf-upload.jpg"); body.append("mode", mode); body.append("userProfile", profile); body.append("language", language);
      const response = await fetch("/api/analyze", { method: "POST", body });
      onResult(await readAnalysisResponse(response));
    } catch (error) { onError(error instanceof Error ? error.message : "Analysis failed. Check your connection and try again."); }
    finally { onBusy(false); if (ref.current) ref.current.value = ""; }
  }
  return <div className="rounded-[1.6rem] border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-5 sm:p-7">
    <input ref={ref} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(e) => void submit(e.target.files?.[0])} />
    <div className="mx-auto flex max-w-lg flex-col items-center text-center"><span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800"><ImagePlus size={23}/></span><h2 className="text-lg font-bold text-stone-900">{mode === "single" ? "Add a clear photo of the back label" : "Add a cart screenshot or shelf photo"}</h2><p className="mt-1 text-sm leading-6 text-stone-600">Ingredients and nutrition panel in focus gives the most useful read. Images are resized on your device before upload.</p>
      <button disabled={busy} onClick={() => ref.current?.click()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-900 disabled:opacity-60">{busy ? <LoaderCircle className="animate-spin" size={18}/> : <Camera size={18}/>} {busy ? "Reading image…" : "Take photo or choose image"}</button>
      {filename && <p className="mt-2 max-w-full truncate text-xs text-stone-500">{filename}</p>}
      <div className="mt-4 flex items-center gap-1.5 text-xs text-stone-500"><Sparkles size={14}/> Demo samples work without an API key</div>
    </div>
  </div>;
}
