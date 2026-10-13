"use client";

import { createContext, useContext, type ReactNode } from "react";
import { resolveSlotPhotos, type PhotoOverrides, type SlotPhotos } from "@/lib/sitePhotos";

const PhotoOverridesContext = createContext<PhotoOverrides>({});

/** 관리자가 바꾼 사진을 화면 전체에 내려줌 — app/page.tsx가 서버에서 읽어 넘김 */
export function PhotoOverridesProvider({ overrides, children }: { overrides: PhotoOverrides; children: ReactNode }) {
  return <PhotoOverridesContext.Provider value={overrides}>{children}</PhotoOverridesContext.Provider>;
}

/**
 * 사진 자리(lib/sitePhotos의 productSlot·thumbnailSlot…)에 지금 보일 사진.
 * 사진은 data의 `images`·`image`·`thumbnail`을 직접 쓰지 말고 이 함수로 꺼낸다 (관리자가 바꾼 사진이 반영되게)
 */
export function usePhotos(): (slotId: string) => SlotPhotos {
  const overrides = useContext(PhotoOverridesContext);
  return (slotId) => resolveSlotPhotos(slotId, overrides);
}
