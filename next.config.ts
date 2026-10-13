import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * 개발 서버(npm run dev)에 같은 와이파이의 휴대폰 등이 IP 주소로 접속할 수 있게 허용.
   * 없으면 화면 스크립트가 막혀서 달력·승진식 안내·버튼이 동작하지 않음. 배포(Vercel)에는 영향 없음.
   * PC의 IP가 바뀌면 이 값도 바꿔야 함.
   */
  allowedDevOrigins: ["192.168.45.245"],
  /**
   * 견적서·거래명세표 이메일 PDF에 쓰는 한글 글꼴·직인 파일 — 서버에서 파일로 읽으므로 배포 때 같이 올라가게 함
   * (server/documentPdf/renderDocumentPdf.ts)
   */
  /** 관리자 "사진 관리"에서 올린 사진(Supabase 사진 보관함)을 화면에 쓸 수 있게 허용 */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/site-photos/**" },
    ],
  },
  /** 사진 올리기 — 브라우저에서 줄여 보내지만 기본 1MB보다는 넉넉히 */
  experimental: {
    serverActions: { bodySizeLimit: "3mb" },
  },
  outputFileTracingIncludes: {
    "/**": ["./src/server/documentPdf/fonts/*.ttf", "./public/documents/*.png"],
  },
};

export default nextConfig;
