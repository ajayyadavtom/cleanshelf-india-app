import type { Language } from "@/types/analysis";

const voiceConnectives: Record<Language, { verdict: string; oil: string; sugar: string; additives: string; items: string }> = {
  en: { verdict: "The verdict is", oil: "Estimated refined oil", sugar: "added sugar teaspoons", additives: "additive load", items: "products reviewed" },
  hi: { verdict: "नतीजा है", oil: "अनुमानित रिफाइंड तेल", sugar: "चम्मच अतिरिक्त चीनी", additives: "एडिटिव स्तर", items: "उत्पादों की जाँच हुई" },
  kn: { verdict: "ತೀರ್ಪು", oil: "ಅಂದಾಜು ರಿಫೈನ್ಡ್ ಎಣ್ಣೆ", sugar: "ಚಮಚ ಸೇರಿಸಿದ ಸಕ್ಕರೆ", additives: "ಸೇರಿಕೆಗಳ ಪ್ರಮಾಣ", items: "ಉತ್ಪನ್ನಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ" },
  te: { verdict: "తీర్పు", oil: "అంచనా రిఫైన్డ్ నూనె", sugar: "చెంచాల అదనపు చక్కెర", additives: "యాడిటివ్ స్థాయి", items: "ఉత్పత్తులను పరిశీలించాం" },
};

export function buildVoiceSummary(input: {
  language: Language;
  verdict: string;
  refinedOilMl: number;
  addedSugarTeaspoons: number;
  additiveLoad: string;
  productCount: number;
}): string {
  const words = voiceConnectives[input.language];
  return `${words.verdict}: ${input.verdict}. ${words.oil}: ${input.refinedOilMl} millilitres. ${input.addedSugarTeaspoons} ${words.sugar}. ${words.additives}: ${input.additiveLoad}. ${input.productCount} ${words.items}.`;
}

export function translateUi(language: Language) {
  const copy: Record<Language, Record<string, string>> = {
    en: { scan: "Scan packet label", audit: "Audit cart / shelf", upload: "Choose image", listen: "Listen to verdict", share: "Download comparison card", analyze: "Analyze image" },
    hi: { scan: "पैकेट लेबल स्कैन करें", audit: "कार्ट / शेल्फ जाँचें", upload: "तस्वीर चुनें", listen: "नतीजा सुनें", share: "तुलना कार्ड डाउनलोड करें", analyze: "तस्वीर जाँचें" },
    kn: { scan: "ಪ್ಯಾಕೆಟ್ ಲೇಬಲ್ ಸ್ಕ್ಯಾನ್", audit: "ಕಾರ್ಟ್ / ಶೆಲ್ಫ್ ಪರಿಶೀಲನೆ", upload: "ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ", listen: "ತೀರ್ಪು ಕೇಳಿ", share: "ಹೋಲಿಕೆ ಕಾರ್ಡ್ ಡೌನ್‌ಲೋಡ್", analyze: "ಚಿತ್ರ ವಿಶ್ಲೇಷಿಸಿ" },
    te: { scan: "ప్యాకెట్ లేబుల్ స్కాన్", audit: "కార్ట్ / షెల్ఫ్ తనిఖీ", upload: "చిత్రాన్ని ఎంచుకోండి", listen: "తీర్పు వినండి", share: "పోలిక కార్డ్ డౌన్‌లోడ్", analyze: "చిత్రాన్ని విశ్లేషించండి" },
  };
  return copy[language];
}
