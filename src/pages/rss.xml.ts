import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  return rss({
    title: '하파 주식 투자 가이드',
    description: '매일 업데이트되는 주식 시장 분석과 초보자 맞춤 투자 전략',
    site: context.site!.toString(),
    items: posts
      .sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/posts/${post.id}/`,
      })),
    customData: '<language>ko</language>',
  });
}
