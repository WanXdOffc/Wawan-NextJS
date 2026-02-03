import axios from 'axios';

class GitHubUrlParser {
  private headers: Record<string, string>;

  constructor(options: { userAgent?: string; token?: string } = {}) {
    this.headers = {
      'User-Agent': options.userAgent || 'github-data-fetcher',
      ...(options.token && { Authorization: `token ${options.token}` }),
    };
  }

  parseUrl(url: string) {
    const patterns: Record<string, RegExp> = {
      repo: /https?:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/)?$/,
      file: /https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/,
      raw: /https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)/,
      gist: /https?:\/\/gist\.github\.com\/([^/]+)\/([a-f0-9]+)/,
    };

    for (const [type, regex] of Object.entries(patterns)) {
      const match = url.match(regex);
      if (match) return { type, match };
    }

    throw new Error('URL GitHub tidak valid');
  }

  async getRepoData(user: string, repo: string) {
    const apiUrl = `https://api.github.com/repos/${user}/${repo}`;
    const res = await axios.get(apiUrl, {
      headers: this.headers,
      timeout: 30000,
    });

    return {
      type: 'repository',
      owner: user,
      repo,
      ...res.data,
      download_url: `https://github.com/${user}/${repo}/archive/refs/heads/${res.data.default_branch}.zip`,
      clone_url: `https://github.com/${user}/${repo}.git`,
      api_url: apiUrl,
    };
  }

  async getFileData(user: string, repo: string, branch: string, path: string) {
    const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/${path}?ref=${branch}`;
    const res = await axios.get(apiUrl, {
      headers: this.headers,
      timeout: 30000,
    });

    return {
      type: 'file',
      owner: user,
      repo,
      branch,
      path,
      ...res.data,
      decoded_content: res.data.content
        ? Buffer.from(res.data.content, 'base64').toString()
        : null,
      api_url: apiUrl,
    };
  }

  async getGistData(user: string, gistId: string) {
    const apiUrl = `https://api.github.com/gists/${gistId}`;
    const res = await axios.get(apiUrl, {
      headers: this.headers,
      timeout: 30000,
    });

    return {
      type: 'gist',
      owner: user,
      gist_id: gistId,
      ...res.data,
      api_url: apiUrl,
    };
  }

  async getData(url: string) {
    const { type, match } = this.parseUrl(url);

    switch (type) {
      case 'repo':
        return this.getRepoData(match[1], match[2]);
      case 'file':
        return this.getFileData(match[1], match[2], match[3], match[4]);
      case 'gist':
        return this.getGistData(match[1], match[2]);
      default:
        throw new Error('Tipe URL tidak didukung');
    }
  }
}

export async function githubDownload(url: string, options: { userAgent?: string; token?: string } = {}) {
  const github = new GitHubUrlParser(options);
  return github.getData(url);
}
