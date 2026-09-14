import type { Metadata } from "next";
import { getCategoryNames } from "@/lib/selection";
import "./globals.css";

const categoryNames = getCategoryNames();

export const metadata: Metadata = {
  title: `${categoryNames} 예약하기 | 새순꽃집`,
  description: `새순꽃집 ${categoryNames}을 사진으로 보고 한 번에 예약하세요.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
