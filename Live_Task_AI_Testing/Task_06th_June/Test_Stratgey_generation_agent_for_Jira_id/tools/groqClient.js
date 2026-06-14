// Layer 3 Tool — GROQ test strategy generator. Atomic, deterministic.

export async function generateTestStrategy(config, issue) {
  if (!config.groqKey) throw new Error('Missing GROQ API key');

  const prompt = `ROLE: You are a senior QA engineer with 10 years of experience.

TASK: Generate a comprehensive Test Strategy for the following Jira ticket.

JIRA TICKET:
- Key: ${issue.key}
- Summary: ${issue.summary}
- Description: ${issue.description}
- Type: ${issue.issueType}

CONSTRAINTS:
- Use ONLY the information provided above.
- If information is missing, flag it in the "risks" or "gaps" section.
- Do not invent requirements or test data.
- Generate a best-effort strategy even if ticket is vague.

OUTPUT FORMAT:
Return ONLY valid JSON in this exact structure:
{
  "objective": "...",
  "inScope": "...",
  "outOfScope": "...",
  "focusAreas": "...",
  "approach": "...",
  "deliverables": "...",
  "teamAndSchedule": "...",
  "entryExitCriteria": "...",
  "risks": "..."
}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: 'You are a senior QA engineer. Return ONLY valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GROQ ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Extract JSON from markdown code blocks if present
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : content;

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(`Invalid JSON from GROQ: ${err.message}. Response: ${content.slice(0, 500)}`);
  }
}
