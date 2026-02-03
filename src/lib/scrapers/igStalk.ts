import axios from 'axios';

export async function getInstagramProfile(username: string) {
  if (!username || typeof username !== 'string' || !username.trim()) {
    throw new Error('Username wajib diisi');
  }

  const response = await axios.get(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
    {
      headers: {
        authority: 'www.instagram.com',
        accept: '*/*',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        referer: `https://www.instagram.com/${username}/`,
        'sec-ch-prefers-color-scheme': 'dark',
        'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        cookie: 'csrftoken=osAtGItPXdetQOXtk2IlfZ; datr=ygJMaBFtokCgDHvSHpjRBiXR;',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
        'x-ig-app-id': '936619743392459',
      },
    }
  );

  const user = response.data.data.user;

  return {
    username: user.username,
    full_name: user.full_name,
    biography: user.biography,
    external_url: user.external_url,
    profile_pic_url: user.profile_pic_url,
    is_private: user.is_private,
    is_verified: user.is_verified,
    followers: user.edge_followed_by.count,
    following: user.edge_follow.count,
    posts_count: user.edge_owner_to_timeline_media.count,
    posts: user.edge_owner_to_timeline_media.edges.map((e: any) => ({
      id: e.node.id,
      shortcode: e.node.shortcode,
      is_video: e.node.is_video,
      thumbnail: e.node.thumbnail_src || e.node.display_url,
      caption: e.node.edge_media_to_caption.edges[0]?.node.text || '',
      likes: e.node.edge_liked_by.count,
      comments: e.node.edge_media_to_comment.count,
      timestamp: e.node.taken_at_timestamp,
    })),
  };
}
