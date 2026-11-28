/**
 * 브라우저에서 사진을 긴 변 1200px JPG로 줄임 (관리자 사진 올리기용 — 휴대폰 원본 수 MB를 그대로 올리지 않게).
 * 읽을 수 없는 파일이면 오류.
 */
export async function resizeToJpeg(file: File, maxSide = 1200, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    return await encodeJpeg(bitmap, maxSide, quality);
  } finally {
    bitmap.close();
  }
}

/** 이미 읽은 사진(원본을 다시 읽지 않음)을 긴 변 maxSide로 줄여 JPG로 */
function encodeJpeg(source: ImageBitmap | HTMLCanvasElement, maxSide: number, quality: number): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("canvas"));
  // 투명한 PNG는 흰 바탕으로
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))), "image/jpeg", quality);
  });
}

/** 원본을 maxSide 크기 캔버스로 한 번만 그려 둠 — 여러 번 줄일 때 재료로 (큰 원본을 매번 다시 읽으면 휴대폰에서 느림) */
function drawToCanvas(bitmap: ImageBitmap, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * 용량 제한 안에서 가장 선명하게 — 화질을 조금씩 낮추고, 그래도 크면 크기를 줄임 (사진 문자용, 2026-11-26 사용자 요청: 화질 개선)
 */
async function encodeJpegUnder(source: HTMLCanvasElement, maxSide: number, quality: number, maxBytes: number): Promise<Blob> {
  let side = maxSide;
  let q = quality;
  for (let attempt = 0; attempt < 8; attempt++) {
    const blob = await encodeJpeg(source, side, q);
    if (blob.size <= maxBytes) return blob;
    if (q > 0.7) q = Math.round((q - 0.05) * 100) / 100;
    else side = Math.round(side * 0.85);
  }
  return encodeJpeg(source, 800, 0.7);
}

/**
 * 완성 사진 두 크기 — 화면용(긴 변 fullSide) + 사진 문자용(긴 변 mmsSide, mmsMaxBytes 이하).
 * 원본은 한 번만 읽고, 화면용 크기로 그린 캔버스에서 두 파일을 만듦 (2026-11-28 사용자 요청: 사진 올리기 속도)
 */
export async function makeCompletionPhotoFiles(
  file: File,
  { fullSide, fullQuality, mmsSide, mmsQuality, mmsMaxBytes }: { fullSide: number; fullQuality: number; mmsSide: number; mmsQuality: number; mmsMaxBytes: number },
): Promise<{ full: Blob; mms: Blob }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  let canvas: HTMLCanvasElement;
  try {
    canvas = drawToCanvas(bitmap, fullSide);
  } finally {
    bitmap.close();
  }
  const [full, mms] = await Promise.all([
    encodeJpeg(canvas, fullSide, fullQuality),
    encodeJpegUnder(canvas, mmsSide, mmsQuality, mmsMaxBytes),
  ]);
  return { full, mms };
}
