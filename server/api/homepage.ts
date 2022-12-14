import { NewsEntry, AllNewsType } from '@/types/news';
import { Tag } from '@/types/tags';
import getOrSetCache from '@/lib/cache';
import getOrSetAllNews from '@/helpers/all-news';

export default defineEventHandler(async () => {
  const topTags = await $fetch('/api/top-tags');

  const allNews = await getOrSetAllNews();

  const homepageNews = await getOrSetCache('news:homepage', async () => {
    const newsWithTags = allNews.filter((news: NewsEntry) => news.tags && news.tags.length > 0 && news.tags[0] !== '');

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

    return newsFilteredByTag.sort((a, b) => b.count - a.count);
  });

  // remove Objects with empty news array
  const homepageNewsWithoutEmptyArticles = homepageNews.filter((news: AllNewsType) => news.news.length > 0);

  const newestArticle = allNews.slice(0, 1)[0];
  const frontpageNews = {
    newestArticle,
    news: homepageNewsWithoutEmptyArticles,
  };

  return frontpageNews;
});
