import "server-only";

import { documentOptions } from "@/data/reservationOptions";
import { isSamePhone } from "@/lib/customerLookup";
import { buildBusinessDocument, documentFileName } from "@/lib/documents";
import type { BusinessDocumentType } from "@/types/reservation";
import { getAdminEmail, isReservationId } from "./auth";
import { renderDocumentPdf } from "./documentPdf/renderDocumentPdf";
import { getSupabaseEnv } from "./env";
import { getReservation } from "./reservations";

export type DocumentPdfResult =
  | { ok: true; fileName: string; pdf: Buffer }
  | { ok: false; status: 400 | 403 | 404 | 500 | 503 };

const isDocumentType = (value: string): value is BusinessDocumentType =>
  documentOptions.some((option) => option.value === value);

/**
 * 견적서·거래명세표 PDF 한 장 — 완료 화면(손님: 예약 id + 예약자 연락처) / 관리자 상세(로그인) 공용.
 * 손님이 요청한 서류만 만든다. 연락처가 틀리면 예약이 있는지도 알려주지 않음(404와 같은 응답)
 */
export async function getDocumentPdf(id: string, type: string, phone: string): Promise<DocumentPdfResult> {
  if (!getSupabaseEnv()) return { ok: false, status: 503 };
  if (!isReservationId(id) || !isDocumentType(type)) return { ok: false, status: 400 };

  try {
    const reservation = await getReservation(id);
    const allowed =
      reservation !== null &&
      ((phone !== "" && isSamePhone(reservation.request.ordererPhone, phone)) || (await getAdminEmail()) !== null);
    if (!reservation || !allowed) return { ok: false, status: 404 };
    if (!reservation.request.documents.includes(type)) return { ok: false, status: 404 };

    const document = buildBusinessDocument(type, reservation.request);
    return { ok: true, fileName: documentFileName(document), pdf: await renderDocumentPdf(document) };
  } catch (error) {
    console.error("[documentPdf] 만들기 실패", error instanceof Error ? error.name : "unknown");
    return { ok: false, status: 500 };
  }
}
