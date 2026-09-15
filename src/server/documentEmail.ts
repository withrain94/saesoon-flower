import "server-only";

import nodemailer from "nodemailer";
import { ko } from "@/i18n/ko";
import { buildDocumentEmail, buildDocumentEmailFailedNotice, documentFileName } from "@/lib/documentEmail";
import { buildBusinessDocument } from "@/lib/documents";
import type { ReservationRequest } from "@/types/reservation";
import { ADMIN_HOME_PATH } from "./auth";
import { renderDocumentPdf } from "./documentPdf/renderDocumentPdf";
import { getGmailEnv } from "./env";
import { sendTelegramMessage } from "./notify";

/** sent: 보냄 / notConfigured: Gmail 설정 없음 / noDocuments: 서류 요청이 없음 / failed: 보내기 실패 */
export type DocumentEmailResult = "sent" | "notConfigured" | "noDocuments" | "failed";

const SMTP_TIMEOUT_MS = 15000;

/**
 * 손님이 요청한 견적서·거래명세표를 PDF로 만들어 가게 Gmail로 보냄.
 * 실패해도 예외를 던지지 않음 (서류 이메일 실패가 예약 저장을 망치면 안 되므로)
 */
export async function sendDocumentEmail(id: string, request: ReservationRequest): Promise<DocumentEmailResult> {
  if (request.documents.length === 0 || !request.documentEmail) return "noDocuments";
  const env = getGmailEnv();
  if (!env) return "notConfigured";

  try {
    const documents = request.documents.map((type) => buildBusinessDocument(type, request));
    const attachments = await Promise.all(
      documents.map(async (document) => ({
        filename: documentFileName(document),
        content: await renderDocumentPdf(document),
        contentType: "application/pdf",
      })),
    );
    const { subject, text } = buildDocumentEmail(id, request);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: env.user, pass: env.appPassword },
      connectionTimeout: SMTP_TIMEOUT_MS,
      greetingTimeout: SMTP_TIMEOUT_MS,
      socketTimeout: SMTP_TIMEOUT_MS,
    });
    await transporter.sendMail({
      from: { name: ko.shop.name, address: env.user },
      to: request.documentEmail,
      subject,
      text,
      attachments,
    });
    return "sent";
  } catch (error) {
    // 비밀번호·손님 이메일은 남기지 않고 오류 종류만
    const code = typeof error === "object" && error !== null ? (error as { code?: unknown }).code : undefined;
    console.error("[documentEmail] 보내기 실패", code ?? (error instanceof Error ? error.name : "unknown"));
    return "failed";
  }
}

/** 신청 직후 자동 발송 — 실패하면 매장 텔레그램으로 알려서 관리자 화면에서 다시 보내게 함 */
export async function sendDocumentEmailAfterSubmit(id: string, request: ReservationRequest, origin: string | null) {
  const result = await sendDocumentEmail(id, request);
  if (result !== "failed") return;
  const adminUrl = origin ? `${origin}${ADMIN_HOME_PATH}/${id}` : null;
  await sendTelegramMessage(buildDocumentEmailFailedNotice(id, request, adminUrl));
}
