import ExcelJS from "exceljs";
import { ContentStatus, type ContentRow, type WriteLogEntry } from "./types";

const CALENDAR_SHEET = "Calendar";
const LOG_SHEET = "Write Log";

const CALENDAR_COLUMNS: ReadonlyArray<{
  header: string;
  key: keyof ContentRow;
  width: number;
}> = [
  { header: "Date", key: "date", width: 14 },
  { header: "Topic", key: "topic", width: 38 },
  { header: "LinkedIn POST", key: "linkedinPost", width: 42 },
  { header: "Medium Article", key: "mediumArticle", width: 56 },
  { header: "IG Script", key: "igScript", width: 42 },
  { header: "YT Script", key: "ytScript", width: 48 },
  { header: "Dev.to Article", key: "devtoArticle", width: 56 },
  { header: "Status", key: "status", width: 14 },
  { header: "LinkedIn Image", key: "linkedinImage", width: 30 },
  { header: "Medium Image", key: "mediumImage", width: 30 },
  { header: "IG Image", key: "igImage", width: 30 }
];

const LOG_HEADERS = ["Timestamp", "Agent", "Action", "Date", "Topic", "Status", "Details"] as const;

function styleHeaderRow(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF263238" }
    };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  row.height = 22;
}

function styleBodyRow(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.alignment = { vertical: "top", wrapText: true };
  });
}

function styleLogRow(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.alignment = { vertical: "top", wrapText: true };
  });
}

export async function generateExcelBuffer(
  rows: ContentRow[],
  logs: WriteLogEntry[]
): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();

  // Calendar sheet
  const calendarSheet = workbook.addWorksheet(CALENDAR_SHEET);
  const headerRow = calendarSheet.getRow(1);
  CALENDAR_COLUMNS.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = column.header;
    calendarSheet.getColumn(index + 1).width = column.width;
  });
  styleHeaderRow(headerRow);
  calendarSheet.views = [{ state: "frozen", ySplit: 1 }];

  rows.forEach((row) => {
    const excelRow = calendarSheet.addRow(CALENDAR_COLUMNS.map((column) => String(row[column.key] ?? "")));
    styleBodyRow(excelRow);
  });

  // Log sheet
  const logSheet = workbook.addWorksheet(LOG_SHEET);
  const logHeaderRow = logSheet.getRow(1);
  LOG_HEADERS.forEach((header, index) => {
    const cell = logHeaderRow.getCell(index + 1);
    cell.value = header;
    logSheet.getColumn(index + 1).width = index === 6 ? 70 : 24;
  });
  styleHeaderRow(logHeaderRow);
  logSheet.views = [{ state: "frozen", ySplit: 1 }];

  logs.forEach((log) => {
    const logRow = logSheet.addRow([
      log.timestamp,
      log.agent,
      log.action,
      log.date,
      log.topic,
      log.status,
      log.details
    ]);
    styleLogRow(logRow);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
