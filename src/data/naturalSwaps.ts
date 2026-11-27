export type Craving = "crunchy_salty" | "sweet" | "crispy" | "drink";
export type NaturalSwap = {
  id: string;
  name: string;
  type: "clean_packaged" | "whole_food";
  craving: Craving[];
  priceInr: number;
  typicalPack: string;
  description: string;
  ingredients: string;
  preservativeFree: boolean;
  shelfAvailability: string;
  tags: string[];
};

/** Representative Indian retail prices; regional and retailer prices vary. */
export const NATURAL_SWAPS: NaturalSwap[] = [
  { id: "pack-roasted-chana", name: "Plain roasted chana (pack)", type: "clean_packaged", craving: ["crunchy_salty"], priceInr: 20, typicalPack: "75 g", description: "Choose a single-ingredient or lightly salted pack without added preservatives.", ingredients: "Chickpeas; verify the current pack.", preservativeFree: true, shelfAvailability: "Kirana and quick-commerce apps", tags: ["short label", "budget"] },
  { id: "roasted-chana", name: "Plain roasted chana", type: "whole_food", craving: ["crunchy_salty"], priceInr: 25, typicalPack: "100 g", description: "Crunchy, filling and widely available loose or in small packs.", ingredients: "Chickpeas; choose plain or lightly salted.", preservativeFree: true, shelfAvailability: "Local kirana, market or pantry", tags: ["high fibre", "budget"] },
  { id: "makhana", name: "Plain makhana", type: "whole_food", craving: ["crunchy_salty"], priceInr: 45, typicalPack: "30 g", description: "Air-roast at home with a little oil, jeera and salt.", ingredients: "Fox nuts; season at home.", preservativeFree: true, shelfAvailability: "Kirana, supermarket or online", tags: ["roast at home"] },
  { id: "peanuts", name: "Roasted peanuts", type: "whole_food", craving: ["crunchy_salty"], priceInr: 20, typicalPack: "50 g", description: "A familiar savoury snack; watch the salt and portion.", ingredients: "Peanuts; choose plain roasted.", preservativeFree: true, shelfAvailability: "Local market or pantry", tags: ["budget", "protein"] },
  { id: "clean-millet", name: "Short-label millet puffs", type: "clean_packaged", craving: ["crunchy_salty"], priceInr: 40, typicalPack: "50 g", description: "Pick a brand whose current pack lists a short ingredient list and no preservative.", ingredients: "Millet, oil and spices vary by brand; check the pack.", preservativeFree: true, shelfAvailability: "Supermarkets and quick-commerce apps", tags: ["check label"] },
  { id: "fruit", name: "Seasonal whole fruit", type: "whole_food", craving: ["sweet"], priceInr: 20, typicalPack: "1 piece", description: "Banana, guava or orange depending on season and local price.", ingredients: "Whole fruit.", preservativeFree: true, shelfAvailability: "Fruit stall or market", tags: ["fibre", "seasonal"] },
  { id: "dates", name: "Dates", type: "whole_food", craving: ["sweet"], priceInr: 35, typicalPack: "50 g", description: "Naturally sweet; keep portions modest because dried fruit is concentrated.", ingredients: "Dates.", preservativeFree: true, shelfAvailability: "Kirana, market or pantry", tags: ["no added sugar"] },
  { id: "jaggery-peanut", name: "Peanut and jaggery chikki", type: "clean_packaged", craving: ["sweet"], priceInr: 20, typicalPack: "1 small piece", description: "A simple traditional sweet; compare labels for added glucose or additives.", ingredients: "Peanuts and jaggery; confirm pack ingredients.", preservativeFree: true, shelfAvailability: "Kirana and sweet shops", tags: ["portion matters"] },
  { id: "curd-fruit", name: "Plain curd with fruit", type: "whole_food", craving: ["sweet"], priceInr: 30, typicalPack: "1 bowl", description: "Mix plain curd with chopped seasonal fruit at home.", ingredients: "Plain curd and fresh fruit.", preservativeFree: true, shelfAvailability: "Dairy counter and market", tags: ["make at home"] },
  { id: "roasted-papad", name: "Roasted papad", type: "whole_food", craving: ["crispy", "crunchy_salty"], priceInr: 8, typicalPack: "1 piece", description: "Roast instead of deep-frying; check packaged papad labels for additives.", ingredients: "Lentil flour, salt and spices vary by type.", preservativeFree: true, shelfAvailability: "Kirana or pantry", tags: ["roast, don't fry"] },
  { id: "homemade-poha", name: "Home-toasted poha chivda", type: "whole_food", craving: ["crispy", "crunchy_salty"], priceInr: 30, typicalPack: "1 bowl", description: "Toast poha with peanuts, curry leaves and spices using a measured amount of oil.", ingredients: "Poha, peanuts, curry leaves, spices and a little oil.", preservativeFree: true, shelfAvailability: "Home kitchen", tags: ["batch prep"] },
  { id: "clean-baked", name: "Short-label baked khakhra", type: "clean_packaged", craving: ["crispy"], priceInr: 35, typicalPack: "2 pieces", description: "Choose a pack with a short ingredient list and no added preservatives.", ingredients: "Whole wheat flour and spices vary by brand; verify label.", preservativeFree: true, shelfAvailability: "Kirana, supermarket or online", tags: ["check label"] },
  { id: "cucumber-chaat", name: "Cucumber chaat", type: "whole_food", craving: ["crispy", "crunchy_salty"], priceInr: 25, typicalPack: "1 bowl", description: "Fresh cucumber with lemon, roasted jeera and a pinch of salt.", ingredients: "Cucumber, lemon, cumin.", preservativeFree: true, shelfAvailability: "Market or home kitchen", tags: ["fresh"] },
  { id: "nimbu-pani", name: "Fresh nimbu pani", type: "whole_food", craving: ["drink"], priceInr: 10, typicalPack: "250 ml", description: "Mix lemon, water and mint; sweetness is optional and measured.", ingredients: "Water, lemon, mint; optional small amount of sugar.", preservativeFree: true, shelfAvailability: "Home kitchen", tags: ["fresh", "customise sugar"] },
  { id: "chaas", name: "Plain chaas", type: "whole_food", craving: ["drink"], priceInr: 20, typicalPack: "250 ml", description: "Choose unsweetened plain chaas or dilute curd with water at home.", ingredients: "Curd, water, spices.", preservativeFree: true, shelfAvailability: "Dairy counter or home kitchen", tags: ["unsweetened"] },
  { id: "coconut-water", name: "Tender coconut water", type: "whole_food", craving: ["drink"], priceInr: 40, typicalPack: "1 coconut", description: "A refreshing option; price varies widely by city and season.", ingredients: "Coconut water.", preservativeFree: true, shelfAvailability: "Street vendor or market", tags: ["fresh"] },
  { id: "clean-water", name: "Plain packaged water", type: "clean_packaged", craving: ["drink"], priceInr: 20, typicalPack: "1 L", description: "For a simple drink choice when safe drinking water is not available.", ingredients: "Water.", preservativeFree: true, shelfAvailability: "Retail and quick-commerce", tags: ["no sweeteners"] },
  { id: "pack-makhana", name: "Plain makhana (pack)", type: "clean_packaged", craving: ["crunchy_salty"], priceInr: 45, typicalPack: "30 g", description: "Choose a plain pack; roast or season at home if you want more flavour.", ingredients: "Fox nuts; check the pack for added oil or seasoning.", preservativeFree: true, shelfAvailability: "Supermarkets and quick-commerce apps", tags: ["short label", "roast at home"] },
  { id: "baked-millet-chivda", name: "Short-label millet chivda", type: "clean_packaged", craving: ["crispy", "crunchy_salty"], priceInr: 35, typicalPack: "50 g", description: "Compare the current pack for oil, salt and preservative declarations.", ingredients: "Millets, oil and spices vary by product; verify the label.", preservativeFree: true, shelfAvailability: "Kirana and online grocery", tags: ["check label"] },
  { id: "single-date-pack", name: "Single-ingredient dates (pack)", type: "clean_packaged", craving: ["sweet"], priceInr: 30, typicalPack: "50 g", description: "A compact sweet option; dried fruit is concentrated, so portion size matters.", ingredients: "Dates; confirm no syrup or preservatives are added.", preservativeFree: true, shelfAvailability: "Kirana and supermarket", tags: ["no added sugar", "check label"] },
  { id: "plain-curd-cup", name: "Plain unsweetened curd cup", type: "clean_packaged", craving: ["sweet", "drink"], priceInr: 25, typicalPack: "100 g", description: "Add fresh fruit at home; compare ingredients and sugar on the current cup.", ingredients: "Milk and cultures; check the pack.", preservativeFree: true, shelfAvailability: "Dairy counter and quick-commerce", tags: ["unsweetened", "check label"] },
  { id: "plain-coconut-water-pack", name: "Unsweetened coconut water", type: "clean_packaged", craving: ["drink"], priceInr: 35, typicalPack: "200 ml", description: "Look for a short ingredient list and no added sugar or preservatives.", ingredients: "Coconut water; check the current pack.", preservativeFree: true, shelfAvailability: "Supermarket and quick-commerce", tags: ["check label"] },
];

export function matchSwaps(craving: Craving, budgetInr?: number): { packaged: NaturalSwap; wholeFood: NaturalSwap } {
  const candidates = NATURAL_SWAPS.filter((item) => item.craving.includes(craving));
  const withinBudget = budgetInr == null ? candidates : candidates.filter((item) => item.priceInr <= budgetInr);
  const pool = withinBudget.length ? withinBudget : candidates;
  const packaged = pool.find((item) => item.type === "clean_packaged") ?? candidates[0];
  const wholeFood = pool.find((item) => item.type === "whole_food") ?? candidates.find((item) => item.type === "whole_food") ?? candidates[0];
  return { packaged, wholeFood };
}

export type ReplacementCartInput = { productName: string; craving: Craving; quantity: number; estimatedPriceInr: number };
export type ReplacementCartLine = { sourceProduct: string; replacement: NaturalSwap; quantity: number; lineTotalInr: number };

/** Selects the lowest-priced whole-food swap per item, keeping visible quantities within known spend when possible. */
export function buildBudgetMatchedCart(items: ReplacementCartInput[]) {
  const budgetKnown = items.length > 0 && items.every((item) => item.estimatedPriceInr > 0);
  const budgetInr = budgetKnown ? items.reduce((sum, item) => sum + item.estimatedPriceInr * Math.max(1, item.quantity), 0) : 0;
  const lines: ReplacementCartLine[] = items.flatMap((item) => {
    const candidates = NATURAL_SWAPS.filter((swap) => swap.craving.includes(item.craving) && swap.type === "whole_food").sort((a, b) => a.priceInr - b.priceInr);
    const eligible = budgetKnown ? candidates.filter((swap) => swap.priceInr <= item.estimatedPriceInr) : candidates;
    const replacement = eligible[0];
    if (!replacement) return [];
    const quantity = Math.max(1, Math.floor(item.quantity));
    return [{ sourceProduct: item.productName, replacement, quantity, lineTotalInr: replacement.priceInr * quantity }];
  });
  const estimatedTotalInr = lines.reduce((sum, line) => sum + line.lineTotalInr, 0);
  return { budgetInr, estimatedTotalInr, withinBudget: budgetKnown && estimatedTotalInr <= budgetInr, budgetBasis: budgetKnown ? "Based on visible per-pack prices and quantities; local prices vary." : "One or more source prices were unreadable, so this is a priced suggestion list rather than a budget-verified cart.", lines };
}
