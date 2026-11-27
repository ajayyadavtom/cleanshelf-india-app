import { Type } from "@google/genai";

export const WEB_PRODUCT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    exactProductMatch: { type: Type.BOOLEAN },
    products: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          brand: { type: Type.STRING },
          packSize: { type: Type.STRING },
          quantityInImage: { type: Type.NUMBER },
          estimatedPriceInr: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
          oilTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
          refinedOilMlPerPackEstimate: { type: Type.NUMBER },
          oilEstimateBasis: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          insCodes: { type: Type.ARRAY, items: { type: Type.STRING } },
          nutritionHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          addedSugarGramsPerPackEstimate: { type: Type.NUMBER },
          craving: { type: Type.STRING, enum: ["crunchy_salty", "sweet", "crispy", "drink"] },
          novaHint: { type: Type.INTEGER },
        },
        required: ["productName", "brand", "packSize", "quantityInImage", "estimatedPriceInr", "confidence", "oilTypes", "refinedOilMlPerPackEstimate", "oilEstimateBasis", "ingredients", "insCodes", "nutritionHighlights", "addedSugarGramsPerPackEstimate", "craving", "novaHint"],
      },
    },
  },
  required: ["exactProductMatch", "products"],
};
