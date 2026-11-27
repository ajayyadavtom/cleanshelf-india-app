import type { NaturalSwap, SwapImagePreview } from "@/data/naturalSwaps";
import type { AnalysisResult } from "@/types/analysis";

type OffProduct = { product_name?: string; brands?: string; image_front_small_url?: string; image_front_url?: string; image_url?: string; url?: string; countries_tags?: string[] };
const previewCache = new Map<string, { expiresAt: number; value: SwapImagePreview | null }>();

function similarity(query: string, candidate: string): number {
  const ignored = new Set(["plain", "short", "label", "pack", "packaged", "wholegrain", "whole", "option", "indian"]);
  const words = (value: string) => new Set(value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((word) => word.length > 2 && !ignored.has(word)));
  const expected = words(query);
  const actual = words(candidate);
  if (!expected.size || !actual.size) return 0;
  return [...expected].filter((word) => actual.has(word)).length / expected.size;
}

async function searchPreview(swap: NaturalSwap): Promise<SwapImagePreview | null> {
  const key = swap.id;
  const cached = previewCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const url = new URL("https://world.openfoodfacts.net/cgi/search.pl");
  url.searchParams.set("search_terms", `${swap.name} India`);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "5");
  url.searchParams.set("fields", "product_name,brands,image_front_small_url,image_front_url,image_url,url,countries_tags");

  try {
    const response = await fetch(url, { headers: { "User-Agent": "CleanShelfIndia/1.0 (https://github.com/ajayyadavtom/cleanshelf-india-app)" }, signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } });
    if (!response.ok) return null;
    const data = await response.json() as { products?: OffProduct[] };
    const product = (data.products ?? [])
      .filter((candidate) => candidate.countries_tags?.includes("en:india") && (candidate.image_front_small_url || candidate.image_front_url || candidate.image_url) && candidate.url && similarity(swap.name, `${candidate.brands ?? ""} ${candidate.product_name ?? ""}`) >= 0.5)
      .sort((a, b) => similarity(swap.name, `${b.brands ?? ""} ${b.product_name ?? ""}`) - similarity(swap.name, `${a.brands ?? ""} ${a.product_name ?? ""}`))[0];
    const imageUrl = product?.image_front_small_url || product?.image_front_url || product?.image_url;
    const value = product && imageUrl && product.url ? { imageUrl, productUrl: product.url, productName: product.product_name || swap.name, brand: product.brands || "" } : null;
    previewCache.set(key, { value, expiresAt: Date.now() + 86400000 });
    return value;
  } catch {
    return null;
  }
}

export async function attachSwapImages(result: AnalysisResult): Promise<AnalysisResult> {
  const swaps = [...new Map(result.products.map((product) => [product.swaps.packaged.id, product.swaps.packaged])).values()].slice(0, 4);
  const previews = new Map(await Promise.all(swaps.map(async (swap) => [swap.id, await searchPreview(swap)] as const)));
  return {
    ...result,
    products: result.products.map((product) => ({ ...product, swaps: { ...product.swaps, packaged: { ...product.swaps.packaged, productImage: previews.get(product.swaps.packaged.id) ?? undefined } } })),
  };
}
