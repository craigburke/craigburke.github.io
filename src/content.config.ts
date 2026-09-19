import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projectsCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    outcomeSummary: z.string(),
    mainScreenshot: z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string(),
    }).optional(),
    additionalScreenshots: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string(),
    })).max(2).default([]),
    problem: z.string(),
    approach: z.string(),
    techStack: z.array(z.string()),
    impact: z.object({
      metrics: z.array(z.object({ label: z.string(), value: z.string() })),
      qualitative: z.string(),
    }),
    featured: z.boolean().default(false),
    order: z.number().optional(),
  }),
});

const frameworksCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/frameworks' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number(),
  }),
});

export const collections = {
  projects: projectsCollection,
  frameworks: frameworksCollection,
};
