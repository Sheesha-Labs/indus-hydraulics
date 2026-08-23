import { area, ctaPair, eyebrow, heading, text } from '../fields'
import type { MasterPageDef } from '../types'

/**
 * The blog index at /blog, and every paged view under /blog/page/N — they are
 * the same page with a different slice of articles, and they read the same
 * document.
 */
export const BLOG_PAGE: MasterPageDef = {
  key: 'blog',
  label: 'Blog',
  path: '/blog',
  description: 'The article index.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      description: 'Eyebrow, headline, standfirst and the article count.',
      locked: true,
      fields: [eyebrow(), heading({ max: 200 }), area('body', 'Standfirst', { max: 400 })],
      defaults: {
        eyebrow: 'From the workshop · Indus blog',
        heading:
          'Field notes, sizing guides and component teardowns — written by engineers, for engineers.',
        body: 'No SEO bait, no marketing fluff. Just practical writing about hydraulic systems from the people who specify, install and rebuild them every day.',
      },
    },
    {
      key: 'topics',
      label: 'Topic chips',
      description: 'The scrolling rail of category links.',
      dataNote: 'The chips are the published blog categories, with live article counts.',
      fields: [text('all_label', 'Label for the "everything" chip', { max: 40 })],
      defaults: { all_label: 'All topics' },
    },
    {
      key: 'articles',
      label: 'Article list',
      description: 'The lead card and the grid beneath it.',
      dataNote: 'The cards are the published articles, newest first.',
      fields: [text('empty_message', 'Message when nothing is published', { max: 160 })],
      defaults: { empty_message: 'No posts published yet.' },
    },
    {
      key: 'newsletter_card',
      label: 'Sidebar — newsletter',
      description: 'The navy sign-up card in the sidebar.',
      fields: [eyebrow(), heading({ max: 120 }), area('body', 'Body', { max: 300 })],
      defaults: {
        eyebrow: 'Newsletter · 2× a month',
        heading: 'Never miss a teardown.',
        body: 'Engineers and procurement leads get our notes every other Tuesday.',
      },
    },
    {
      key: 'topics_card',
      label: 'Sidebar — browse by topic',
      description: 'The category list in the sidebar.',
      dataNote: 'The rows are the same categories as the chip rail.',
      fields: [heading({ max: 120 })],
      defaults: { heading: 'Browse by topic' },
    },
    {
      key: 'help_card',
      label: 'Sidebar — ask an engineer',
      description: 'The prompt card at the foot of the sidebar.',
      fields: [heading({ max: 120 }), area('body', 'Body', { max: 300 }), ...ctaPair('', 'Button label')],
      defaults: {
        heading: 'Have a question?',
        body: 'Send us a circuit, a failure photo or a bare SKU. Our applications engineers reply same business day, no charge.',
        cta_label: 'Ask an engineer →',
        cta_href: '/contact',
      },
    },
  ],
}
