import type { ReactNode } from "react";

export default function ErrorText({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-sm font-medium text-danger">{children}</p>;
}
