import Image from "next/image";
import {
  DOCUMENT_WIDTH,
  MISSING_INFO,
  type BusinessDocument,
  type DocumentParty,
} from "@/lib/documents";

const won = (amount: number) => amount.toLocaleString("ko-KR");

/** 견적서·거래명세표 한 장 (화면 미리보기·인쇄 공용) — 서류라서 흑백 위주 */
export default function BusinessDocumentView({ document }: { document: BusinessDocument }) {
  return (
    <article
      style={{ width: DOCUMENT_WIDTH }}
      className="business-document mx-auto bg-white px-8 py-9 text-[12px] leading-relaxed text-doc-ink"
    >
      <header className="text-center">
        <h3 className="text-[26px] font-extrabold tracking-[0.4em]">{document.title}</h3>
        <p className="mt-1 text-[11px] text-doc-sub">
          No. {document.number} · 작성일 {document.issuedDate}
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <PartyTable title="공급받는 자" rows={document.recipient} />
        <PartyTable title="공급자" rows={document.supplier} />
      </div>

      <div className="mt-5 flex items-baseline justify-between border-y-2 border-doc-ink px-2 py-2.5">
        <span className="font-bold">합계금액</span>
        <span className="text-[14px] font-extrabold">
          {document.totalText} (₩{won(document.total)})
        </span>
      </div>

      <table className="mt-4 w-full border-collapse text-center">
        <thead>
          <tr className="bg-doc-head">
            <th className="border border-doc-line py-1.5">No</th>
            <th className="border border-doc-line py-1.5">품명</th>
            <th className="border border-doc-line py-1.5">수량</th>
            <th className="border border-doc-line py-1.5">단가</th>
            <th className="border border-doc-line py-1.5">금액</th>
          </tr>
        </thead>
        <tbody>
          {document.rows.map((row, index) => (
            <tr key={row.name}>
              <td className="border border-doc-line py-1.5">{index + 1}</td>
              <td className="border border-doc-line px-2 py-1.5 text-left">{row.name}</td>
              <td className="border border-doc-line py-1.5">{row.quantity}</td>
              <td className="border border-doc-line px-2 py-1.5 text-right">{won(row.unitPrice)}</td>
              <td className="border border-doc-line px-2 py-1.5 text-right">{won(row.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {document.tax && (
            <>
              <SumRow label="공급가액" value={document.tax.supplyAmount} />
              <SumRow label="세액" value={document.tax.vat} />
            </>
          )}
          <SumRow label="합계" value={document.total} bold />
        </tfoot>
      </table>

      <ul className="mt-4 space-y-0.5 text-[11.5px]">
        {document.notes.map((note) => (
          <li key={note} className={note.includes(MISSING_INFO) ? "text-danger" : undefined}>
            · {note}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-right text-[13px] font-bold">
        위와 같이 {document.type === "quote" ? "견적합니다" : "거래하였음을 확인합니다"}.
      </p>
    </article>
  );
}

function PartyTable({ title, rows }: { title: string; rows: DocumentParty }) {
  return (
    <table className="w-full border-collapse">
      <caption className="border border-b-0 border-doc-line bg-doc-head py-1 font-bold">
        {title}
      </caption>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th className="w-[36%] border border-doc-line px-1.5 py-1 text-left font-semibold">
              {row.label}
            </th>
            <td
              className={`border border-doc-line px-1.5 py-1 ${
                row.value.includes(MISSING_INFO) ? "text-danger" : ""
              }`}
            >
              {row.seal ? (
                <>
                  {row.value}
                  <span className="relative ml-4 inline-block text-doc-sub">
                    (인)
                    {/* "(인)" 위에 겹쳐 찍음 — 인쇄 때도 바로 보이도록 지연 로딩 없이 원본 PNG 그대로 */}
                    <Image
                      src={row.seal}
                      alt="직인"
                      width={52}
                      height={52}
                      unoptimized
                      loading="eager"
                      className="pointer-events-none absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"
                    />
                  </span>
                </>
              ) : (
                row.value
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SumRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <tr className={bold ? "font-bold" : undefined}>
      <td colSpan={4} className="border border-doc-line px-2 py-1.5 text-right">
        {label}
      </td>
      <td className="border border-doc-line px-2 py-1.5 text-right">{won(value)}</td>
    </tr>
  );
}
