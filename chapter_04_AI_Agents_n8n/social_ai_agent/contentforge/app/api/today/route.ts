import { NextResponse } from "next/server";
import { getExcelManager } from "@/lib/excelManager";
import type { ContentRow } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeRow(row: ContentRow | null): ContentRow | null {
  if (!row) return null;
  return {
    ...row,
    linkedinImage: row.linkedinImage ? "[generated]" : "",
    mediumImage: row.mediumImage ? "[generated]" : "",
    igImage: row.igImage ? "[generated]" : ""
  };
}

export async function GET() {
  try {
    const row = await getExcelManager().getTodayRow();
    return NextResponse.json({ row: sanitizeRow(row) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
