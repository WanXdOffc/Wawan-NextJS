import axios from 'axios';

export async function getRandomWaifuImage() {
  const API_URL = 'https://api.waifu.pics/sfw/waifu';

  const { data } = await axios.get(API_URL, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });

  if (!data || !data.url) {
    throw new Error('Response API tidak valid');
  }

  const imageRes = await axios.get(data.url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });

  return {
    url: data.url,
    buffer: Buffer.from(imageRes.data),
  };
}
