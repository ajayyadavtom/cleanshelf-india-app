# CleanShelf India

A mobile-first Next.js app for reading Indian packaged-food labels and auditing cart/shelf photos. It combines Gemini image extraction with a deterministic local regulatory reference catalog and a budget-aware Indian swap catalog.

## Run locally

1. Install Node.js 20.9 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` to a Google Gemini API key. The two demo buttons work without a key.
4. Run `npm run dev` and open `http://localhost:3000`.

The analysis route defaults to `gemini-3.8-flash`, which accepts image input and supports structured JSON output. If that model returns a temporary service error, the route tries `gemini-3.5-flash-lite`, a stable multimodal model designed for high-throughput extraction and structured output. Configure `GEMINI_MODEL` or `GEMINI_FALLBACK_MODEL` in your server environment to use other supported models. Each model request times out after 20 seconds so the fallback can run within the serverless function limit.

For Vercel, add `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-3.8-flash`, and `GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite` under **Project Settings → Environment Variables**, apply them to Production, then redeploy. The model settings have defaults and are optional. `.env.local` is only for local development and is intentionally excluded from Git.

Production: `npm run build`, then `npm start`.

## Analysis notes

- The API accepts one JPEG, PNG or WebP image up to 8 MB. It supports a single label or a cart/shelf image and English, Hindi, Kannada or Telugu summaries.
- Gemini extracts visible label information and estimates. The server attaches matches from `src/data/regulatoryDb.ts`; unmatched ingredients are not assigned invented legal status.
- The analyzer rejects medicine/non-food images, front-only packs, unreadable ingredient panels and low-confidence reads. It requires a visible ingredient list and does not infer a recipe from a product name. Product-specific biscuit swaps are matched to biscuits; other swaps use the detected craving category.
- Regulatory permissions depend on food category, amount, use and current amendments. The local catalog is a consumer reference, not a legal compliance decision. See the official source links in that file.
- Refined-oil volume cannot be calculated from total fat alone. Cart totals state their basis and treat visible quantities as a week's purchases, not verified consumption.
- EU formulation comparisons are not presented as exact product comparisons without a counterpart label. Verified rule differences are separated from general market patterns.
- Swap prices are representative Indian retail estimates and vary by location, retailer, season and pack. Verify the exact ingredients on the pack you buy.
