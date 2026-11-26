# CleanShelf India

A mobile-first Next.js app for reading Indian packaged-food labels and auditing cart/shelf photos. It combines Gemini image extraction with a deterministic local regulatory reference catalog and a budget-aware Indian swap catalog.

## Run locally

1. Install Node.js 20.9 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` to a Google Gemini API key. The two demo buttons work without a key.
4. Run `npm run dev` and open `http://localhost:3000`.

The analysis route defaults to `gemini-3.5-flash-lite`, a multimodal model that supports structured outputs. Google currently restricts `gemini-2.5-flash` for new projects; set `GEMINI_MODEL` only if your project has access to a different supported model.

Production: `npm run build`, then `npm start`.

## Analysis notes

- The API accepts one JPEG, PNG or WebP image up to 8 MB. It supports a single label or a cart/shelf image and English, Hindi, Kannada or Telugu summaries.
- Gemini extracts visible label information and estimates. The server attaches matches from `src/data/regulatoryDb.ts`; unmatched ingredients are not assigned invented legal status.
- Regulatory permissions depend on food category, amount, use and current amendments. The local catalog is a consumer reference, not a legal compliance decision. See the official source links in that file.
- Refined-oil volume cannot be calculated from total fat alone. Cart totals state their basis and treat visible quantities as a week's purchases, not verified consumption.
- EU formulation comparisons are not presented as exact product comparisons without a counterpart label. Verified rule differences are separated from general market patterns.
- Swap prices are representative Indian retail estimates and vary by location, retailer, season and pack. Verify the exact ingredients on the pack you buy.
