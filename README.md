# CleanShelf India

Read the back of the pack before you pay for it.

Two modes, one pipeline:

- **Label X-Ray** — photograph the back of one Indian snack pack. Get a verdict on the refined oil, added sugar and additive load, with the exact FSSAI vs EU rule for every INS code on the label.
- **Cart / Shelf Audit** — upload a Blinkit / Zepto / Instamart cart screenshot or a supermarket shelf photo. Every item is audited at once, then totalled into weekly refined oil (ml), added sugar (teaspoons) and additive load, with a ₹-priced replacement cart.

## The one architectural decision that matters

The language model is **not** allowed to write a food law.

```
photo ──▶ gemini-2.5-flash (strict JSON schema: extraction only)
      ──▶ normaliseExtraction   (coerce, drop junk, never trust a shape)
      ──▶ runEngine             (local rule table: badges, scores, verdict, cart maths)
      ──▶ AnalysisResult
```

- `src/types/analysis.ts` defines **two** types: `ModelExtraction` (what the model may return — ingredient words, INS codes, numbers off the panel) and `AnalysisResult` (what the API returns). There is no field in the model's schema for a regulatory claim, a score or a verdict. It physically cannot return one.
- `src/data/regulatoryDb.ts` holds 46 rows of Indian and EU rule text. Every badge, every "not authorised in the EU", every ADI in the UI is read from that file on the server.
- The model's own `euComparison` rows carry a `basis` field. A `verified_rule` claim is **downgraded to `typical_pattern`** by the engine unless the rule table actually covers that dimension — so an invented citation shows up as a market observation, not a law.
- INS codes the table does not know are listed in the UI as *"Not in our rule table yet"* rather than guessed.

Scores and verdicts are deterministic and explainable (`src/lib/regulatoryEngine.ts`), so the same photograph always produces the same reading:

| Meter (0-100, higher = cleaner) | How it is computed |
| --- | --- |
| Oil quality | 100 minus a penalty per matched oil: partially hydrogenated −65, palmolein −45, interesterified −40, cottonseed −25, refined seed −15 |
| Processing (NOVA) | `max(model hint, deterministic floor)`. Any cosmetic additive (colour / flavour enhancer / emulsifier) or refined oil + refined flour pins NOVA 4. The model can raise the level, never lower it |
| Additive load | 100 minus 18 / 9 / 3 per high / moderate / low risk additive, plus 2 per additive beyond five |

Verdict: **AVOID** on a substance not permitted in India, two or more high-risk additives, an additive score under 40, refined oil in a NOVA 4 product, or ≥15 g sugar/100 g in a NOVA 4 product. **LIMIT** on one high-risk additive, additive score under 72, NOVA 4, refined oil as the main fat. **CLEAN** otherwise. The selected profile (diabetic / kids / fitness) can only make the verdict stricter.

## Quick start

```bash
npm install
cp .env.example .env.local        # add GEMINI_API_KEY
npm run dev                       # http://localhost:3000
```

`npm run build && npm start` for the production build. `npm run typecheck` for `tsc --noEmit`.

**No API key?** Both demo buttons still work. They post a recorded extraction (`src/data/demoSamples.ts`) through the real engine, so scores, badges, swaps and cart maths are live — only the vision step is skipped. Demo narrative is English; the UI says so.

## Folder structure

```
src/
├── app/
│   ├── layout.tsx              metadata, viewport, font stack
│   ├── globals.css             Tailwind layers + reduced-motion guard
│   ├── page.tsx                the whole flow (mode, upload, profile, results)
│   └── api/analyze/route.ts    multipart or JSON in, AnalysisResult out
├── components/
│   ├── ModeSwitcher.tsx        Scan packet label ⇄ Audit cart / shelf
│   ├── ImageUploader.tsx       camera + file, canvas downscale to 1600 px
│   ├── ProfileLanguageBar.tsx  general / diabetic / kids / fitness + en/hi/kn/te
│   ├── VerdictHeader.tsx       CLEAN / LIMIT / AVOID + three meters
│   ├── IndiaVsEuropeCard.tsx   side-by-side rule comparison with basis chips
│   ├── BodyTimeline.tsx        30 min / 30 days daily / long term
│   ├── SwapCards.tsx           "Same craving, zero preservatives" with ₹ delta
│   ├── AdditiveTable.tsx       every matched row, expandable, with sources
│   ├── CartAuditSummary.tsx    weekly oil / sugar / additive / spend
│   ├── ProductTabs.tsx         one tab per cart item
│   ├── SpeechSummaryButton.tsx Web Speech API playback
│   ├── ShareableComparisonCard.tsx  1080×1350 canvas PNG download
│   └── AnalyzingState.tsx      staged progress while the model reads
├── data/
│   ├── regulatoryDb.ts         46 rows + pure lookup helpers
│   ├── naturalSwaps.ts         22 ₹-priced swaps + deterministic matcher
│   └── demoSamples.ts          recorded extractions for the demo buttons
├── lib/
│   ├── regulatoryEngine.ts     matching, meters, verdict, cart, EU rows
│   ├── geminiSchema.ts         responseSchema, prompt, defensive normaliser
│   ├── speech.ts               voice script builder
│   ├── i18n.ts                 voice connectives in en / hi / kn / te
│   ├── ui.ts                   Tailwind-safe theme maps and formatters
│   └── constants.ts            language list, build stamp
└── types/analysis.ts           the two contracts
```

## API

`POST /api/analyze`

```http
# photo
Content-Type: multipart/form-data
image=<file>  mode=single|cart_shelf  language=en|hi|kn|te  userProfile=general|diabetic|kids|fitness

# demo
Content-Type: application/json
{ "sampleId": "masala-chips", "language": "en", "userProfile": "general" }
```

Errors are `{ error, code, hint }` with codes `no_image`, `bad_image`, `image_too_large`, `unsupported_type`, `missing_api_key`, `model_refused`, `model_error`, `bad_request`, `unknown_sample`. `GET /api/analyze` returns engine and rule-table metadata.

Limits: 8 MB upload (the client downscales to 1600 px / JPEG 0.85 first, typically ~400 KB), 12 products per image, `maxDuration = 60`.

## Regulatory sourcing

Snapshot: **November 2026**.

- India: FSS (Food Products Standards and Food Additives) Regulations 2011 as amended — Appendix A category-wise limits; FSS (Labelling and Display) Regulations 2020 — added sugars declared separately, specific oil must be named.
- EU: Regulation (EC) 1333/2008 (union list, Annex V warning colours), Regulation (EU) 2022/63 (titanium dioxide E171 withdrawn, in force 7 Feb 2022, market ban 7 Aug 2022), Regulation (EU) 2019/649 (2 g trans fat per 100 g fat), Regulation (EU) 2023/915 (3-MCPD and glycidyl esters), Regulation (EU) 1169/2011 (nutrition declaration, sulphite allergen).
- Front-of-pack labelling: **no FoPNL is in force in India as of November 2026.** On 26 November 2026 the Supreme Court directed FSSAI to publish a revised draft within 10 weeks using red hexagon "high fat / high sugar / high salt" warnings. The app says exactly that, and notes that the EU has no mandatory front-of-pack warning either — Nutri-Score is voluntary in most member states.

The rule table is deliberately conservative: where a limit is category-specific it says so instead of inventing one number, and where India is ahead of the EU (added sugar declaration) the card says so.

## What is not done

- **The Gemini call itself has not been exercised here** — there is no API key in the build environment. The route, schema, prompt, normaliser and every error path are in place; a real photo needs `GEMINI_API_KEY` set. The demo path proves the engine end-to-end.
- **Oil volume is an estimate**, derived from declared total fat × pack size ÷ 0.92 g/ml, assuming declared refined oil is the fat. It is labelled as an estimate everywhere it appears.
- **Prices are indicative November 2026 shelf prices.** The swaps catalog prices come from a checked list; a swap the model invents keeps the model's price and is marked `price: model estimate`.
- **UI chrome is English.** Narrative content (verdict, timeline, EU comparison, swaps) and the voice summary follow the selected language; translating the chrome into four languages is the obvious next step and the `Language` type is already threaded through.
- Share-card labels are English in all languages, because canvas needs the device's own Indic fonts to render correctly.

## Deploy

Vercel-ready as-is. Set `GEMINI_API_KEY` as a server-side environment variable (never `NEXT_PUBLIC_`). The client downscale keeps requests under Vercel's 4.5 MB body limit. On a slow connection a 1600 px photo takes 8-20 s to read.
