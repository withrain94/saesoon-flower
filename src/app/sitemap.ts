import type { MetadataRoute } from "next";
import { guidePages, guidePath } from "@/data/guidePages";
import { bookingSiteUrl, privacyPath } from "@/data/shop";

/** 검색 로봇에게 알려주는 페이지 목록 (예약 조회는 검색에서 뺐으므로 없음) */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: bookingSiteUrl, changeFrequency: "weekly", priority: 1 },
    ...guidePages.map((page) => ({
      url: `${bookingSiteUrl}${guidePath(page.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${bookingSiteUrl}${privacyPath}`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
