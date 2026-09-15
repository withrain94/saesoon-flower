import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import { businessInfo } from "@/data/shop";
import type { BusinessDocument } from "@/lib/documents";
import { buildDocumentsPdf, PDF_FONT_FAMILY, type SealImage } from "./BusinessDocumentPdf";

/**
 * 서류 PDF 만들기 (서버에서만). 한글 글꼴(나눔고딕, OFL 무료 글꼴)과 직인 PNG는 파일에서 읽는다.
 * 배포(Vercel)에도 이 파일들이 같이 올라가도록 next.config.ts 의 outputFileTracingIncludes 에 경로가 있다.
 */
const FONT_DIR = path.join(process.cwd(), "src", "server", "documentPdf", "fonts");

let fontsRegistered = false;
function registerFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: PDF_FONT_FAMILY,
    fonts: [
      { src: path.join(FONT_DIR, "NanumGothic-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "NanumGothic-Bold.ttf"), fontWeight: 700 },
    ],
  });
  // 한글 단어 중간에 하이픈(-)을 넣지 않음 — 띄어쓰기에서만 줄바꿈
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

/** 직인 이미지 (public 폴더의 PNG) — 파일이 없으면 직인 없이 */
function readSealImage(): SealImage | null {
  if (!businessInfo.sealImage) return null;
  const file = path.join(process.cwd(), "public", ...businessInfo.sealImage.split("/").filter(Boolean));
  return existsSync(file) ? { data: readFileSync(file), format: "png" } : null;
}

/** 서류 한 장 → PDF 파일 내용 */
export async function renderDocumentPdf(document: BusinessDocument): Promise<Buffer> {
  registerFonts();
  return renderToBuffer(buildDocumentsPdf([document], readSealImage()));
}
