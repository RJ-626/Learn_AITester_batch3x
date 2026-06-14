# SOP: GROQ Test Strategy Generation

## Goal
Generate a comprehensive Test Strategy from a Jira ticket using GROQ LLM.

## Input
```json
{
  "key": "KAN-5",
  "summary": "Feature01- dummy test feature for a login page or dashboard page.",
  "description": "As a user, I am able to sign up...",
  "issueType": "Feature"
}
```

## Output
```json
{
  "testScope": "string",
  "testApproach": "string",
  "entryCriteria": "string",
  "exitCriteria": "string",
  "riskAssessment": "string",
  "testSchedule": "string",
  "resources": "string",
  "tools": "string",
  "assumptions": "string",
  "gaps": "string"
}
```

## Process
1. Build a structured prompt with:
   - Role: "You are a senior QA engineer"
   - Context: Jira ticket summary and description
   - Task: Generate comprehensive Test Strategy
   - Constraints: Use only provided info, flag gaps
   - Output format: JSON with specific fields
2. Send to GROQ API: `POST https://api.groq.com/openai/v1/chat/completions`
3. Model: `openai/gpt-oss-120b`
4. Parse JSON response from LLM
5. Validate all required fields exist
6. Return structured strategy

## Prompt Template
```
ROLE: You are a senior QA engineer with 10 years of experience.

TASK: Generate a comprehensive Test Strategy for the following Jira ticket.

JIRA TICKET:
- Key: {key}
- Summary: {summary}
- Description: {description}
- Type: {issueType}

CONSTRAINTS:
- Use ONLY the information provided above.
- If information is missing, flag it in the "gaps" section.
- Do not invent requirements or test data.
- Generate a best-effort strategy even if ticket is vague.

OUTPUT FORMAT:
Return ONLY valid JSON in this exact structure:
{
  "testScope": "...",
  "testApproach": "...",
  "entryCriteria": "...",
  "exitCriteria": "...",
  "riskAssessment": "...",
  "testSchedule": "...",
  "resources": "...",
  "tools": "...",
  "assumptions": "...",
  "gaps": "..."
}
```

## Error Handling
| Error | Response |
|-------|----------|
| 401 Unauthorized | "Invalid GROQ API key" |
| 429 Rate Limit | "Rate limit exceeded, retry in 60 seconds" |
| 500 Server Error | "GROQ server error, retry later" |
| Invalid JSON | "LLM returned invalid JSON, retrying..." |

## Retry Logic
- On 429: Wait 60 seconds, retry once
- On invalid JSON: Retry with stricter prompt
- Max retries: 3
