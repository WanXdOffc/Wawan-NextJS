const SPOTDOWN_HEADERS = {
  "Accept": "application/json, text/plain, */*",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Referer": "https://spotdown.org/",
  "Origin": "https://spotdown.org",
  "Content-Type": "application/json",
};

export interface SpotifySong {
  title: string;
  artist: string;
  duration: string;
  cover: string;
  url: string;
}

export async function getSpotifyMetadata(query: string): Promise<SpotifySong[]> {
  const res = await fetch(
    `https://spotdown.org/api/song-details?url=${encodeURIComponent(query)}`,
    { headers: SPOTDOWN_HEADERS }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch from Spotify');
  }

  const data = await res.json();
  
  if (!data.songs || data.songs.length === 0) {
    return [];
  }

  return data.songs.map((song: any) => ({
    title: song.title,
    artist: song.artist,
    duration: song.duration,
    cover: song.thumbnail,
    url: song.url,
  }));
}

/**
 * Function 1: For Downloader API.
 * Fetches the audio buffer from spotdown.
 * This is used for downloading/uploading tracks.
 */
export async function downloadSpotifyBuffer(url: string): Promise<Buffer> {
  const res = await fetch('https://spotdown.org/api/download', {
    method: 'POST',
    headers: SPOTDOWN_HEADERS,
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Spotdown Error:', errorText);
    throw new Error('Failed to download audio from spotdown');
  }

  const contentType = res.headers.get('content-type') || '';
  
  // Handle JSON response which might contain a direct download link
  if (contentType.includes('application/json')) {
    const jsonData = await res.json();
    if (jsonData.error) {
      throw new Error(jsonData.error);
    }
    if (jsonData.download) {
        const downloadRes = await fetch(jsonData.download, { headers: SPOTDOWN_HEADERS });
        if (!downloadRes.ok) throw new Error('Failed to fetch download link');
        return Buffer.from(await downloadRes.arrayBuffer());
    }
  }

  const audioBuffer = await res.arrayBuffer();
  if (audioBuffer.byteLength === 0) {
    throw new Error('Received empty audio buffer');
  }
  return Buffer.from(audioBuffer);
}

/**
 * Function 2: For Music Player.
 * Returns the track as a base64 string for immediate playback.
 */
export async function getSpotifyPlayerSource(url: string): Promise<{ audio: string; type: string }> {
  try {
    const buffer = await downloadSpotifyBuffer(url);
    return {
      audio: buffer.toString('base64'),
      type: 'audio/mpeg'
    };
  } catch (error) {
    console.error('Error in getSpotifyPlayerSource:', error);
    throw error;
  }
}
