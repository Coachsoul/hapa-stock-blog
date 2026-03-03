import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    category: z.enum(['시장분석', '종목분석', '투자전략', '경제기초']).default('시장분석'),
    readingTime: z.number().optional(),
    author: z.string().default('하파'),
    image: z.string().optional(),
  }),
});

export const collections = { posts };
