"use client";

import { useState } from "react";
import type { CompletionPhoto } from "@/server/completionPhotos";
import type { ReservationRequest } from "@/types/reservation";
import CompletionPhotoList from "./CompletionPhotoList";
import OrdererSmsSender from "./OrdererSmsSender";

/** 관리자 상세 "완성 사진·안내 문자" — 사진을 올리면 바로 문자에 붙일 수 있게 같은 목록을 씀 */
export default function CompletionPanel({
  id,
  request,
  initialPhotos,
  maxPhotos,
  smsConfigured,
  canceled,
}: {
  id: string;
  request: ReservationRequest;
  initialPhotos: CompletionPhoto[];
  maxPhotos: number;
  smsConfigured: boolean;
  canceled: boolean;
}) {
  const [photos, setPhotos] = useState(initialPhotos);

  return (
    <div className="space-y-4">
      <CompletionPhotoList id={id} photos={photos} onChange={setPhotos} max={maxPhotos} />
      {!canceled && (
        <div className="border-t border-line pt-3">
          <OrdererSmsSender id={id} request={request} photos={photos} configured={smsConfigured} />
        </div>
      )}
    </div>
  );
}
