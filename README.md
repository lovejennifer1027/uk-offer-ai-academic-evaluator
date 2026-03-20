# UK Offer AI Academic Evaluator

Premium academic web application for UK Offer International Education.

This repository now contains two production-minded modules plus an optional accumulation foundation:

1. `UK Offer AI Academic Evaluator`
2. `UK Offer AI High-Scoring Writing Examples`
3. `UK Universities High-Scoring Writing Library` infrastructure (optional source-backed accumulation layer)

The evaluator handles formative essay scoring. The public writing-examples experience can now run in an AI-only mode: it generates high-scoring example sentences, paragraphs, templates, and follow-up insights in real time, while keeping a local browser accumulation layer for later analysis. The original source-backed library foundation, crawler, admin UI, and Supabase schema are still present for a later upgrade path.

## Product boundaries

- This is not an official university marking system.
- The writing library is not a piracy library.
- AI-generated examples must be presented as AI-generated learning material, not as real university sample answers.
- The public library only stores and displays public metadata, summaries, official rubric descriptors, short public excerpts where appropriate, source URLs, and access status.
- The product does not imply university endorsement of UK Offer.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React 19
- Server-side API routes
- OpenAI Responses API with Structured Outputs
- OpenAI embeddings API
- Supabase / PostgreSQL (optional when using source-backed accumulation)
- pgvector (optional when using source-backed accumulation)
- Vercel-ready deployment

## Main capabilities

### Essay evaluator

- Paste or upload essay text
- Paste or upload teacher brief / criteria / rubric
- Parse `.pdf`, `.docx`, `.txt`
- Score out of 100 with five 20-point dimensions
- Strict JSON-schema output from OpenAI
- Results page, history page, submission persistence

### AI high-scoring writing examples

- `/library/examples` now works as an AI-only real-time generation workspace
- Users choose subject, level, assignment type, and target score band
- The API returns:
  - high-scoring example sentences
  - a model paragraph
  - expression templates
  - analytical notes
  - usage reminders
- Generated packs are accumulated in browser local storage for later reuse
- `/library/insights` analyzes those accumulated AI-generated packs instead of pretending to query a real-time university corpus
- `/library/rubrics` can still surface rubric references from the optional source-backed layer

### Optional source-backed accumulation layer

- Universities table and source registry
- Controlled crawler for HTML / PDF / DOCX source lists
- Change detection with content hashing
- Normalization pipeline using the OpenAI Responses API
- Separate tables for:
  - universities
  - source_sites
  - source_pages
  - crawl_runs
  - normalization_runs
  - high_scoring_examples
  - rubrics
  - marker_feedback_patterns
  - library_embeddings
- Admin pages for sources, crawls, normalization, examples, rubrics, and sync
- Semantic search backed by pgvector
- Source-backed insight synthesis using retrieved evidence only

## Project structure

```text
uk-offer-ai-academic-evaluator/
├── app/
│   ├── admin/
│   │   ├── crawls/
│   │   ├── examples/
│   │   ├── library-sync/
│   │   ├── normalization/
│   │   ├── rubrics/
│   │   ├── sources/
│   │   └── universities/
│   ├── api/
│   │   ├── admin/
│   │   ├── evaluate/
│   │   ├── library/
│   │   └── submissions/
│   ├── evaluate/
│   ├── history/
│   ├── library/
│   ├── results/[id]/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── admin/
│   └── library/
├── config/
├── docs/examples/
├── lib/
│   ├── admin/
│   ├── ai-library/
│   ├── crawler/
│   ├── jobs/
│   ├── library/
│   ├── openai/
│   ├── supabase/
│   └── ...
├── public/
├── supabase/
│   ├── migrations/
│   ├── schema.sql
│   ├── seed.sql
│   └── seed-library.sql
└── README.md
```

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

For Vercel beginners, there is also a simplified Chinese deployment note:

- [`DEPLOY_VERCEL_CN.md`](./DEPLOY_VERCEL_CN.md)
- [` .env.vercel.example`](./.env.vercel.example)

### Minimum for AI-only mode

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.4
OPENAI_EXAMPLE_GENERATION_MODEL=gpt-5.4
OPENAI_EXAMPLE_INSIGHTS_MODEL=gpt-5.4

UKOFFER_ADMIN_TOKEN=choose_a_long_random_admin_token
```

This is enough to run:

- real-time essay scoring
- real-time AI-generated high-scoring examples
- browser-local accumulation
- AI insights over accumulated examples

### Additional variables for source-backed accumulation layer

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.4
OPENAI_EXAMPLE_GENERATION_MODEL=gpt-5.4
OPENAI_EXAMPLE_INSIGHTS_MODEL=gpt-5.4
OPENAI_NORMALIZATION_MODEL=gpt-5.4-mini
OPENAI_INSIGHTS_MODEL=gpt-5.4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

UKOFFER_ADMIN_TOKEN=choose_a_long_random_admin_token
```

### Optional

```env
ENABLE_DEMO_EVALUATION=true
```

When `ENABLE_DEMO_EVALUATION=true` and `OPENAI_API_KEY` is not set:

- the essay evaluator still returns deterministic demo reports
- `/library/examples` still returns deterministic AI-style demo packs
- `/library/insights` still returns deterministic demo analysis over accumulated packs

This keeps the AI-only UI flow testable before a live OpenAI key is added.

## Local setup

1. Install Node.js 20 or later.
2. Install dependencies:

```bash
npm install
```

3. Create the local environment file:

```bash
cp .env.example .env.local
```

4. If you want the source-backed accumulation layer, configure Supabase.

If you use the SQL editor manually, run:

1. [`supabase/schema.sql`](./supabase/schema.sql)
2. [`supabase/seed.sql`](./supabase/seed.sql)
3. [`supabase/seed-library.sql`](./supabase/seed-library.sql)

If you use Supabase migrations / CLI, apply:

1. [`supabase/migrations/20260320_create_writing_library.sql`](./supabase/migrations/20260320_create_writing_library.sql)
2. then seed with [`supabase/seed.sql`](./supabase/seed.sql) and [`supabase/seed-library.sql`](./supabase/seed-library.sql)

5. Run quality checks:

```bash
npm run lint
npm run build
```

6. Start the dev server:

```bash
npm run dev
```

7. Open:

- [http://localhost:3000](http://localhost:3000)
- [http://localhost:3000/library](http://localhost:3000/library)

If you are only testing the AI-only product path, you can skip the Supabase setup and still use:

- `/evaluate`
- `/library/examples`
- `/library/insights`

## Admin access

The admin UI is protected by a simple server-side session gate backed by `UKOFFER_ADMIN_TOKEN`.

1. Set `UKOFFER_ADMIN_TOKEN` in `.env.local`
2. Start the app
3. Visit any admin page, for example:
   - `/admin/universities`
   - `/admin/sources`
   - `/admin/library-sync`
4. Enter the token in the admin access form

The token is validated server-side and stored in an HTTP-only cookie. Admin API routes also accept the same secret through the `x-admin-key` header for server-to-server usage.

## Library sync architecture

### Crawl phase

- Reads active `source_sites`
- Fetches HTML / PDF / DOCX resources
- Extracts raw text
- Stores `raw_html` only where appropriate
- Avoids persisting restricted page bodies
- Computes content hash
- Writes or updates `source_pages`
- Queues only new or changed public pages for normalization

### Normalization phase

- Reads queued `normalization_runs`
- Sends only changed/new pages to OpenAI
- Uses strict Structured Outputs with JSON schema
- Allows one of:
  - `high_scoring_example`
  - `rubric`
  - `marker_feedback_pattern`
  - `ignore`
- Validates output with Zod before any DB write
- Upserts examples / rubrics / feedback rows
- Rebuilds embeddings for changed entities
- Failed normalization jobs can be retried from `/admin/normalization`, and retries immediately re-process the selected queue items

### Insights phase

- Retrieves matching records from pgvector / lexical fallback
- Builds evidence context from the database
- Sends only retrieved context to OpenAI
- Returns concise source-backed synthesis
- Avoids unsupported claims

## OpenAI implementation notes

### Essay evaluator

`POST /api/evaluate`:

1. validates form data
2. rejects empty essay submissions
3. rejects unsupported file types
4. extracts text from supported uploads
5. calls the Responses API with a strict scoring schema
6. validates with Zod
7. normalizes score totals so the five dimensions always sum to `overall_score`
8. persists to Supabase when configured

### Library normalization

Server-only files:

- [`lib/openai/client.ts`](./lib/openai/client.ts)
- [`lib/openai/normalize-page.ts`](./lib/openai/normalize-page.ts)
- [`lib/openai/schemas.ts`](./lib/openai/schemas.ts)
- [`lib/openai/prompts.ts`](./lib/openai/prompts.ts)

Model roles:

- cheaper normalization model for page extraction
- stronger insight model for source-backed synthesis

The API key is never exposed client-side.

## Public library routes

- `POST /api/library/examples/generate`
- `GET /api/library/examples`
- `GET /api/library/examples/[id]`
- `GET /api/library/rubrics`
- `GET /api/library/rubrics/[id]`
- `GET /api/library/search`
- `POST /api/library/insights/query`

## Admin routes

- `GET /api/admin/universities`
- `POST /api/admin/universities`
- `PATCH /api/admin/universities/[id]`
- `GET /api/admin/sources`
- `POST /api/admin/sources`
- `PATCH /api/admin/sources/[id]`
- `POST /api/admin/sources/[id]/test-crawl`
- `GET /api/admin/crawls`
- `GET /api/admin/crawls/[id]`
- `POST /api/admin/crawls/run`
- `GET /api/admin/normalization-runs`
- `GET /api/admin/normalization-runs/[id]`
- `POST /api/admin/normalization-runs/retry`
- `GET /api/admin/examples`
- `PATCH /api/admin/examples/[id]`
- `POST /api/admin/examples/[id]/verify`
- `GET /api/admin/rubrics`
- `PATCH /api/admin/rubrics/[id]`
- `POST /api/admin/rubrics/[id]/verify`
- `GET /api/admin/library/status`
- `POST /api/admin/library/sync-now`
- `POST /api/admin/library/rebuild-embeddings`
- `GET /api/admin/library/live-events`

## Example schema and prompt references

- Normalization schema example:
  [`docs/examples/library-normalization-schema.example.json`](./docs/examples/library-normalization-schema.example.json)
- Normalization prompt example:
  [`docs/examples/library-normalization-prompt.example.md`](./docs/examples/library-normalization-prompt.example.md)
- Insight synthesis prompt example:
  [`docs/examples/library-insights-prompt.example.md`](./docs/examples/library-insights-prompt.example.md)

## Deployment on Vercel

1. Import the project into Vercel.
2. Add the environment variables listed above.
3. Ensure Supabase has `pgvector` enabled and the migration applied.
4. Run a production build:

```bash
npm run build
```

5. Deploy.

Recommended Vercel server-side envs:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_NORMALIZATION_MODEL`
- `OPENAI_INSIGHTS_MODEL`
- `OPENAI_EMBEDDING_MODEL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `UKOFFER_ADMIN_TOKEN`
- `ENABLE_DEMO_EVALUATION`
- `NEXT_PUBLIC_SITE_URL`

## Verification status

This repository was updated to be local-test and Vercel-deploy ready by code inspection. In the current shell environment, `node` and `npm` were not available, so runtime verification was not possible here. Before production launch, run:

```bash
npm install
npm run lint
npm run build
```

and manually test:

- evaluator flow
- admin login
- source test crawl
- full library sync
- public library filters
- insight query flow
