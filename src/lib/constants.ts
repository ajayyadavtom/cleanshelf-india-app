import type { Language, UserProfile } from "@/types/analysis";

export const LANGUAGES: Array<{ value: Language; label: string; speechTag: string }> = [
  { value: "en", label: "English", speechTag: "en-IN" },
  { value: "hi", label: "हिन्दी", speechTag: "hi-IN" },
  { value: "kn", label: "ಕನ್ನಡ", speechTag: "kn-IN" },
  { value: "te", label: "తెలుగు", speechTag: "te-IN" },
];

export const PROFILES: Array<{ value: UserProfile; label: string }> = [
  { value: "general", label: "General" },
  { value: "diabetic", label: "Blood sugar aware" },
  { value: "kids", label: "Kids" },
  { value: "fitness", label: "Fitness" },
];

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_EDGE = 1600;
export const APP_BUILD_STAMP = "cleanshelf-india-2026.11";
