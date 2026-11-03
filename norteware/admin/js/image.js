const FORMATS = [
  { type: "image/webp", extension: "webp" },
  { type: "image/jpeg", extension: "jpg" },
];

export async function resizeImage(file, maxSize = 1200, quality = 0.82) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  for (const { type, extension } of FORMATS) {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
    if (blob?.type !== type) continue;
    return { extension, base64: await toBase64(blob), previewUrl: URL.createObjectURL(blob) };
  }

  throw new Error("Não foi possível converter a foto.");
}

const toBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
