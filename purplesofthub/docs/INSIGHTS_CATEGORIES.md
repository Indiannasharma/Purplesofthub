# Insights editorial categories

Categories remain database records in `public.blog_categories` (unique name and slug).
The existing public feed, CMS manager/editor, and publishing API all load that table.
Posts continue storing the canonical category name; the publisher accepts its name or
slug. No new taxonomy table, author record, editor framework, or migration is needed.

`scripts/seed-insights-categories.sql` adds only missing Gaming / `gaming` and
How-To & Tutorials / `how-to` records. It checks names and slugs case-insensitively,
does not overwrite existing records, and is safe to rerun. Existing RLS/grants remain
unchanged. Run through an authorized database connection, never expose credentials.

The existing category routes are retained:

- `/blog?category=gaming`
- `/blog?category=how-to`

`lib/blog/category-metadata.ts` supplies SEO and empty-state copy for those two
database-backed categories. It is not a second category store. Exact category titles
use absolute metadata to avoid duplicating the global brand suffix. Category search
and pagination retain the category canonical. Other existing archive metadata and
article canonical/BlogPosting generation remain unchanged.

The masthead already renders every category in its horizontally scrollable rail on
desktop/mobile. It preserves category selection during searches. Empty category
pages explain the upcoming coverage and link to current insights; a search with no
matches retains the existing search empty state.

## Tutorial and Gaming content

The existing Markdown renderer supports numbered steps, image/screenshot Markdown
with alt text, headings for FAQs, fenced code, and blockquotes for tips/warnings.
Dedicated tip/warning components and FAQ structured data are not supplied by this
change; use the existing blockquote and heading presentation.

The existing Insert Media Embed workflow supports YouTube, including official
Rockstar trailer URLs. It creates a validated `psh-media` block and a privacy-aware,
click-to-load player. See `docs/insights-rich-media-embeds.md`. Do not paste raw iframe
HTML. Player availability remains subject to YouTube restrictions.

For a future GTA VI article, send `category: "gaming"` (or `"Gaming"`),
`author: "PurpleSoftHub"`, and `author_type: "Organization"` through the existing
publisher. For tutorials, send `category: "how-to"` (or `"How-To & Tutorials"`).
No GTA VI article or production test post is created by this implementation.

## Verification

Run `node --test tests/blog/*.test.mjs`, `npm run lint`, and `npm run build`.
Check both category pages, category selection in the CMS, mobile rail navigation,
exact SEO/social metadata and canonical URLs, and the existing Technology filter.
Production checks must confirm one record per new category and unchanged existing
category/post data. Keep browser evidence outside the repository.
