import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const TEXT_EXTENSIONS = new Set([
  '.txt', '.md', '.csv', '.json', '.js', '.jsx', '.ts', '.tsx',
  '.java', '.py', '.html', '.htm', '.xml', '.yaml', '.yml', '.sql',
  '.css', '.scss', '.less', '.log', '.rst', '.rst', '.ini', '.conf',
  '.sh', '.bat', '.ps1', '.cpp', '.c', '.h', '.go', '.rs', '.rb',
  '.php', '.swift', '.kt', '.lua', '.r', '.pl', '.scala', '.vue',
  '.svelte', '.dockerfile', '.env', '.gitignore',
]);

export async function parseFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(dataBuffer);
    return parsed.text;
  }

  if (TEXT_EXTENSIONS.has(ext) || !ext) {
    return fs.readFileSync(filePath, 'utf-8');
  }

  // Fallback: try reading as UTF-8 text
  try {
    const text = fs.readFileSync(filePath, 'utf-8');
    // Basic heuristic: if more than 10% non-printable, reject
    const nonPrintable = text.split('').filter((ch) => {
      const code = ch.charCodeAt(0);
      return code < 32 && ![9, 10, 13].includes(code);
    }).length;
    if (nonPrintable / text.length > 0.1) {
      throw new Error(`File appears to be binary and cannot be parsed as text.`);
    }
    return text;
  } catch (err) {
    throw new Error(
      `Unsupported file type "${ext || 'unknown'}". ` +
      `Supported: PDF, TXT, MD, CSV, JSON, code files, HTML, and plain text. (${err.message})`
    );
  }
}

export async function parseUrl(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get('content-type') || '';
  const html = await res.text();

  // If it's JSON, pretty-print it
  if (contentType.includes('application/json')) {
    try {
      const obj = JSON.parse(html);
      return JSON.stringify(obj, null, 2);
    } catch {
      return html;
    }
  }

  // If it's plain text or CSV, return as-is
  if (contentType.includes('text/plain') || contentType.includes('text/csv')) {
    return html;
  }

  // Otherwise, assume HTML and extract text
  try {
    const { load } = await import('cheerio');
    const $ = load(html);
    // Remove non-content elements
    $('script, style, nav, footer, header, aside, iframe, noscript, svg, canvas, form, button, input, select, textarea').remove();
    let text = $('body').text();
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  } catch {
    // Fallback regex-based HTML stripping if cheerio not installed
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text;
  }
}
