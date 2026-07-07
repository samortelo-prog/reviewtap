import QRCode from "qrcode";

const QR_OPTS = { errorCorrectionLevel: "M" as const, margin: 2, width: 512 };

export async function qrPng(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, { ...QR_OPTS, type: "png" });
}

export async function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { ...QR_OPTS, type: "svg" });
}
