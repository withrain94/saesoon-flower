import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import PhotoSlotEditor from "@/components/admin/PhotoSlotEditor";
import { photoSlotGroups, photoSlots, resolveSlotPhotos } from "@/lib/sitePhotos";
import { requireAdmin } from "@/server/auth";
import { listPhotoOverrides } from "@/server/sitePhotos";

/** 사진 관리 — 사이트에 보이는 사진을 올리고·지우고·순서를 바꿈 (매장 전용) */
export default async function AdminPhotosPage() {
  const email = await requireAdmin();
  const overrides = await listPhotoOverrides().catch(() => null);

  return (
    <>
      <AdminHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-[18px] font-extrabold text-ink">🖼 사진 관리</h1>
          <Link href="/admin" className="text-[13px] font-semibold text-brand-dark">
            ‹ 예약 목록
          </Link>
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-sub">
          누르면 바로 저장되고, 손님 화면에는 1분 안에 바뀌어요. 올린 사진은 자동으로 알맞은 크기로 줄여요.
          <br />
          “대표”는 상품 목록에 작게 보이는 사진이에요. 번호는 손님이 사진을 넘겨볼 때 보이는 순서예요.
        </p>

        {!overrides ? (
          <p className="mt-6 rounded-xl bg-white px-4 py-5 text-[14px] text-danger">
            사진 정보를 불러오지 못했어요. Supabase에서 사진 관리용 SQL(site_photos 표·사진 보관함)을 실행했는지 확인하고
            새로고침해 주세요.
          </p>
        ) : (
          <>
            <nav aria-label="사진 종류" className="-mx-4 mt-3 overflow-x-auto px-4">
              <ul className="flex gap-1.5 whitespace-nowrap">
                {photoSlotGroups.map((group) => (
                  <li key={group.id}>
                    <a
                      href={`#photos-${group.id}`}
                      className="inline-flex rounded-full border border-field bg-white px-3 py-1.5 text-[13px] font-semibold text-body transition hover:border-brand"
                    >
                      {group.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {photoSlotGroups.map((group) => (
              <section key={group.id} id={`photos-${group.id}`} className="mt-5 scroll-mt-16">
                <h2 className="mb-2 px-1 text-[15px] font-extrabold text-ink">{group.label}</h2>
                <div className="space-y-2">
                  {photoSlots
                    .filter((slot) => slot.group === group.id)
                    .map((slot) => (
                      <PhotoSlotEditor
                        key={slot.id}
                        slot={slot}
                        initial={resolveSlotPhotos(slot.id, overrides)}
                        changed={slot.id in overrides}
                      />
                    ))}
                </div>
              </section>
            ))}
          </>
        )}
      </main>
    </>
  );
}
