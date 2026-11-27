"use client";
import { useState } from "react";
import { Headphones, Square } from "lucide-react";
import { speakAnalysis } from "@/lib/speech";
import type { AnalysisResult } from "@/types/analysis";
export function SpeechSummaryButton({ result }: { result: AnalysisResult }) { const [playing,setPlaying]=useState(false); function toggle(){ if(!("speechSynthesis" in window)) return; if(playing){window.speechSynthesis.cancel();setPlaying(false);return;} setPlaying(true); if(!speakAnalysis(result,result.language,()=>setPlaying(false)))setPlaying(false); } return <button onClick={toggle} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">{playing?<Square size={16}/>:<Headphones size={16}/>} {playing?"Stop audio":"Listen to verdict"}</button>; }
