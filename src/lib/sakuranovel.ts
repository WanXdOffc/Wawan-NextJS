import axios from 'axios';
import * as cheerio from 'cheerio';

class SakuraNovel {
    private async getHTML(url: string, options: { method?: string; data?: string; headers?: Record<string, string> } = {}) {
        try {
            const { method = 'GET', data = null, headers = {} } = options;
            
            const config: any = {
                method: method.toLowerCase(),
                url: `https://cors.caliph.my.id/${url}`,
                headers: headers
            };
            
            if (method.toUpperCase() === 'POST' && data) {
                config.data = data;
            }
            
            const { data: html } = await axios(config);
            return cheerio.load(html);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
    
    async search(query: string) {
        try {
            if (!query) throw new Error('Query is required.');
            
            const $ = await this.getHTML('https://sakuranovel.id/wp-admin/admin-ajax.php', {
                method: 'POST',
                data: new URLSearchParams({
                    action: 'data_fetch',
                    keyword: query
                }).toString(),
                headers: {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    origin: 'https://sakuranovel.id',
                    referer: 'https://sakuranovel.id/',
                    'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36',
                    'x-requested-with': 'XMLHttpRequest'
                }
            });
            
            const results = $('.searchbox').map((_, el) => {
                const title = $(el).find('.searchbox-title').text().trim() || null;
                const cover = 'https://cors.caliph.my.id/' + $(el).find('.searchbox-thumb img').attr('src')?.replace('i0.wp.com/', '')?.split('?')?.[0] || null;
                const type = $(el).find('.type').text().trim() || null;
                const status = $(el).find('.status').text().trim() || null;
                const url = $(el).find('a').attr('href') || null;
                return {
                    title,
                    cover,
                    type,
                    status,
                    url
                };
            }).get();
            
            if (!results.length) throw new Error('No result found.');
            return results;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
    
    async detail(url: string) {
        try {
            if (!/^https:\/\/sakuranovel\.id\/series\/[\w-]+\/?$/.test(url)) throw new Error('Invalid detail URL format. Expected format: https://sakuranovel.id/series/[series-slug]/');
            
            const $ = await this.getHTML(url);
            if ($('.series-titlex h2').length === 0) throw new Error('Invalid series page or series not found.');
            
            const title = $('.series-titlex h2').text().trim();
            const alternativeTitle = $('.series-titlex span').text().trim();
            const cover = 'https://cors.caliph.my.id/' + $('.series-thumb img').attr('src') || null;
            const type = $('.series-infoz.block .type').text().trim() || 'N/A';
            const status = $('.series-infoz.block .status').text().trim() || 'N/A';
            const rating = $('.series-infoz.score span[itemprop="ratingValue"]').text().trim() || 'N/A';
            const bookmarks = parseInt($('.favcount span').text().trim(), 10) || 0;
            const getDetail = (label: string) => {
                const element = $(`.series-infolist li:contains("${label}")`);
                element.find('b').remove(); 
                return element.text().trim();
            }
            const genres = $('.series-genres a').map((_, el) => $(el).text().trim()).get();
            const tags = $('.series-infolist li:contains("Tags") a').map((_, el) => $(el).text().trim()).get();
            const synopsis = $('.series-synops p').map((_, el) => $(el).text().trim()).get().join('\n\n');
            const chapters = $('.series-chapterlists li').map((_, el) => {
                const linkElement = $(el).find('.flexch-infoz a');
                const chapterTitle = linkElement.find('span').first().text().replace(/\s\s+/g, ' ').replace(/ Bahasa Indonesia$/i, '').trim();
                const chapterUrl = linkElement.attr('href');
                const releaseDate = linkElement.find('.date').text().trim();
                return { 
                    title: chapterTitle,
                    url: chapterUrl,
                    releaseDate
                };
            }).get();
            
            return {
                title,
                alternativeTitle,
                cover,
                type,
                status,
                rating,
                bookmarks,
                country: getDetail('Country'),
                published: getDetail('Published'),
                author: getDetail('Author'),
                genres,
                tags,
                synopsis,
                chapters
            };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
    
    async chapter(url: string) {
        try {
            if (!/^https:\/\/sakuranovel\.id\/(?!series\/)[\w-]+\d+[\w-]*\/?$/.test(url)) throw new Error('Invalid chapter URL format. Expected format: https://sakuranovel.id/[series-slug]-ch-[number]-[chapter-title]/');
            
            const $ = await this.getHTML(url);
            if ($('h2.title-chapter').length === 0) throw new Error('Invalid chapter page or chapter not found.');
            
            const fullTitle = $('h2.title-chapter').text().trim();
            const chapterInfo = fullTitle.replace(/ Bahasa Indonesia$/i, '').trim();
            
            const contentContainer = $('.tldariinggrissendiribrojangancopy');
            const images = contentContainer.find('img').map((_, el) => {
                let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('srcset');
                if (src) {
                    src = src.split(' ')[0].split(',')[0];
                    src = src.split('?')[0];
                    return src;
                }
                return null;
            }).get().filter(Boolean);
            
            const textContent = contentContainer.find('p').map((_, el) => {
                const text = $(el).text().trim();
                if (text && 
                    !text.includes('—Baca novel lain di sakuranovel—') &&
                    !text.includes('Baca novel lain di sakuranovel')) {
                    return text;
                }
                return null;
            }).get().filter(Boolean).join('\n\n');
            
            const navigation = {
                previousChapter: $('.entry-pagination .pagi-prev a').attr('href') || null,
                tableOfContents: $('.entry-pagination .pagi-toc a').attr('href') || null,
                nextChapter: $('.entry-pagination .pagi-next a').attr('href') || null,
            };
            
            return {
                chapterInfo: chapterInfo,
                content: textContent || null,
                images: images.length > 0 ? images : null,
                navigation,
            };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}

export const sakuranovel = new SakuraNovel();
