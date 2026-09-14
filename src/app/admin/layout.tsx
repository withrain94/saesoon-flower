import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "예약 관리 | 새순꽃집",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex-1 bg-background">{children}</div>;
}
