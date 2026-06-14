# Project: Test Strategy Generator for Jira IDs

## Objective
Build a lightweight React application that takes Jira credentials and a Jira ID, fetches the ticket, and automatically generates a comprehensive Test Strategy using GROQ (openai/gpt-oss-120b).

## Phases & Status

- [ ] **Phase 0: Initialization** — Create project memory files
- [ ] **Phase 1: Blueprint** — Define data schema, architecture, and SOPs
- [ ] **Phase 2: Link** — Verify API connections (Jira + GROQ)
- [ ] **Phase 3: Architect** — Build the 3-layer system
  - [ ] Layer 1: Architecture SOPs (`architecture/`)
  - [ ] Layer 2: Navigation (React UI + API routing)
  - [ ] Layer 3: Tools (`tools/` — Python scripts for deterministic logic)
- [ ] **Phase 4: Stylize** — UI/UX refinement, payload formatting
- [ ] **Phase 5: Trigger** — Deploy to Vercel, finalize documentation

## Goals
1. Accept Jira config (URL, email, token) + GROQ API key in Settings
2. Accept Jira ID input (e.g., KAN-5)
3. Fetch ticket: summary, description, issue type
4. Generate comprehensive Test Strategy via GROQ
5. Display in React UI with formatted output
6. Allow download as `.md` file
7. Flag missing info but generate best-effort strategy

## Checklist
- [ ] Data Schema defined in `gemini.md`
- [ ] API connections verified (Jira + GROQ)
- [ ] React UI built (Settings, Generate, Output)
- [ ] Serverless API endpoints (Vercel)
- [ ] Test Strategy template defined
- [ ] Download as `.md` implemented
- [ ] Deployed to Vercel
- [ ] Documentation complete
