import QRCode from 'qrcode';

export async function text2qr(text: string): Promise<Buffer> {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('Text wajib berupa string dan tidak boleh kosong');
  }

  return QRCode.toBuffer(text.trim(), {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 1024,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}
