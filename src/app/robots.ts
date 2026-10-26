import type { MetadataRoute } from "next";
import { bookingSiteUrl } from "@/data/shop";

/** 구글 등 검색 로봇 안내 — 손님 화면만 검색에 나오게, 관리자·서버 주소는 막음 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/cron", "/documents"] },
    sitemap: `${bookingSiteUrl}/sitemap.xml`,
  };
}
