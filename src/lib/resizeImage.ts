/**
 * 브라우저에서 사진을 긴 변 1200px JPG로 줄임 (관리자 사진 올리기용 — 휴대폰 원본 수 MB를 그대로 올리지 않게).
 * 읽을 수 없는 파일이면 오류.
 */
export async function resizeToJpeg(file: File, maxSide = 1200, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas");
    // 투명한 PNG는 흰 바탕으로
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))), "image/jpeg", quality);
    });
  } finally {
    bitmap.close();
  }
}
