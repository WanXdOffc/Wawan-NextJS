import axios from 'axios';

export async function githubStalk(user: string) {
  if (!user || typeof user !== 'string' || !user.trim()) {
    throw new Error('Username tidak valid');
  }

  const { data } = await axios.get(`https://api.github.com/users/${user.trim()}`);

  return {
    username: data.login || null,
    nickname: data.name || null,
    bio: data.bio || null,
    id: data.id || null,
    nodeId: data.node_id || null,
    profile_pic: data.avatar_url || null,
    url: data.html_url || null,
    type: data.type || null,
    admin: data.site_admin || false,
    company: data.company || null,
    blog: data.blog || null,
    location: data.location || null,
    email: data.email || null,
    public_repo: data.public_repos || 0,
    public_gists: data.public_gists || 0,
    followers: data.followers || 0,
    following: data.following || 0,
    created_at: data.created_at || null,
    updated_at: data.updated_at || null,
  };
}
