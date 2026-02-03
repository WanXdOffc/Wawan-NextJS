import axios from 'axios';

function ntext(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '');
}

export async function getCourierList() {
  const res = await axios.get('https://loman.id/resapp/getdropdown.php', {
    headers: {
      'user-agent': 'Postify/1.0.0',
      'content-type': 'application/x-www-form-urlencoded',
    },
    timeout: 5000,
  });

  if (res.data?.status !== 'berhasil') {
    throw new Error('Gagal mengambil daftar kurir');
  }

  return res.data.data.map((c: { title: string }) => ({
    name: c.title,
    normalized: ntext(c.title),
  }));
}

export async function trackResi(resi: string, courierName: string) {
  if (!resi || !courierName) {
    throw new Error('resi dan courier wajib diisi');
  }

  const couriers = await getCourierList();
  const ni = ntext(courierName);

  const courier = couriers.find(
    (c: { normalized: string }) => c.normalized.includes(ni) || ni.includes(c.normalized)
  );

  if (!courier) {
    throw new Error('Kurir tidak ditemukan');
  }

  const payload = new URLSearchParams({
    resi,
    ex: courier.name,
  }).toString();

  const res = await axios.post('https://loman.id/resapp/', payload, {
    headers: {
      'user-agent': 'Postify/1.0.0',
      'content-type': 'application/x-www-form-urlencoded',
    },
    timeout: 10000,
  });

  if (res.data?.status !== 'berhasil') {
    throw new Error('Tracking gagal');
  }

  const history = Array.isArray(res.data.history)
    ? res.data.history
        .map((h: { tanggal: string; details: string }) => ({
          datetime: h.tanggal,
          description: h.details,
          timestamp: new Date(h.tanggal.replace('Pukul', '')).getTime() || null,
        }))
        .sort((a: { timestamp: number }, b: { timestamp: number }) => (b.timestamp || 0) - (a.timestamp || 0))
    : [];

  return {
    courier: courier.name,
    resi,
    status: res.data.details?.status || 'Unknown',
    message: res.data.details?.infopengiriman || '',
    tips: res.data.details?.ucapan || '',
    history,
  };
}

export async function searchCourier(keyword: string) {
  if (!keyword) throw new Error('keyword wajib diisi');

  const couriers = await getCourierList();
  const nk = ntext(keyword);

  return couriers
    .filter((c: { normalized: string }) => c.normalized.includes(nk))
    .map((c: { name: string }) => c.name);
}
