import { buildReservationCsv, reservationCsvFileName } from "@/lib/reservationBackup";
import { toNowInTimeZone } from "@/lib/time";
import { requireAdmin } from "@/server/auth";
import { listAllReservations } from "@/server/reservations";

/**
 * 예약 전체 내려받기(백업) — 관리자 목록의 "예약 전체 내려받기" 버튼.
 * 로그인한 관리자만 (requireAdmin이 아니면 로그인 화면으로 보냄). 엑셀에서 열리는 CSV 파일
 */
export async function GET() {
  await requireAdmin();

  const reservations = await listAllReservations();
  const fileName = reservationCsvFileName(toNowInTimeZone(new Date()).dateKey);

  return new Response(buildReservationCsv(reservations), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
