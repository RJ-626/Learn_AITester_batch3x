# SOP: Jira Fetch

## Goal
Fetch a Jira ticket by ID and return minimal, normalized data.

## Input
- `jiraId` (string, e.g., "KAN-5")
- `jiraUrl` (string, e.g., "https://rahuljaiswal611995.atlassian.net")
- `jiraEmail` (string)
- `jiraToken` (string)

## Output
```json
{
  "key": "KAN-5",
  "summary": "Feature01- dummy test feature for a login page or dashboard page.",
  "description": "As a user...",
  "issueType": "Feature"
}
```

## Process
1. Validate inputs (URL, email, token, jiraId)
2. Build Jira REST API v3 URL: `https://rahuljaiswal611995.atlassian.net/rest/api/3/issue/{jiraId}?fields=summary,description,issuetype`
3. Send GET request with Basic Auth (email:token, base64 encoded)
4. If 404 → return clear error: "Ticket not found or no permission"
5. If 401 → return clear error: "Invalid Jira credentials"
6. Parse response, flatten ADF description to plain text
7. Return normalized JSON

## Edge Cases
- **ADF description:** Flatten Atlassian Document Format to plain text
- **Missing description:** Return empty string, flag in gaps
- **Special characters in jiraId:** URL encode the ID

## Error Handling
| Error | Response |
|-------|----------|
| 401 Unauthorized | "Invalid Jira credentials" |
| 404 Not Found | "Ticket not found or no permission" |
| 403 Forbidden | "Jira API token lacks permissions" |
| 500 Server Error | "Jira server error, retry later" |
