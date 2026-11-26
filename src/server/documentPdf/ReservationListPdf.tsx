import "server-only";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PRINT_COLUMNS, type PrintList } from "@/lib/reservationPrint";
import { PDF_FONT_FAMILY } from "./BusinessDocumentPdf";

/** 관리자 "예약 목록 인쇄" PDF — 가로 A4 표, 줄마다 맨 앞 체크 칸. 내용은 lib/reservationPrint */

const COLOR = { ink: "#111111", sub: "#666666", line: "#9a9a9a", head: "#eeeeee", strong: "#333333" };

/** 체크 칸 + PRINT_COLUMNS 너비 (합 100%) */
const WIDTHS = ["3.5%", "5.5%", "7%", "6%", "6.5%", "8.5%", "8.5%", "12%", "15%", "10.5%", "8%", "9%"];

const styles = StyleSheet.create({
  page: { fontFamily: PDF_FONT_FAMILY, fontSize: 7.5, color: COLOR.ink, paddingTop: 28, paddingBottom: 30, paddingHorizontal: 22, lineHeight: 1.35 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 },
  title: { fontSize: 14, fontWeight: 700 },
  summary: { fontSize: 9, color: COLOR.sub },
  table: { borderTopWidth: 1, borderLeftWidth: 1, borderColor: COLOR.line },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: COLOR.line },
  newReservation: { borderTopWidth: 1.2, borderTopColor: COLOR.strong },
  head: { backgroundColor: COLOR.head, fontWeight: 700 },
  cell: { paddingVertical: 4, paddingHorizontal: 3, borderRightWidth: 0.5, borderColor: COLOR.line },
  checkCell: { alignItems: "center", justifyContent: "flex-start", paddingTop: 5 },
  checkBox: { width: 10, height: 10, borderWidth: 1, borderColor: COLOR.ink },
  empty: { marginTop: 30, textAlign: "center", fontSize: 12, color: COLOR.sub },
  footer: { position: "absolute", bottom: 14, left: 22, right: 22, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: COLOR.sub },
});

function HeadRow() {
  return (
    <View style={[styles.row, styles.head]} fixed>
      {["✓", ...PRINT_COLUMNS].map((label, index) => (
        <Text key={label} style={[styles.cell, { width: WIDTHS[index], textAlign: "center" }]}>
          {index === 0 ? "체크" : label}
        </Text>
      ))}
    </View>
  );
}

/** PDF 문서(renderToBuffer에 넘길 값). printedAt: "11. 26. 오후 6:30" 같은 출력 시각 */
export function buildReservationListPdf(list: PrintList, printedAt: string) {
  return (
    <Document title={list.title}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.title}>{list.title}</Text>
          <Text style={styles.summary}>{list.summary}</Text>
        </View>
        {list.rows.length === 0 ? (
          <Text style={styles.empty}>이 날 예약이 없어요.</Text>
        ) : (
          <View style={styles.table}>
            <HeadRow />
            {list.rows.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={[styles.row, row.firstOfReservation && rowIndex > 0 ? styles.newReservation : {}]}
                wrap={false}
              >
                <View style={[styles.cell, styles.checkCell, { width: WIDTHS[0] }]}>
                  <View style={styles.checkBox} />
                </View>
                {row.cells.map((text, index) => (
                  <Text
                    key={index}
                    style={[styles.cell, { width: WIDTHS[index + 1] }, index <= 1 ? { fontWeight: 700 } : {}]}
                  >
                    {text}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}
        <View style={styles.footer} fixed>
          <Text>출력 {printedAt} · 굵은 선 = 다른 예약</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
