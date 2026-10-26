import type { MetadataRoute } from "next";
import { bookingSiteUrl, privacyPath } from "@/data/shop";

/** 검색 로봇에게 알려주는 페이지 목록 (예약 조회는 검색에서 뺐으므로 없음) */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: bookingSiteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${bookingSiteUrl}${privacyPath}`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
