import { NextResponse } from "next/server";
import { getExcelManager } from "@/lib/excelManager";
import { formatLocalDate } from "@/lib/time";
import { ContentStatus, type ContentRow } from "@/lib/types";
import {
  TopicGeneratorAgent,
  ContentWriterAgent,
  ImageGeneratorAgent
} from "@/lib/agents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STEP_SEQUENCE = [
  "topic",
  "linkedin",
  "medium",
  "ig",
  "youtube",
  "devto",
  "linkedinImage",
  "mediumImage",
  "igImage"
] as const;

type Step = (typeof STEP_SEQUENCE)[number];

function nextStep(current: Step): Step | null {
  const index = STEP_SEQUENCE.indexOf(current);
  return STEP_SEQUENCE[index + 1] ?? null;
}

function sanitizeRow(row: ContentRow): ContentRow {
  return {
    ...row,
    linkedinImage: row.linkedinImage ? "[generated]" : "",
    mediumImage: row.mediumImage ? "[generated]" : "",
    igImage: row.igImage ? "[generated]" : ""
  };
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const step = (searchParams.get("step") ?? "auto") as Step | "auto";
  const date = formatLocalDate();

  try {
    const today = await getExcelManager().getTodayRow(date);

    // Auto-detect next missing step
    if (step === "auto") {
      if (!today?.topic) {
        const row = await new TopicGeneratorAgent().run(date);
        return NextResponse.json({ ok: true, step: "topic", row: sanitizeRow(row), next: "linkedin" });
      }
      if (!today.linkedinPost) {
        const row = await runLinkedIn(date, today);
        return NextResponse.json({ ok: true, step: "linkedin", row: sanitizeRow(row), next: "medium" });
      }
      if (!today.mediumArticle) {
        const row = await runMedium(date, today);
        return NextResponse.json({ ok: true, step: "medium", row: sanitizeRow(row), next: "ig" });
      }
      if (!today.igScript) {
        const row = await runIg(date, today);
        return NextResponse.json({ ok: true, step: "ig", row: sanitizeRow(row), next: "youtube" });
      }
      if (!today.ytScript) {
        const row = await runYoutube(date, today);
        return NextResponse.json({ ok: true, step: "youtube", row: sanitizeRow(row), next: "devto" });
      }
      if (!today.devtoArticle) {
        const row = await runDevto(date, today);
        return NextResponse.json({ ok: true, step: "devto", row: sanitizeRow(row), next: "linkedinImage" });
      }
      if (!today.linkedinImage) {
        const row = await runLinkedinImage(date, today);
        return NextResponse.json({ ok: true, step: "linkedinImage", row: sanitizeRow(row), next: "mediumImage" });
      }
      if (!today.mediumImage) {
        const row = await runMediumImage(date, today);
        return NextResponse.json({ ok: true, step: "mediumImage", row: sanitizeRow(row), next: "igImage" });
      }
      if (!today.igImage) {
        const row = await runIgImage(date, today);
        return NextResponse.json({ ok: true, step: "igImage", row: sanitizeRow(row), next: null });
      }
      return NextResponse.json({ ok: true, step: "done", row: sanitizeRow(today), next: null });
    }

    // Explicit step execution
    if (step === "topic") {
      const row = await new TopicGeneratorAgent().run(date);
      return NextResponse.json({ ok: true, step: "topic", row: sanitizeRow(row), next: nextStep("topic") });
    }

    if (!today?.topic) {
      return NextResponse.json({ ok: false, step, error: "No topic found. Run 'topic' step first." }, { status: 400 });
    }

    let row: ContentRow;

    switch (step) {
      case "linkedin":
        row = await runLinkedIn(date, today);
        break;
      case "medium":
        row = await runMedium(date, today);
        break;
      case "ig":
        row = await runIg(date, today);
        break;
      case "youtube":
        row = await runYoutube(date, today);
        break;
      case "devto":
        row = await runDevto(date, today);
        break;
      case "linkedinImage":
        row = await runLinkedinImage(date, today);
        break;
      case "mediumImage":
        row = await runMediumImage(date, today);
        break;
      case "igImage":
        row = await runIgImage(date, today);
        break;
      default:
        return NextResponse.json({ ok: false, step, error: `Unknown step: ${step}` }, { status: 400 });
    }

    return NextResponse.json({ ok: true, step, row: sanitizeRow(row), next: nextStep(step) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, step, error: message }, { status: 500 });
  }
}

async function runLinkedIn(date: string, today: ContentRow): Promise<ContentRow> {
  const writer = new ContentWriterAgent();
  const content = await writer.generateLinkedInPost(today.topic);
  return getExcelManager().updateRowByDate(
    date,
    { linkedinPost: content, status: ContentStatus.Writing },
    "Content Writer",
    "Wrote LinkedIn post",
    `${content.length} characters`
  );
}

async function runMedium(date: string, today: ContentRow): Promise<ContentRow> {
  const writer = new ContentWriterAgent();
  const content = await writer.generateMediumArticle(today.topic);
  return getExcelManager().updateRowByDate(
    date,
    { mediumArticle: content, status: ContentStatus.Writing },
    "Content Writer",
    "Wrote Medium article",
    `${content.length} characters`
  );
}

async function runIg(date: string, today: ContentRow): Promise<ContentRow> {
  const writer = new ContentWriterAgent();
  const content = await writer.generateInstagramScript(today.topic);
  return getExcelManager().updateRowByDate(
    date,
    { igScript: content, status: ContentStatus.Writing },
    "Content Writer",
    "Wrote IG script",
    `${content.length} characters`
  );
}

async function runYoutube(date: string, today: ContentRow): Promise<ContentRow> {
  const writer = new ContentWriterAgent();
  const content = await writer.generateYouTubeScript(today.topic);
  return getExcelManager().updateRowByDate(
    date,
    { ytScript: content, status: ContentStatus.Writing },
    "Content Writer",
    "Wrote YouTube script",
    `${content.length} characters`
  );
}

async function runDevto(date: string, today: ContentRow): Promise<ContentRow> {
  const writer = new ContentWriterAgent();
  const content = await writer.generateDevToArticle(today.topic);
  return getExcelManager().updateRowByDate(
    date,
    { devtoArticle: content, status: ContentStatus.Imaging },
    "Content Writer",
    "Wrote Dev.to article",
    `${content.length} characters`
  );
}

async function runLinkedinImage(date: string, today: ContentRow): Promise<ContentRow> {
  const gen = new ImageGeneratorAgent();
  const url = await gen.generateImage(today.topic, "linkedin", "1200x627");
  return getExcelManager().updateRowByDate(
    date,
    { linkedinImage: url, status: ContentStatus.Imaging },
    "Image Generator",
    "Generated LinkedIn image",
    url
  );
}

async function runMediumImage(date: string, today: ContentRow): Promise<ContentRow> {
  const gen = new ImageGeneratorAgent();
  const url = await gen.generateImage(today.topic, "medium-cover", "16:9");
  return getExcelManager().updateRowByDate(
    date,
    { mediumImage: url, status: ContentStatus.Imaging },
    "Image Generator",
    "Generated Medium image",
    url
  );
}

async function runIgImage(date: string, today: ContentRow): Promise<ContentRow> {
  const gen = new ImageGeneratorAgent();
  const url = await gen.generateImage(today.topic, "instagram", "1080x1080 square");
  return getExcelManager().updateRowByDate(
    date,
    { igImage: url, status: ContentStatus.Done },
    "Image Generator",
    "Generated IG image",
    url
  );
}

