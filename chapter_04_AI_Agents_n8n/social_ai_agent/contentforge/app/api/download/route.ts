import { NextResponse } from "next/server";
import { getExcelManager } from "@/lib/excelManager";
import { generateExcelBuffer } from "@/lib/excelExport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const manager = getExcelManager();
    const [rows, logs] = await Promise.all([manager.getRows(), manager.getWriteLog()]);
    const buffer = await generateExcelBuffer(rows, logs);

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="content_calendar.xlsx"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
