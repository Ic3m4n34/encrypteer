import { getAllNews } from '@/lib/knex-lib';
import knexClient from '@/lib/knex-client';
import { cookNews } from '@/lib/news';
import { NewsEntry } from '@/types/news';
import { Tag } from '@/types/tags';
import getOrSetCache from '@/lib/cache';
// import { deSlugify } from '@/helpers/slugify';

export default defineEventHandler(async () => {
  const topTags = await $fetch('/api/top-tags');

  const allNews = await getOrSetCache('news:all', () => getAllNews(knexClient));
  const homepageNews = await getOrSetCache('news:homepage', async () => {
    const newsWithReadingTime = cookNews(allNews); // adds readingTime property to each news entry
    const newsWithTags = newsWithReadingTime.filter((news: NewsEntry) => news.tags && news.tags.length > 0);

    const mappedNews = newsWithTags.map((news: NewsEntry) => { // tags to lowercase
      if (news.tags.length > 0) {
        return {
          ...news,
          tags: news.tags.map((newsTag: string) => newsTag.toLowerCase()),
        };
      }
      return news;
    });

    const newsFilteredByTag = topTags.map((tag: Tag) => {
      const newsWithTag = mappedNews.filter((news: NewsEntry) => news.tags.includes(tag.slug.replace(/-/g, ' ')));
      return {
        tag,
        count: newsWithTag.length,
        news: newsWithTag.slice(0, 6),
      };
    });

    return newsFilteredByTag;
  });

  const newestArticle = allNews.slice(0, 1)[0];
  const frontpageNews = {
    newestArticle,
    news: homepageNews,
  };

  return frontpageNews;
});
