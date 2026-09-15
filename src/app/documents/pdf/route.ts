import { getDocumentPdf } from "@/server/documentDownload";

/**
 * 견적서·거래명세표 PDF 받기 — POST(id, type, phone). 주소창·기록에 연락처가 남지 않도록 GET은 받지 않음.
 * 화면 버튼은 components/ui/DocumentDownloadButton
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const field = (name: string) => String(form?.get(name) ?? "").trim();

  const result = await getDocumentPdf(field("id"), field("type"), field("phone"));
  if (!result.ok) return new Response(null, { status: result.status });

  return new Response(new Uint8Array(result.pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="document.pdf"; filename*=UTF-8''${encodeURIComponent(result.fileName)}`,
      "Cache-Control": "no-store",
    },
  });
}
