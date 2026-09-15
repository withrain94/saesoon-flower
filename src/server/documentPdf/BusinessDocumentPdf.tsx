import "server-only";

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { MISSING_INFO, type BusinessDocument, type DocumentParty } from "@/lib/documents";

/**
 * 견적서·거래명세표 PDF (이메일 첨부용) — 화면용 components/reservation/BusinessDocumentView 와 같은 모양.
 * 내용은 lib/documents 의 buildBusinessDocument 결과를 그대로 그림.
 */

/** globals.css 의 --color-doc-* / --color-danger 와 같은 값 (PDF에는 CSS 토큰을 쓸 수 없어 옮겨 적음) */
const COLOR = {
  ink: "#111111",
  sub: "#666666",
  line: "#9a9a9a",
  head: "#f1f1f1",
  danger: "#e5484d",
};

export const PDF_FONT_FAMILY = "NanumGothic";

const won = (amount: number) => amount.toLocaleString("ko-KR");

const styles = StyleSheet.create({
  page: { fontFamily: PDF_FONT_FAMILY, fontSize: 9.5, color: COLOR.ink, paddingVertical: 44, paddingHorizontal: 40, lineHeight: 1.45 },
  title: { fontSize: 22, fontWeight: 700, textAlign: "center", letterSpacing: 8, lineHeight: 1.2 },
  meta: { marginTop: 6, fontSize: 8.5, color: COLOR.sub, textAlign: "center" },
  parties: { marginTop: 20, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  party: { flex: 1, borderTopWidth: 1, borderLeftWidth: 1, borderColor: COLOR.line },
  cellHead: { backgroundColor: COLOR.head, fontWeight: 700 },
  caption: { paddingVertical: 3, textAlign: "center", borderRightWidth: 1, borderBottomWidth: 1, borderColor: COLOR.line },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: COLOR.line },
  partyLabel: { width: "36%", paddingVertical: 3, paddingHorizontal: 4, borderRightWidth: 1, borderColor: COLOR.line, fontWeight: 700 },
  partyValue: { flex: 1, paddingVertical: 3, paddingHorizontal: 4, borderRightWidth: 1, borderColor: COLOR.line },
  sealLine: { flexDirection: "row", alignItems: "center" },
  sealMark: { position: "relative", marginLeft: 12, color: COLOR.sub },
  sealImage: { position: "absolute", width: 34, height: 34, top: -10, left: -8 },
  totalBar: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLOR.ink,
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  totalAmount: { fontSize: 11.5, fontWeight: 700 },
  table: { marginTop: 12, borderTopWidth: 1, borderLeftWidth: 1, borderColor: COLOR.line },
  cell: { paddingVertical: 4, paddingHorizontal: 5, borderRightWidth: 1, borderColor: COLOR.line },
  notes: { marginTop: 12, fontSize: 9 },
  closing: { marginTop: 20, textAlign: "right", fontSize: 11, fontWeight: 700 },
});

/** 품목 표 칸 너비 — No / 품명 / 수량 / 단가 / 금액 */
const COLUMNS = [
  { width: "8%", align: "center" },
  { width: "44%", align: "left" },
  { width: "10%", align: "center" },
  { width: "19%", align: "right" },
  { width: "19%", align: "right" },
] as const;

function TableRow({ cells, head, bold }: { cells: string[]; head?: boolean; bold?: boolean }) {
  return (
    <View style={[styles.row, head ? styles.cellHead : {}]} wrap={false}>
      {cells.map((text, index) => (
        <Text
          key={index}
          style={[
            styles.cell,
            { width: COLUMNS[index].width, textAlign: head ? "center" : COLUMNS[index].align },
            bold ? { fontWeight: 700 } : {},
          ]}
        >
          {text}
        </Text>
      ))}
    </View>
  );
}

function SumRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.row} wrap={false}>
      <Text style={[styles.cell, { width: "81%", textAlign: "right" }, bold ? { fontWeight: 700 } : {}]}>{label}</Text>
      <Text style={[styles.cell, { width: "19%", textAlign: "right" }, bold ? { fontWeight: 700 } : {}]}>{won(value)}</Text>
    </View>
  );
}

/** 직인 PNG 파일 내용 — 파일 경로를 그대로 넘기면 Windows 경로를 인터넷 주소로 읽으려 해서 실패함 */
export type SealImage = { data: Buffer; format: "png" };

function PartyTable({ title, rows, seal }: { title: string; rows: DocumentParty; seal: SealImage | null }) {
  return (
    <View style={styles.party}>
      <Text style={[styles.caption, styles.cellHead]}>{title}</Text>
      {rows.map((row) => {
        const missing = row.value.includes(MISSING_INFO);
        return (
          <View key={row.label} style={styles.row}>
            <Text style={styles.partyLabel}>{row.label}</Text>
            <View style={styles.partyValue}>
              {row.seal && seal ? (
                <View style={styles.sealLine}>
                  <Text>{row.value}</Text>
                  <View style={styles.sealMark}>
                    <Text>(인)</Text>
                    {/* eslint-disable-next-line jsx-a11y/alt-text -- PDF 이미지에는 alt 속성이 없음 */}
                    <Image src={seal} style={styles.sealImage} />
                  </View>
                </View>
              ) : (
                <Text style={missing ? { color: COLOR.danger } : undefined}>{row.value}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** PDF 문서(renderToBuffer에 넘길 값) — 서류 여러 장이면 한 장씩. seal: 직인 이미지 (없으면 직인 없이) */
export function buildDocumentsPdf(documents: BusinessDocument[], seal: SealImage | null) {
  return (
    <Document title={documents.map((doc) => doc.title).join(", ")} author="새순" language="ko">
      {documents.map((doc) => (
        <Page key={doc.type} size="A4" style={styles.page}>
          <Text style={styles.title}>{doc.title}</Text>
          <Text style={styles.meta}>
            No. {doc.number} · 작성일 {doc.issuedDate}
          </Text>

          <View style={styles.parties}>
            <PartyTable title="공급받는 자" rows={doc.recipient} seal={null} />
            <PartyTable title="공급자" rows={doc.supplier} seal={seal} />
          </View>

          <View style={styles.totalBar}>
            <Text style={{ fontWeight: 700 }}>합계금액</Text>
            <Text style={styles.totalAmount}>
              {doc.totalText} (₩{won(doc.total)})
            </Text>
          </View>

          <View style={styles.table}>
            <TableRow head cells={["No", "품명", "수량", "단가", "금액"]} />
            {doc.rows.map((row, index) => (
              <TableRow
                key={row.name}
                cells={[String(index + 1), row.name, String(row.quantity), won(row.unitPrice), won(row.amount)]}
              />
            ))}
            {doc.tax && (
              <>
                <SumRow label="공급가액" value={doc.tax.supplyAmount} />
                <SumRow label="세액" value={doc.tax.vat} />
              </>
            )}
            <SumRow label="합계" value={doc.total} bold />
          </View>

          <View style={styles.notes}>
            {doc.notes.map((note) => (
              <Text key={note} style={note.includes(MISSING_INFO) ? { color: COLOR.danger } : undefined}>
                · {note}
              </Text>
            ))}
          </View>

          <Text style={styles.closing}>위와 같이 {doc.type === "quote" ? "견적합니다" : "거래하였음을 확인합니다"}.</Text>
        </Page>
      ))}
    </Document>
  );
}
