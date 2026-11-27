"use client";
import { LANGUAGES, PROFILES } from "@/lib/constants";
import type { Language, UserProfile } from "@/types/analysis";
export function ProfileLanguageBar({ profile, language, onProfile, onLanguage }: { profile: UserProfile; language: Language; onProfile: (value: UserProfile) => void; onLanguage: (value: Language) => void }) {
  return <div className="grid grid-cols-2 gap-3">
    <label className="text-xs font-semibold text-stone-500">PROFILE<select value={profile} onChange={(e) => onProfile(e.target.value as UserProfile)} className="mt-1.5 block w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none focus:border-emerald-600"><option value="general">General</option>{PROFILES.filter((p) => p.value !== "general").map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></label>
    <label className="text-xs font-semibold text-stone-500">SUMMARY LANGUAGE<select value={language} onChange={(e) => onLanguage(e.target.value as Language)} className="mt-1.5 block w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none focus:border-emerald-600">{LANGUAGES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
  </div>;
}
