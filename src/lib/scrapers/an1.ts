import axios from 'axios';
import * as cheerio from 'cheerio';

export async function an1Search(search: string) {
  if (!search || typeof search !== 'string') {
    throw new Error('search wajib berupa string');
  }

  const url = `https://an1.com/?story=${encodeURIComponent(search)}&do=search&subaction=search`;

  const res = await axios.get(url, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });

  const $ = cheerio.load(res.data);
  const applications: any[] = [];

  $('.item').each((_, el) => {
    const e = $(el);

    applications.push({
      title: e.find('.name a span').text().trim() || null,
      link: e.find('.name a').attr('href') || null,
      developer: e.find('.developer').text().trim() || null,
      image: e.find('.img img').attr('src') || null,
      rating: {
        value: parseFloat(e.find('.current-rating').text()) || null,
        percentage: parseInt(
          (e.find('.current-rating').attr('style') || '')
            .replace('width:', '')
            .replace('%;', '')
        ) || null,
      },
      type: e.find('.item_app').hasClass('mod') ? 'MOD' : 'Original',
    });
  });

  return applications;
}
