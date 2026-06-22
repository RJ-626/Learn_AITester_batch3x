import { redis } from "./redis";
import {
  ContentStatus,
  type ContentRow,
  type WorkbookMetadata,
  type WriteLogEntry,
  isContentStatus
} from "./types";
import { formatLocalDate, nowIso } from "./time";

const DATA_KEY = "contentforge:data";

interface DataStore {
  rows: ContentRow[];
  logs: WriteLogEntry[];
  modifiedAt: string;
}

function emptyStore(): DataStore {
  return { rows: [], logs: [], modifiedAt: nowIso() };
}

async function readStore(): Promise<DataStore> {
  try {
    const data = await redis.get<DataStore>(DATA_KEY);
    return data ?? emptyStore();
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: DataStore): Promise<void> {
  store.modifiedAt = nowIso();
  await redis.set(DATA_KEY, store);
}

export class ExcelManager {
  private queue: Promise<void> = Promise.resolve();

  async getRows(): Promise<ContentRow[]> {
    const store = await readStore();
    return store.rows;
  }

  async getTodayRow(date = formatLocalDate()): Promise<ContentRow | null> {
    const store = await readStore();
    return store.rows.find((row) => row.date === date) ?? null;
  }

  async getExistingTopics(): Promise<string[]> {
    const store = await readStore();
    return store.rows.map((row) => row.topic).filter((topic) => topic.trim().length > 0);
  }

  async appendRow(
    row: ContentRow,
    agent: string,
    action: string,
    details: string
  ): Promise<ContentRow> {
    return this.withLock(async () => {
      const store = await readStore();
      store.rows.push(row);
      store.logs.unshift({
        timestamp: nowIso(),
        agent,
        action,
        date: row.date,
        topic: row.topic,
        status: row.status,
        details
      });
      await writeStore(store);
      return row;
    });
  }

  async updateRowByDate(
    date: string,
    updates: Partial<ContentRow>,
    agent: string,
    action: string,
    details: string
  ): Promise<ContentRow> {
    return this.withLock(async () => {
      const store = await readStore();
      const index = store.rows.findIndex((row) => row.date === date);
      if (index === -1) {
        throw new Error(`No content row found for ${date}.`);
      }

      store.rows[index] = { ...store.rows[index], ...updates };
      store.logs.unshift({
        timestamp: nowIso(),
        agent,
        action,
        date: store.rows[index].date,
        topic: store.rows[index].topic,
        status: store.rows[index].status,
        details
      });
      await writeStore(store);
      return store.rows[index];
    });
  }

  async addLogEntry(entry: WriteLogEntry): Promise<void> {
    return this.withLock(async () => {
      const store = await readStore();
      store.logs.unshift(entry);
      await writeStore(store);
    });
  }

  async getWriteLog(): Promise<WriteLogEntry[]> {
    const store = await readStore();
    return store.logs;
  }

  async getWorkbookMetadata(): Promise<WorkbookMetadata> {
    const store = await readStore();
    const sizeBytes = JSON.stringify(store).length;
    return {
      path: DATA_KEY,
      exists: true,
      modifiedAt: store.modifiedAt,
      sizeBytes
    };
  }

  getWorkbookPath(): string {
    return DATA_KEY;
  }

  private async withLock<T>(operation: () => Promise<T>): Promise<T> {
    const run = this.queue.then(operation, operation);
    this.queue = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }
}

let excelManagerSingleton: ExcelManager | null = null;

export function getExcelManager(): ExcelManager {
  excelManagerSingleton ??= new ExcelManager();
  return excelManagerSingleton;
}
