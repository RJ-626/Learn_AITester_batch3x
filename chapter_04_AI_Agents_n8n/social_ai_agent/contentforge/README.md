# ContentForge

ContentForge is a Next.js dashboard and TypeScript pipeline for generating a daily content package from an AI topic. It uses **Groq** for text generation and **Gemini** for image generation, with data persisted in **Upstash Redis** for cloud deployment.

## Features

- **AI Topic Generation** — Fresh technical topics daily from a keyword pool
- **Multi-Platform Content** — Generates:
  - LinkedIn Post
  - Medium Article
  - Instagram Reel/Carousel Script
  - YouTube Script with Timestamps
  - Dev.to Article
- **AI Image Generation** — Creates editorial images for each platform
- **Excel Export** — Download `content_calendar.xlsx` with all content and logs
- **Vercel-Ready** — Deployed to Vercel with Upstash Redis persistence
- **Local Mode** — Run locally for full image generation without timeouts

## Architecture

```
Frontend Dashboard (Next.js 14)
  ↓
API Routes (step-by-step pipeline)
  ↓
Groq API (text) + Gemini API (images)
  ↓
Upstash Redis (persistent storage)
```

**Note:** The pipeline runs step-by-step to stay within Vercel's 10-second serverless limit. Each AI call is a separate request.

## Environment Variables

Create `.env.local` with:

```bash
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

Optional overrides:

```bash
GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Click **"Run Pipeline Now"** to generate all content and images.

## Deployment (Vercel)

```bash
vercel --prod
```

Add environment variables in the Vercel dashboard or via CLI:

```bash
vercel env add GROQ_API_KEY production
vercel env add GEMINI_API_KEY production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
```

## Vercel vs Local

| Feature | Vercel (Cloud) | Local (Dev) |
|---------|---------------|-------------|
| Text Content | ✅ Works perfectly | ✅ Works perfectly |
| Images | ⚠️ May timeout (10s limit) | ✅ All images generate |
| Scheduler | ❌ Disabled | ✅ Daily at 9 AM |
| Storage | Upstash Redis | Upstash Redis |
| Excel Export | ✅ On-the-fly generation | ✅ On-the-fly generation |

## API Routes

- `POST /api/run?step=auto` — Auto-detect and run next missing step
- `POST /api/run?step=topic` — Generate topic
- `POST /api/run?step=linkedin` — Generate LinkedIn post
- `POST /api/run?step=medium` — Generate Medium article
- `POST /api/run?step=ig` — Generate Instagram script
- `POST /api/run?step=youtube` — Generate YouTube script
- `POST /api/run?step=devto` — Generate Dev.to article
- `POST /api/run?step=linkedinImage` — Generate LinkedIn image
- `POST /api/run?step=mediumImage` — Generate Medium image
- `POST /api/run?step=igImage` — Generate Instagram image
- `GET /api/calendar` — Returns all calendar rows
- `GET /api/today` — Returns today's row
- `GET /api/status` — Returns pipeline state, API key health, and storage metadata
- `GET /api/log` — Returns write logs
- `GET /api/download` — Downloads `content_calendar.xlsx`

## Data Storage

All data is stored in **Upstash Redis** as JSON:

- **Calendar rows** — Topic, content, status, image data URIs
- **Write logs** — Timestamped log of every pipeline action

Images are stored as **base64 data URIs** directly in the database (no external storage needed).

## Content Flow

1. **Topic Generator** — Picks a fresh topic from the keyword pool via Groq
2. **Content Writer** — Generates 5 platform-specific posts via Groq
3. **Image Generator** — Creates 3 editorial images via Gemini
4. Each step writes back to Redis immediately

## Files

- `lib/agents.ts` — AI agent classes (Topic, Content, Image)
- `lib/excelManager.ts` — Redis data store manager
- `lib/excelExport.ts` — XLSX file generator
- `lib/redis.ts` — Upstash Redis client
- `app/api/run/route.ts` — Step-based pipeline API

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Groq SDK (LLM)
- Google GenAI (Gemini)
- Upstash Redis (Storage)
- ExcelJS (XLSX export)

## License

MIT
