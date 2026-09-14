import Link from "next/link";
import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import ReservationDetail from "@/components/admin/ReservationDetail";
import { isReservationId, requireAdmin } from "@/server/auth";
import { getReservation } from "@/server/reservations";

export default async function AdminReservationPage({ params }: PageProps<"/admin/[id]">) {
  const email = await requireAdmin();
  const { id } = await params;
  if (!isReservationId(id)) notFound();

  // undefined = 불러오기 실패 / null = 없는 예약
  const reservation = await getReservation(id).catch(() => undefined);
  if (reservation === null) notFound();

  return (
    <>
      <AdminHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-4">
        <Link href="/admin" className="mb-3 inline-block text-[14px] font-semibold text-body print:hidden">
          ← 예약 목록
        </Link>
        {reservation ? (
          <ReservationDetail reservation={reservation} />
        ) : (
          <p className="rounded-xl bg-white px-4 py-5 text-[14px] text-danger">
            예약을 불러오지 못했어요. 잠시 후 새로고침해 주세요.
          </p>
        )}
      </main>
    </>
  );
}
