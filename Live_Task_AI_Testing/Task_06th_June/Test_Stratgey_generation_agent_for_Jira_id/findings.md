# Findings

## Project Constraints

### User Selections
1. **Full comprehensive Test Strategy** — Scope, Approach, Entry/Exit Criteria, Risk, Schedule, Resources, Tools
2. **API Keys Ready** — Both Jira and GROQ keys are available and tested
3. **Minimal Jira Data** — Fetch only summary, description, issue type
4. **UI + Markdown Download** — Display in React UI + `.md` download
5. **Behavioral Rule** — Flag missing info but generate best-effort

### Technical Constraints
- **Frontend:** React (Vite-based)
- **Backend:** Vercel serverless functions (Node.js)
- **LLM:** GROQ — openai/gpt-oss-120b (free tier)
- **Jira API:** REST API v3
- **Deployment:** Vercel

### Known Issues / Learnings
- Jira API v3 requires Atlassian Document Format (ADF) for descriptions
- Jira API tokens must be paired with the correct email address
- GROQ API requires proper prompt engineering for deterministic output
- Vercel serverless functions are stateless (no filesystem writes in production)

## Architecture Decisions
- Use existing `chapter_03_BLAST_FW_JIRA_AI_AGENT` as base architecture
- Adapt for Test Strategy generation instead of Test Plan
- Reuse Jira fetch logic but simplify data payload
- Add Markdown download capability
- Use deterministic Markdown rendering (not LLM-rendered)
