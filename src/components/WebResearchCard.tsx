import { ExternalLink, SearchCheck } from "lucide-react";
import type { WebResearch } from "@/types/analysis";

export function WebResearchCard({ research }: { research: WebResearch }) {
  return <section className="rounded-3xl border border-sky-200 bg-sky-50 p-5 sm:p-6">
    <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sky-800"><SearchCheck size={18}/></span><div><h3 className="font-bold text-stone-900">Product checked with Google Search</h3><p className="text-xs text-stone-600">Web references for this product match</p></div></div>
    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-stone-700">{research.summary}</p>
    {research.sources.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{research.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-900 hover:bg-sky-100"><span className="max-w-52 truncate">{source.title}</span><ExternalLink size={12}/></a>)}</div>}
    <p className="mt-3 text-[11px] leading-5 text-stone-500">Web listings can describe a different pack or market. Check the product size and label on the seller page before relying on the match.</p>
  </section>;
}
