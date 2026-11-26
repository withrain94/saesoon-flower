import "server-only";

import { getSmsGateEnv } from "./env";

/**
 * 문자 보내기 — 매장 안드로이드 폰의 SMS Gate 앱(클라우드 모드)에 "이 번호로 보내" 요청 → 폰이 자기 요금제로 발송.
 * 문서: https://docs.sms-gate.app/integration/api/  (POST /3rdparty/v1/messages, 202 = 접수)
 * 폰이 꺼져 있거나 앱이 멈춰 있으면 1시간 동안 기다렸다가 그 뒤엔 보내지 않음(ttl).
 */
const API = "https://api.sms-gate.app/3rdparty/v1/messages";

/** 폰이 꺼져 있을 때 기다리는 시간(초) — 한참 뒤 엉뚱한 때 문자가 나가지 않게 */
const TTL_SECONDS = 60 * 60;

/** 보낸 뒤 결과를 기다리는 시간 — 폰이 꺼내 보내기까지 30초쯤 걸릴 때가 있어 40초 (2026-11-26, 12초면 "대기 중"이 자주 떴음) */
const WAIT_MS = 40_000;
const POLL_MS = 2_000;

export type SmsResult =
  /** 폰에서 발송됨 */
  | { state: "sent" }
  /** 폰에 전달은 됐거나 기다리는 중 — 곧 나갈 수도 있음 */
  | { state: "pending" }
  | { state: "failed"; error: string }
  /** 설정(SMS_GATE_…)이 없음 */
  | { state: "notConfigured" };

type GatewayState = "Pending" | "Cancelling" | "Cancelled" | "Processed" | "Sent" | "Delivered" | "Failed";
type GatewayMessage = { id?: string; state?: GatewayState; recipients?: { state?: GatewayState; error?: string | null }[] };

function authHeader(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

function toResult(message: GatewayMessage): SmsResult | null {
  const recipient = message.recipients?.[0];
  const state = recipient?.state ?? message.state;
  if (state === "Sent" || state === "Delivered") return { state: "sent" };
  if (state === "Failed" || state === "Cancelled") {
    return { state: "failed", error: recipient?.error || "휴대폰에서 문자를 보내지 못했어요." };
  }
  return null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendSms({
  phoneNumber,
  text,
  photo,
  waitForResult = true,
  ttlSeconds = TTL_SECONDS,
}: {
  /** 국제 형식 (+8210…) */
  phoneNumber: string;
  text: string;
  /** 사진 문자로 보낼 JPG (없으면 글자 문자) */
  photo?: ArrayBuffer | null;
  /** false면 접수만 확인하고 바로 돌아옴 (자동 문자처럼 여러 통을 한 번에 보낼 때) */
  waitForResult?: boolean;
  /** 폰이 꺼져 있을 때 기다리는 시간(초) */
  ttlSeconds?: number;
}): Promise<SmsResult> {
  const env = getSmsGateEnv();
  if (!env) return { state: "notConfigured" };
  const headers = { Authorization: authHeader(env.username, env.password), "Content-Type": "application/json" };

  const body = {
    phoneNumbers: [phoneNumber],
    ttl: ttlSeconds,
    withDeliveryReport: true,
    ...(photo
      ? {
          mmsMessage: {
            text,
            attachments: [{ contentType: "image/jpeg", name: "photo.jpg", data: Buffer.from(photo).toString("base64") }],
          },
        }
      : { textMessage: { text } }),
  };

  let created: GatewayMessage;
  try {
    const response = await fetch(API, { method: "POST", headers, body: JSON.stringify(body), cache: "no-store" });
    if (response.status === 401 || response.status === 403) {
      return { state: "failed", error: "SMS Gate 사용자 이름·비밀번호가 맞지 않아요. 앱의 Cloud server 값을 다시 확인해 주세요." };
    }
    if (!response.ok) return { state: "failed", error: `문자 요청이 거절됐어요. (${response.status})` };
    created = (await response.json()) as GatewayMessage;
  } catch {
    return { state: "failed", error: "문자 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  const immediate = toResult(created);
  if (immediate || !created.id || !waitForResult) return immediate ?? { state: "pending" };

  // 폰이 실제로 보냈는지 잠깐 기다려 봄
  const deadline = Date.now() + WAIT_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_MS);
    try {
      const response = await fetch(`${API}/${encodeURIComponent(created.id)}`, { headers, cache: "no-store" });
      if (!response.ok) continue;
      const result = toResult((await response.json()) as GatewayMessage);
      if (result) return result;
    } catch {
      // 다음에 다시 확인
    }
  }
  return { state: "pending" };
}
