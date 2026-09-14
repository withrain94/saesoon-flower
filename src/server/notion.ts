import "server-only";

import {
  buildContactLists,
  buildNotionRows,
  CONTACT_LIST_TITLES,
  hasContactLists,
  NOTION_RECEIPT_COLUMN,
  NOTION_SYNC_STATUSES,
  NOTION_TABLE_HEADERS,
  notionPageTitle,
} from "@/lib/notionReservation";
import { formatReceiptNumber } from "@/lib/format";
import type { StoredReservation } from "@/types/reservation";
import { getNotionEnv } from "./env";

/**
 * 노션 날짜별 예약 표 올리기.
 * 설정: NOTION_TOKEN(노션 연결 비밀 토큰), NOTION_PARENT_PAGE_ID(날짜별 페이지를 만들 노션 페이지 주소 또는 id).
 * 부모 페이지는 노션에서 이 연결(integration)에 공유해 둬야 함.
 */

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const TIMEOUT_MS = 10_000;
/** 노션 글자 칸 하나의 최대 길이 */
const MAX_TEXT = 2000;

type NotionBlock = {
  id: string;
  type: string;
  child_page?: { title: string };
  table_row?: { cells: { plain_text: string }[][] };
  heading_3?: { rich_text: { plain_text: string }[] };
  paragraph?: { rich_text: { plain_text: string }[] };
};

class NotionError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(`Notion ${status} ${code}`);
    this.status = status;
    this.code = code;
  }
}

async function notionFetch<T>(token: string, path: string, method = "GET", body?: unknown): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${NOTION_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // 요청이 몰리면 노션이 잠깐 기다리라고 함 — 한 번만 다시 시도
    if (response.status === 429 && attempt === 0) {
      const wait = Number(response.headers.get("Retry-After") ?? "1");
      await new Promise((resolve) => setTimeout(resolve, Math.min(wait, 5) * 1000));
      continue;
    }
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { code?: string } | null;
      throw new NotionError(response.status, error?.code ?? "unknown");
    }
    return (await response.json()) as T;
  }
}

async function listChildren(token: string, blockId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | null = null;
  do {
    const query: string = cursor ? `&start_cursor=${cursor}` : "";
    const page: { results: NotionBlock[]; next_cursor: string | null } = await notionFetch(
      token,
      `/blocks/${blockId}/children?page_size=100${query}`,
    );
    blocks.push(...page.results);
    cursor = page.next_cursor;
  } while (cursor);
  return blocks;
}

function tableRow(cells: readonly string[]) {
  return {
    object: "block",
    type: "table_row",
    table_row: {
      cells: cells.map((text) => (text ? [{ type: "text", text: { content: text.slice(0, MAX_TEXT) } }] : [])),
    },
  };
}

function tableBlock(rows: string[][]) {
  return {
    object: "block",
    type: "table",
    table: {
      table_width: NOTION_TABLE_HEADERS.length,
      has_column_header: true,
      has_row_header: false,
      children: [tableRow(NOTION_TABLE_HEADERS), ...rows.map(tableRow)],
    },
  };
}

export type NotionSyncResult =
  | { kind: "not-configured" }
  | { kind: "skipped" }
  | { kind: "added" | "updated"; title: string }
  | { kind: "failed"; reason: string };

/** 노션 블록 글자 (여러 조각을 이어 붙임) */
function blockText(block: NotionBlock) {
  const content = block.type === "heading_3" ? block.heading_3 : block.type === "paragraph" ? block.paragraph : undefined;
  return content?.rich_text.map((text) => text.plain_text).join("") ?? "";
}

function cellTexts(block: NotionBlock) {
  return block.table_row?.cells.map((cell) => cell.map((text) => text.plain_text).join("")) ?? [];
}

const CONTACT_LINE = /^(\(없음\)|[\d+\-\s,]+)$/;

const textContent = (text: string) => [{ type: "text", text: { content: text.slice(0, MAX_TEXT) } }];

/**
 * 표 아래 연락처 모음(주문자·받는분, 중복 제외 20개씩)을 표 내용에 맞게 새로 씀.
 * 이전에 만든 모음(제목이 CONTACT_LIST_TITLES로 시작하는 소제목 + 바로 뒤 문단들)만 지우고 표 바로 아래에 다시 넣음 —
 * 사장님이 페이지에 따로 적은 내용은 건드리지 않음
 */
async function refreshContactLists(token: string, pageId: string) {
  const blocks = await listChildren(token, pageId);
  const table = blocks.find((block) => block.type === "table");
  if (!table) return;

  const titles = Object.values(CONTACT_LIST_TITLES);
  const oldBlocks: NotionBlock[] = [];
  let inList = false;
  for (const block of blocks) {
    if (block.type === "heading_3") inList = titles.some((title) => blockText(block).startsWith(title));
    // 모음 줄은 번호·쉼표뿐("(없음)" 포함) — 다른 글이 나오면 거기서 모음이 끝난 것
    else if (block.type !== "paragraph" || !CONTACT_LINE.test(blockText(block))) inList = false;
    if (inList) oldBlocks.push(block);
  }
  for (const block of oldBlocks) await notionFetch(token, `/blocks/${block.id}`, "DELETE");

  const rows = (await listChildren(token, table.id)).filter((block) => block.type === "table_row").slice(1).map(cellTexts);
  const children = buildContactLists(rows).flatMap(({ title, lines }) => [
    { object: "block", type: "heading_3", heading_3: { rich_text: textContent(title) } },
    ...(lines.length ? lines : ["(없음)"]).map((line) => ({
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: textContent(line) },
    })),
  ]);
  await notionFetch(token, `/blocks/${pageId}/children`, "PATCH", { children, after: table.id });
}

/**
 * 예약 한 건을 노션 표에 맞춤 — 여러 번 불러도 줄이 겹치지 않음 (접수번호 칸으로 찾음).
 * - 입금·결제 확인 이후 상태: 받는 날짜 페이지(없으면 만듦)의 표에 줄 추가, 이미 있으면 내용 갱신
 * - 그 밖의 상태(접수·취소): 이미 올라간 줄만 갱신 (취소면 예약종류 앞에 [취소])
 * - 인재개발원 날짜 페이지는 표가 바뀔 때마다 표 아래 연락처 모음도 새로 씀
 * 실패해도 예외를 던지지 않음 — 노션 문제로 관리자 상태 저장이 막히면 안 되므로
 */
export async function syncReservationToNotion(reservation: StoredReservation): Promise<NotionSyncResult> {
  const env = getNotionEnv();
  if (!env) return { kind: "not-configured" };

  const { token } = env;
  try {
    const { kind, pageId } = await syncRows(env, reservation);
    const title = notionPageTitle(reservation.request.date);
    if (kind === "skipped" || !pageId) return { kind: "skipped" };
    if (hasContactLists(reservation.request.date)) await refreshContactLists(token, pageId);
    return { kind, title };
  } catch (error) {
    // 고객 정보는 남기지 않고 오류 종류만
    const reason = error instanceof NotionError ? `${error.status} ${error.code}` : error instanceof Error ? error.name : "unknown";
    console.error("[notion] 올리기 실패", reason);
    return { kind: "failed", reason };
  }
}

/** 표 줄 추가·갱신 — 바뀐 날짜 페이지 id를 돌려줌 */
async function syncRows(
  { token, parentPageId }: { token: string; parentPageId: string },
  reservation: StoredReservation,
): Promise<{ kind: "added" | "updated" | "skipped"; pageId?: string }> {
  const shouldList = NOTION_SYNC_STATUSES.includes(reservation.status);
  const title = notionPageTitle(reservation.request.date);
  const rows = buildNotionRows(reservation);

  const dayPage = (await listChildren(token, parentPageId)).find(
    (block) => block.type === "child_page" && block.child_page?.title === title,
  );
  if (!dayPage) {
    if (!shouldList) return { kind: "skipped" };
    const page: { id: string } = await notionFetch(token, "/pages", "POST", {
      parent: { page_id: parentPageId },
      properties: { title: { title: [{ type: "text", text: { content: title } }] } },
      children: [tableBlock(rows)],
    });
    return { kind: "added", pageId: page.id };
  }

  const table = (await listChildren(token, dayPage.id)).find((block) => block.type === "table");
  if (!table) {
    if (!shouldList) return { kind: "skipped" };
    await notionFetch(token, `/blocks/${dayPage.id}/children`, "PATCH", { children: [tableBlock(rows)] });
    return { kind: "added", pageId: dayPage.id };
  }

  const receipt = formatReceiptNumber(reservation.id);
  const existing = (await listChildren(token, table.id)).filter(
    (block) => block.type === "table_row" && cellTexts(block)[NOTION_RECEIPT_COLUMN] === receipt,
  );
  if (existing.length === 0) {
    if (!shouldList) return { kind: "skipped" };
    await notionFetch(token, `/blocks/${table.id}/children`, "PATCH", { children: rows.map(tableRow) });
    return { kind: "added", pageId: dayPage.id };
  }

  // 이미 올라간 줄은 순서대로 내용 갱신, 모자라면 뒤에 추가
  for (const [index, block] of existing.entries()) {
    if (!rows[index]) break;
    await notionFetch(token, `/blocks/${block.id}`, "PATCH", { table_row: tableRow(rows[index]).table_row });
  }
  if (rows.length > existing.length) {
    await notionFetch(token, `/blocks/${table.id}/children`, "PATCH", {
      children: rows.slice(existing.length).map(tableRow),
    });
  }
  return { kind: "updated", pageId: dayPage.id };
}
