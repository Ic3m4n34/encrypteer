import { cookNews } from '@/lib/news';
import { NewsEntry } from '@/types/news';
import getOrSetCache from '@/lib/cache';
import getOrSetAllNews from '@/helpers/all-news';

export default defineEventHandler(async (event) => {
  const { tag } = event.context.params;
  const { limit } = useQuery(event);

  const articleLimit = +limit || 'no-limit';

  const allNews = await getOrSetAllNews();

  const filteredByTag = await getOrSetCache(`news:tag::${tag}::limit:${articleLimit}`, () => {
    const cookedNews = cookNews(allNews); // adds readingTime property to each news entry

    const mappedNews = cookedNews.map((news: NewsEntry) => { // tags to lowercase
      if (news.tags.length > 0) {
        return {
          ...news,
          tags: news.tags.map((newsTag: string) => newsTag.toLowerCase()),
        };
      }
      return news;
    });

    return mappedNews.filter((news) => news.tags.length > 0 && news.tags.includes(tag));
  });

  if (articleLimit === 'no-limit') {
    return getOrSetCache(`news:tag::${tag}::limit:${articleLimit}`, () => cookNews(filteredByTag));
  }

  return getOrSetCache(`news:tag::${tag}::limit:${articleLimit}`, () => cookNews(filteredByTag.slice(0, articleLimit)));
});
