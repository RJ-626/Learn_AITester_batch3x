import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export async function parsePdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const parsed = await pdfParse(dataBuffer);
  return parsed.text;
}
