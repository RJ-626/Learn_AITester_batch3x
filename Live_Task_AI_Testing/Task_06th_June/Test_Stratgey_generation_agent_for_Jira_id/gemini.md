# Gemini.md — Project Constitution

## Project: Test Strategy Generator for Jira IDs

### Data Schema

#### Input Schema (Jira Configuration)
```json
{
  "jiraUrl": "string (required) — e.g., https://your-domain.atlassian.net",
  "jiraEmail": "string (required) — Atlassian account email",
  "jiraToken": "string (required) — Jira API token",
  "groqKey": "string (required) — GROQ API key"
}
```

#### Input Schema (Jira ID)
```json
{
  "jiraId": "string (required) — e.g., KAN-5"
}
```

#### Output Schema (Jira Issue — Minimal)
```json
{
  "key": "string — e.g., KAN-5",
  "summary": "string — Ticket title",
  "description": "string — Plain text description (flattened from ADF)",
  "issueType": "string — e.g., Task, Story, Bug"
}
```

#### Output Schema (Test Strategy — PDF Format)
```json
{
  "objective": "string — The objective of testing the feature/product",
  "inScope": "string — What's included in testing",
  "outOfScope": "string — What's not included in testing",
  "focusAreas": "string — Key areas to focus on (Functional, UI, Performance, Security, Compatibility, Usability)",
  "approach": "string — Testing techniques, automation, exploratory, load, security, cross-browser, UAT",
  "deliverables": "string — Test cases, reports, performance scripts, security reports, UAT report, coverage, automation suite",
  "teamAndSchedule": "string — Team size, duration, monthly schedule breakdown",
  "entryExitCriteria": "string — Entry criteria (Ready for Testing) and exit criteria (Test completion)",
  "risks": "string — Identified risks and mitigation strategies"
}
```

#### API Response Schema (Full)
```json
{
  "issue": {
    "key": "KAN-5",
    "summary": "...",
    "description": "...",
    "issueType": "Task"
  },
  "strategy": {
    "objective": "...",
    "inScope": "...",
    "outOfScope": "...",
    "focusAreas": "...",
    "approach": "...",
    "deliverables": "...",
    "teamAndSchedule": "...",
    "entryExitCriteria": "...",
    "risks": "..."
  },
  "markdown": "string — Full formatted Markdown for download"
}
```

### UI Features
- **Dark Mode / Light Mode:** Toggle between themes using CSS variables
- **Theme Persistence:** Stored in localStorage
- **Responsive Design:** Mobile-friendly layout

### Behavioral Rules

1. **Data-First Rule:** Coding only begins once the Payload shape is confirmed.
2. **Best-Effort Generation:** Flag missing info but generate the best possible strategy.
3. **Deterministic Output:** Markdown is rendered by deterministic code, not LLM.
4. **No Hallucination:** Use only provided Jira ticket data. Do not invent requirements.
5. **Error Handling:** If Jira ticket not found, return clear error. If description is vague, flag it in `risks`.

### Architecture Invariants

- **Layer 1:** Architecture SOPs in `architecture/`
- **Layer 2:** Navigation via React UI + API routing
- **Layer 3:** Tools in `tools/` — atomic, deterministic, testable
- **Environment:** All secrets in `.env` (never committed)
- **Temp:** All intermediates in `.tmp/`
- **Deployment:** Vercel serverless

### Golden Rule
If logic changes, update the SOP before updating the code.

### Maintenance Log
- `2026-06-14` — Project initialized. Schema defined based on user selections.
- `2026-06-14` — Phase 4: Stylize — Updated to match PDF format with 8 sections. Added Dark Mode / Light Mode support.
