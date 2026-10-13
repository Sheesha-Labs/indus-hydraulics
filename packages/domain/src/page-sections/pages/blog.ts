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
      description: 'Eyebrow, headline and standfirst. The search box and article count beside them are fixed.',
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
      label: 'Topic index',
      description: 'The grid of topic tiles under the hero. Switch off to hide it.',
      dataNote:
        'One tile per published blog category, with its live article count. The heading is set in "Topic index — heading".',
      // The "All topics" chip label (all_label) is retired: /blog itself is the
      // all-topics view, so the tile grid has no "everything" entry to label.
      fields: [],
      defaults: {},
    },
    {
      key: 'articles',
      label: 'Article list',
      description: 'The grid of the newest articles, and the message shown when none are published.',
      dataNote: 'The cards are the published articles, newest first.',
      fields: [text('empty_message', 'Message when nothing is published', { max: 160 })],
      defaults: { empty_message: 'No articles have been published yet.' },
    },
    {
      key: 'newsletter_card',
      label: 'Navy band — newsletter',
      description: 'The sign-up panel in the navy band at the foot of the page.',
      fields: [eyebrow(), heading({ max: 120 }), area('body', 'Body', { max: 300 })],
      defaults: {
        eyebrow: 'Newsletter · 2× a month',
        heading: 'Never miss a teardown.',
        body: 'Engineers and procurement leads get our notes every other Tuesday.',
      },
    },
    {
      key: 'topics_card',
      label: 'Topic index — heading',
      description:
        'The heading over the topic tiles. Shown or hidden with "Topic index"; its position in this list has no effect.',
      dataNote: 'The tiles are the published blog categories.',
      fields: [heading({ max: 120 })],
      defaults: { heading: 'Browse by topic' },
    },
    {
      key: 'help_card',
      label: 'Navy band — ask an engineer',
      description: 'The prompt panel in the navy band. The two band panels follow the order of this list.',
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
