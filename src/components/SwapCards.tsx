import { ArrowDown, CookingPot, ExternalLink, Image as ImageIcon, ShoppingBag } from "lucide-react";
import type { ProductAnalysis } from "@/types/analysis";
import { formatInr } from "@/lib/ui";

export function SwapCards({ product }: { product: ProductAnalysis }) {
  const source = product.estimatedPriceInr;
  const swaps = [product.swaps.packaged, product.swaps.wholeFood];

  return <section className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5 sm:p-6">
    <div><p className="text-xs font-bold uppercase tracking-[.15em] text-emerald-700">Same craving, simpler ingredients</p><h3 className="mt-1 text-xl font-bold text-stone-900">Try a satisfying swap</h3></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {swaps.map((swap, index) => {
        const query = encodeURIComponent(`${swap.name} India`);
        const shopUrl = `https://www.google.com/search?tbm=shop&gl=IN&q=${query}`;
        const imagesUrl = `https://www.google.com/search?tbm=isch&gl=IN&q=${query}`;
        return <article key={swap.id} className="overflow-hidden rounded-2xl border border-white bg-white">
          {swap.productImage ? <a href={swap.productImage.productUrl} target="_blank" rel="noopener noreferrer" className="block bg-stone-50" aria-label={`View ${swap.productImage.productName} listing`}>
            {/* Community-contributed package photo; the linked product record identifies the listed item. */}
            <img src={swap.productImage.imageUrl} alt={`${swap.productImage.brand} ${swap.productImage.productName} package`} loading="lazy" className="h-40 w-full object-contain p-3" />
            <span className="block px-3 pb-2 text-center text-[10px] text-stone-500">Example package photo · Open Food Facts</span>
          </a> : <a href={imagesUrl} target="_blank" rel="noopener noreferrer" className="grid h-40 place-items-center bg-stone-50 text-stone-400" aria-label={`See images for ${swap.name}`}>
            <span className="flex flex-col items-center gap-2 text-xs"><ImageIcon size={27}/><span>Browse product images</span></span>
          </a>}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2">{index === 0 ? <ShoppingBag size={17} className="text-emerald-700"/> : <CookingPot size={17} className="text-emerald-700"/>}<span className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">{index === 0 ? "Packaged pick" : "Whole-food idea"}</span></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-900">{formatInr(swap.priceInr)}</span></div>
            <h4 className="mt-3 font-bold text-stone-900">{swap.name}</h4><p className="mt-1 text-sm leading-5 text-stone-600">{swap.description}</p><p className="mt-3 text-xs text-stone-500">{swap.typicalPack} · {swap.ingredients}</p>
            {source > 0 && <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-stone-600"><ArrowDown size={13}/>{swap.priceInr <= source ? `${formatInr(source - swap.priceInr)} less than this pack` : `${formatInr(swap.priceInr - source)} more than this pack`}</p>}
            <div className="mt-3 flex flex-wrap gap-2"><a href={shopUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-900"><ExternalLink size={13}/>Find stores</a><a href={imagesUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"><ImageIcon size={13}/>Google Images</a></div>
          </div>
        </article>;
      })}
    </div>
    <p className="mt-3 text-[11px] leading-5 text-stone-500">Prices are representative estimates. Google Shopping opens live retailer results; check the product label and current price before buying. Package photos are community listings and may not match the exact recommendation.</p>
  </section>;
}
