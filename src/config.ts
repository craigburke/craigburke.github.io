export const siteConfig = {
  url: 'https://www.craigburke.com',
  language: 'en',
  title: 'Craig Burke — Salesforce Technical Architect & Principal Developer',
  description: 'Salesforce Technical Architect and Principal Developer with 8+ years of Salesforce experience and 20+ years of enterprise application-development experience.',
  author: {
    name: 'Craig A. Burke',
    title: 'Salesforce Technical Architect & Principal Developer',
    bio: 'Salesforce Technical Architect and Principal Developer with 8+ years of Salesforce experience and 20+ years of enterprise application-development experience.',
    email: 'craig@craigburke.com',
    location: 'Pittsburgh, PA · Seeking remote roles',
  },
  social: {
    github: '',
    linkedin: '',
    twitter: '' as string,
    mastodon: '',
    bluesky: '',
  },
  nav: [
    { label: 'Integration Projects', href: '/projects' },
    { label: 'Salesforce Frameworks', href: '/frameworks' },
    { label: 'Resume', href: '/resume' },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
export type SocialLinks = typeof siteConfig.social;
export type NavItem = typeof siteConfig.nav[number];
