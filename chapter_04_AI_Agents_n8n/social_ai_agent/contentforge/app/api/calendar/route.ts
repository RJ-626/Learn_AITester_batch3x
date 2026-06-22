import { NextResponse } from "next/server";
import { getExcelManager } from "@/lib/excelManager";
import type { ContentRow } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeRow(row: ContentRow): ContentRow {
  return {
    ...row,
    linkedinImage: row.linkedinImage ? "[generated]" : "",
    mediumImage: row.mediumImage ? "[generated]" : "",
    igImage: row.igImage ? "[generated]" : ""
  };
}

export async function GET() {
  try {
    const rows = await getExcelManager().getRows();
    return NextResponse.json({ rows: rows.map(sanitizeRow) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
