// Vercel serverless function: POST /api/generate — Jira fetch -> GROQ -> Markdown.
import { fetchIssue } from '../tools/jiraClient.js';
import { generateTestStrategy } from '../tools/groqClient.js';
import { renderMarkdown } from '../tools/testStrategy.js';

function mergeConfig(body = {}) {
  const c = body.config || {};
  return {
    jiraUrl: (c.jiraUrl || '').trim() || process.env.JIRA_URL || '',
    jiraEmail: (c.jiraEmail || '').trim() || process.env.JIRA_EMAIL || '',
    jiraToken: (c.jiraToken || '').trim() || process.env.JIRA_API_TOKEN || process.env.JIRA_TOKEN || '',
    groqKey: (c.groqKey || '').trim() || process.env.GROQ_KEY || '',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const jiraId = (body.jiraId || '').trim();
    if (!jiraId) return res.status(400).json({ error: 'Missing jiraId' });

    const config = mergeConfig(body);
    const issue = await fetchIssue(config, jiraId);
    const strategy = await generateTestStrategy(config, issue);
    const markdown = renderMarkdown(strategy, issue);

    res.status(200).json({ issue, strategy, markdown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
