import type { Metadata } from "next";
import { bookingSiteUrl, searchInfo } from "@/data/shop";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(bookingSiteUrl),
  title: searchInfo.title,
  description: searchInfo.description,
  keywords: searchInfo.keywords,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "새순꽃집",
    title: searchInfo.title,
    description: searchInfo.description,
    images: ["/flowers/bouquet-80000-06.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
