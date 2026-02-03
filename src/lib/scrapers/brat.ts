import axios from 'axios';

export async function generateBrat(text: string, isAnimated = false, delayMs = 500) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('Text wajib diisi');
  }

  const words = text.trim().split(/\s+/).slice(0, 10);
  const limitedText = words.join(' ');

  if (limitedText.length > 800) {
    throw new Error('Text maksimal 800 karakter');
  }

  const encodedText = encodeURIComponent(limitedText);

  const apiUrl = isAnimated
    ? `https://brat.siputzx.my.id/gif?text=${encodedText}&delay=${delayMs}`
    : `https://brat.siputzx.my.id/image?text=${encodedText}`;

  const res = await axios.get(apiUrl, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  return {
    buffer: Buffer.from(res.data),
    type: isAnimated ? 'gif' : 'png',
    url: apiUrl,
  };
}
