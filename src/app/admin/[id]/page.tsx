import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import ReservationDetail from "@/components/admin/ReservationDetail";
import { isReservationId, requireAdmin } from "@/server/auth";
import { listCompletionPhotos, MAX_COMPLETION_PHOTOS } from "@/server/completionPhotos";
import { getSmsGateEnv } from "@/server/env";
import { getReservation } from "@/server/reservations";

/** [지금 문자 보내기]가 폰 발송 결과를 40초까지 기다리므로 넉넉히 */
export const maxDuration = 60;

export default async function AdminReservationPage({ params }: PageProps<"/admin/[id]">) {
  const email = await requireAdmin();
  const { id } = await params;
  if (!isReservationId(id)) notFound();

  // undefined = 불러오기 실패 / null = 없는 예약
  // 예약·완성 사진을 동시에 불러옴 (빠르게)
  const [reservation, photos] = await Promise.all([
    getReservation(id).catch(() => undefined),
    listCompletionPhotos(id).catch(() => []),
  ]);
  if (reservation === null) notFound();
  const completionPhotos = reservation ? photos : [];

  return (
    <>
      <AdminHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-4">
        <Link href="/admin" className="mb-3 inline-block text-[14px] font-semibold text-body print:hidden">
          ← 예약 목록
        </Link>
        {reservation ? (
          <ReservationDetail
            reservation={reservation}
            completionPhotos={completionPhotos}
            maxCompletionPhotos={MAX_COMPLETION_PHOTOS}
            smsConfigured={getSmsGateEnv() !== null}
          />
        ) : (
          <p className="rounded-xl bg-white px-4 py-5 text-[14px] text-danger">
            예약을 불러오지 못했어요. 잠시 후 새로고침해 주세요.
          </p>
        )}
      </main>
    </>
  );
}
