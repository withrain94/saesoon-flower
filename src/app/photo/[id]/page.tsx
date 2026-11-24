import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { businessInfo } from "@/data/shop";
import { formatAdminDate, formatAdminTime } from "@/lib/adminFormat";
import { isReservationId } from "@/server/auth";
import { listCompletionPhotos } from "@/server/completionPhotos";
import { getReservation } from "@/server/reservations";

export const metadata: Metadata = {
  title: "완성 사진 | 새순꽃집",
  robots: { index: false, follow: false },
};

/** 매번 새 임시 주소(1시간)를 만들어야 해서 미리 만들어 두지 않음 */
export const dynamic = "force-dynamic";

/**
 * 손님이 안내 문자 속 링크로 여는 완성 사진 화면 (/photo/예약id).
 * 예약 id(추측할 수 없는 긴 번호)를 아는 사람만 열 수 있고, 이름·연락처 같은 개인정보는 보여주지 않음
 */
export default async function CompletionPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isReservationId(id)) notFound();
  const reservation = await getReservation(id).catch(() => null);
  if (!reservation || reservation.status === "canceled") notFound();
  const photos = await listCompletionPhotos(id).catch(() => []);
  const { request } = reservation;

  return (
    <div className="mx-auto w-full max-w-lg flex-1 bg-white px-5 pb-16 pt-6">
      <p className="text-[13px] font-semibold text-brand-dark">새순 꽃집</p>
      <h1 className="mt-1 text-[22px] font-extrabold text-ink">예약하신 꽃 완성 사진</h1>
      <p lang="en" className="text-[12px] text-faint">Photos of your finished flowers</p>
      <p className="mt-2 text-[14px] text-body">
        {request.receiveMethod === "delivery" ? "배송" : "픽업"} {formatAdminDate(request.date)} {formatAdminTime(request.time)}
      </p>

      {photos.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {photos.map((photo) => (
            <li key={photo.name}>
              {/* 비공개 보관함의 임시 주소(1시간)라 next/image 대신 그냥 그림 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="완성된 꽃 사진" className="w-full rounded-xl" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-xl bg-soft px-4 py-5 text-[14px] text-body">아직 올라온 사진이 없어요.</p>
      )}

      <p className="mt-6 text-[13px] text-sub">
        문의: <a href={`tel:${businessInfo.phone}`} className="font-semibold text-brand-dark underline">{businessInfo.phone}</a>
      </p>
      <Link href="/" className="mt-2 inline-block text-[14px] font-semibold text-brand-dark hover:underline">
        새순 예약 페이지 ›
      </Link>
    </div>
  );
}
