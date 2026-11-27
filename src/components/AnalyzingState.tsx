"use client";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
const stages=["Preparing image securely on this device","Reading visible products and label text","Matching ingredients to local references","Building your swaps and summary"];
export function AnalyzingState(){const [stage,setStage]=useState(0);useEffect(()=>{const id=window.setInterval(()=>setStage((n)=>Math.min(n+1,stages.length-1)),2400);return()=>window.clearInterval(id)},[]);return <div aria-live="polite" className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-white p-5"><LoaderCircle className="animate-spin text-emerald-700" size={24}/><div><p className="font-bold text-stone-900">Working through the label…</p><p className="text-sm text-stone-500">{stages[stage]}</p></div></div>;}
