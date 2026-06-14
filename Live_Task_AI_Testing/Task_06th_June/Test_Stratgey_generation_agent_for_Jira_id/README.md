# Test Strategy Generator for Jira IDs

Lightweight **React + Express** app. Enter your Jira config + a GROQ key, type a Jira ID (e.g. `KAN-5`), and get a **comprehensive Test Strategy** on screen and as a downloadable `.md`.

Built with the **B.L.A.S.T.** protocol (Blueprint → Link → Architect → Stylize → Trigger) and the **A.N.T.** 3-layer architecture.

## Architecture
```
React UI (src/)  ──/api──►  Express proxy (server.js)
                               ├─ tools/jiraClient.js   (fetch + flatten ADF)
                               ├─ tools/groqClient.js   (GROQ chat, OpenAI-compatible)
                               └─ tools/testStrategy.js (prompt → JSON → Markdown)
architecture/  = Layer 1 SOPs   ·   tools/ = Layer 3 engines   ·   server.js = Layer 2 routing
```

## Setup
1. Copy `.env.sample` → `.env` and fill it (or enter the same values in the app's **Settings** tab):
   ```
   GROQ_KEY=gsk_...
   JIRA_EMAIL=you@example.com
   JIRA_API_TOKEN=ATATT...      # JIRA_TOKEN also accepted
   JIRA_URL=https://your-domain.atlassian.net
   ```
   - Jira API token: https://id.atlassian.com/manage-profile/security/api-tokens
   - GROQ key (free): https://console.groq.com/keys
2. Install: `npm install`

## Run
- **Dev** (Vite + proxy, hot reload):
  ```
  npm run dev
  ```
  Open http://localhost:5173
- **Production** (build then serve from Express):
  ```
  npm run build
  npm start                  # http://localhost:8787
  ```

## Usage
1. **Settings** tab → enter/confirm Jira + GROQ credentials (stored in browser localStorage; blanks fall back to `.env`).
2. **Generate** tab → type a Jira ID → **Generate**.
3. View the 10-section Test Strategy, toggle **Markdown**, or **Download .md**.

## Deploy (Vercel)
On Vercel the Express proxy becomes **serverless functions** under `api/` (`api/config.js`, `api/generate.js`); the Vite frontend is served statically. Config lives in `vercel.json`.

```bash
# one-time link (creates/links the project)
npx vercel link --yes

# ship to production
npx vercel deploy --prod
```

Set the four credentials as Project → Settings → Environment Variables in the Vercel dashboard
(`GROQ_KEY`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_URL`) — or just enter them in the app's **Settings** tab at runtime.

## Notes
- Model: `openai/gpt-oss-120b` (GROQ free tier).
- The generator never invents missing data — gaps render as `TBD`.
- Project memory: `task_plan.md`, `findings.md`, `progress.md`, `gemini.md` (constitution).
