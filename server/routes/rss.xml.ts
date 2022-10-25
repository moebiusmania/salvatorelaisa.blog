import { serverQueryContent } from '#content/server';
import RSS from 'rss';

export default defineEventHandler(async (event) => {
  const feed = new RSS({
    title: 'Salvatore Laisa',
    site_url: 'https://salvatorelaisa.blog',
    feed_url: `https://salvatorelaisa.blog/rss.xml`,
  });

  const docs = await serverQueryContent(event)
    .sort({ date: -1 })
    .where({ _partial: false, draft: false })
    .find();

  const blogPosts = docs.filter((doc) => !doc?._path?.includes('/pages'));
  for (const doc of blogPosts) {
    feed.item({
      title: doc.title ?? '-',
      url: `https://salvatorelaisa.blog/post${doc._path}`,
      date: doc.date,
      description: doc.description,
    });
  }

  const feedString = feed.xml({ indent: true });
  event.res.setHeader('content-type', 'text/xml');
  event.res.end(feedString);
});