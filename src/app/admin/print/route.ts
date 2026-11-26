import { formatAdminDateTime } from "@/lib/adminFormat";
import { buildPrintList, printListFileName } from "@/lib/reservationPrint";
import { requireAdmin } from "@/server/auth";
import { renderReservationListPdf } from "@/server/documentPdf/renderDocumentPdf";
import { listReservationsOnDate } from "@/server/reservations";

/**
 * 예약 목록 인쇄 PDF — 관리자 목록 위 "🖨 예약 목록 PDF" (?date=2026-11-27).
 * 로그인한 관리자만. 브라우저 PDF 화면에서 바로 인쇄하거나 내려받음
 */
export async function GET(request: Request) {
  await requireAdmin();

  const date = new URL(request.url).searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response("날짜를 골라 주세요.", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const reservations = await listReservationsOnDate(date);
  const pdf = await renderReservationListPdf(buildPrintList(date, reservations), formatAdminDateTime(new Date().toISOString()));

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${printListFileName(date)}"`,
      "Cache-Control": "no-store",
    },
  });
}
