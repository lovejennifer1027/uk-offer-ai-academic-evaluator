# ScholarDesk AI

ScholarDesk AI is a bilingual academic productivity platform for compliant writing support, project knowledge bases, structured paper evaluation, requirement analysis, citation help, search review, and appeal evidence organization.

This codebase is an original product build inspired by the premium SaaS information architecture of modern AI productivity sites, but it does not reuse third-party branding, text, images, logos, or trademarked claims.

## What is included

- polished marketing homepage
- bilingual UI foundation (`zh` + `en`)
- login / signup flow with signed session cookies and local dev fallback
- dashboard shell with sidebar + top toolbar
- project workspace pages
- upload + text extraction + chunking + embedding pipeline
- retrieval-assisted chat over uploaded docs
- structured evaluation report generator
- assignment brief analyzer
- citation helper
- academic search workspace scaffold
- appeal evidence organizer scaffold
- admin overview panel
- Prisma schema + migration + seed
- local JSON fallback store for development/demo mode

## Compliance boundaries

Allowed:

- essay evaluation
- feedback reports
- rubric analysis
- outline suggestions
- citation formatting assistance
- document summarization
- academic source search support
- appeal evidence organization
- writing improvement suggestions

Not allowed:

- ghostwriting full assignments for submission
- plagiarism evasion
- AI detector bypassing / masking tools
- false claims of official partnerships
- misleading academic integrity guarantees

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- component system in `components/ui`
- Framer Motion
- Prisma
- PostgreSQL
- pgvector
- OpenAI Responses API + embeddings
- local file storage fallback
- Zod validation

## File structure

```text
app/
  admin/
  api/
  dashboard/
  login/
  pricing/
  signup/
  tools/
components/
  auth/
  dashboard/
  marketing/
  ui/
config/
lib/
prisma/
services/
types/
```

## Setup

1. Install Node.js 20+.
2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env.local
```

4. Generate Prisma client and apply the schema:

```bash
npx prisma generate
npx prisma migrate deploy
```

5. Optional: run the seed script:

```bash
npm run db:seed
```

6. Start development:

```bash
npm run dev
```

## Environment variables

The minimum local fallback setup is:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
AUTH_SECRET=replace-this-with-a-long-random-secret
AUTH_DEMO_MODE=true
ENABLE_DEMO_EVALUATION=true
```

For live OpenAI features:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

For live PostgreSQL / Prisma:

```env
DATABASE_URL=postgresql://user:password@host:5432/scholardesk
```

For a production-like auth setup:

```env
AUTH_SECRET=replace-with-a-long-random-secret
AUTH_DEMO_MODE=false
```

Optional storage variables for future S3-compatible mode:

```env
S3_ENDPOINT=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=
```

If all S3 variables are supplied, uploaded files are written to the configured S3-compatible bucket. Otherwise the app falls back to local storage under `.local/scholardesk/uploads`.

Optional local fallback override:

```env
SCHOLARDESK_LOCAL_DATA_DIR=/tmp/scholardesk
```

This is useful on platforms such as Vercel where the project directory is read-only at runtime.

## How retrieval works

1. User uploads a file.
2. The server extracts text from `pdf`, `docx`, `txt`, or `md`.
3. The text is split into chunks.
4. If OpenAI is configured, embeddings are created during upload.
5. In the current first version, chunks are stored in the local fallback store.
6. The Prisma schema, migration, and seed are included so the storage layer can be moved to PostgreSQL next.
7. Chat and evaluation requests retrieve top matching chunks for the current project.
8. Retrieved snippets are included in the assistant answer or report output.

## Mock vs live mode

### Mock / local-first mode

- `AUTH_DEMO_MODE=true`
- `ENABLE_DEMO_EVALUATION=true`
- no OpenAI key required
- no database required
- data is stored in `.local/scholardesk/store.json`
- this mode is useful for first-pass UI testing and local demos

### Live mode

- set `OPENAI_API_KEY`
- set `DATABASE_URL`
- run Prisma migrations
- run `npm run db:seed` if you want demo data in PostgreSQL
- optionally wire S3 variables
- note: the current runtime still uses the local-first repository layer, while Prisma/PostgreSQL is scaffolded and ready for the next persistence upgrade

## Deployment notes

### Vercel

- add all environment variables in Project Settings
- use a managed PostgreSQL database
- ensure persistent file storage is configured if you do not want local ephemeral uploads
- keep `AUTH_SECRET` and `OPENAI_API_KEY` server-side only

### PostgreSQL + pgvector

- enable the `vector` extension
- apply `prisma/migrations/20260320_init_scholardesk/migration.sql`
- if you later move retrieval to SQL-native similarity search, use `DocumentChunk.embedding` as the source of truth

## Important implementation note

Because the current execution environment for this build did not include `node` / `npm`, the codebase was scaffolded and refactored by static inspection only. Before shipping, run:

```bash
npm install
npm run lint
npm run build
```

## Current auth note

This first version uses a signed-cookie session layer instead of a full Auth.js adapter so the app remains runnable in local fallback mode without external providers. The Prisma schema already includes `Account`, `Session`, and `VerificationToken`, so upgrading to Auth.js later does not require redesigning the database.

## Next recommended steps

1. install dependencies and run the first local build
2. decide whether to keep the signed-cookie auth layer or swap to Auth.js
3. connect Prisma to a managed PostgreSQL database
4. connect OpenAI for live evaluation, brief analysis, and chat
5. wire S3-compatible storage if uploads must persist in production
