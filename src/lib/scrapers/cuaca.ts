import axios from 'axios';

class WilayahService {
  private baseUrl = 'https://raw.githubusercontent.com/kodewilayah/permendagri-72-2019/main/dist/base.csv';
  private bmkgUrl = 'https://api.bmkg.go.id/publik/prakiraan-cuaca';

  private determineBMKGUrl(code: string) {
    const dots = (code.match(/\./g) || []).length;
    const admLevel = dots + 1;
    return `${this.bmkgUrl}?adm${admLevel}=${code}`;
  }

  private parseWilayahCode(code: string) {
    const parts = code.split('.');
    const levels = {
      adm1: parts[0],
      adm2: parts.length >= 2 ? parts.slice(0, 2).join('.') : null,
      adm3: parts.length >= 3 ? parts.slice(0, 3).join('.') : null,
      adm4: parts.length >= 4 ? parts.slice(0, 4).join('.') : null,
    };

    const highestLevel = Object.entries(levels)
      .reverse()
      .find(([, value]) => value !== null);

    return {
      ...levels,
      currentLevel: highestLevel ? highestLevel[0] : 'adm1',
      bmkgUrl: this.determineBMKGUrl(code),
    };
  }

  private calculateSimilarity(searchQuery: string, targetText: string) {
    const queryWords = searchQuery.toLowerCase().split(' ').filter(Boolean);
    const targetWords = targetText.toLowerCase().split(' ').filter(Boolean);

    let score = 0;
    let bonus = 0;

    for (const q of queryWords) {
      let best = 0;
      for (const t of targetWords) {
        if (q === t) {
          best = 1;
          bonus += 0.2;
          break;
        }
        if (t.includes(q) || q.includes(t)) {
          best = Math.max(best, Math.min(q.length, t.length) / Math.max(q.length, t.length));
        }
      }
      score += best;
    }

    return score / queryWords.length + bonus;
  }

  async searchWilayah(query: string) {
    const { data } = await axios.get(this.baseUrl);
    const rows = data.split('\n');
    const results: any[] = [];

    for (const row of rows) {
      if (!row.trim()) continue;
      const [kode, nama] = row.split(',');
      if (!nama) continue;

      const similarity = this.calculateSimilarity(query, nama);
      const threshold = query.length <= 4 ? 0.4 : 0.3;

      if (similarity > threshold) {
        results.push({
          kode,
          nama,
          score: similarity,
          ...this.parseWilayahCode(kode),
        });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  async getWeatherData(kode: string) {
    const url = this.determineBMKGUrl(kode);
    const { data } = await axios.get(url, { timeout: 30000 });
    return data.data;
  }

  async scrape(query: string) {
    const wilayah = await this.searchWilayah(query);
    if (!wilayah.length) return null;

    const top = wilayah[0];
    const weather = await this.getWeatherData(top.kode);

    return {
      wilayah: top,
      weather,
    };
  }
}

export const wilayahService = new WilayahService();
