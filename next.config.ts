import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * 개발 서버(npm run dev)에 같은 와이파이의 휴대폰 등이 IP 주소로 접속할 수 있게 허용.
   * 없으면 화면 스크립트가 막혀서 달력·승진식 안내·버튼이 동작하지 않음. 배포(Vercel)에는 영향 없음.
   * PC의 IP가 바뀌면 이 값도 바꿔야 함.
   */
  allowedDevOrigins: ["192.168.45.245"],
};

export default nextConfig;
