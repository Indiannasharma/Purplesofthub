# PurpleSoftHub Insights

The public magazine lives at /blog. The corporate header, footer, Nova, homepage feed, admin, publishing endpoint, schema, authentication and uploads remain unchanged.

## Editorial data

The archive uses the existing published-only, uncached, 12-story paginated feed. The newest story leads because the current schema has no featured flag. Secondary selections are unique and excluded from the immediately following Latest Stories section. Small publications adapt to the real number of articles. Category blocks contain up to three nonempty categories from the current page, with at most three stories per block; category links lead to the full filtered archive. The rail uses existing category records, with a real article-category fallback if the category lookup is temporarily unavailable.

Trending receives an ordered list of recent published summaries and renders up to five; it has no fake views or popularity claims. A future analytics query can supply this component without changing its layout. Listing cards omit reading time because summaries deliberately omit full content. Article reading time is calculated from content, never a read_time database column.

Related stories prioritize the same category, then matching tags, then recent stories. Queries are published-only and bounded; the current article and duplicates are excluded. The existing Markdown renderer, source links, metadata generator and Organization JSON-LD remain in use.

## Advertisements and newsletter

AdSlot supports a configured Google creative via a React node, a direct/sponsored creative with an HTTPS destination, or a house creative. It injects no scripts or credentials. Every placement has an Advertisement label; direct creatives also identify Sponsored. Empty inventory is an explicitly labeled advertising opportunity. The PurpleSoftHub house creative links to the existing /contact project workflow.

Newsletter is the only new client module. A bounded, public HEAD capability check returns no subscriber data. If the existing backing system is unavailable, the card explicitly marks email signup unavailable and links to the existing PurpleSoftHub Telegram channel; no subscription is claimed. The existing endpoint has no newsletter_subscribers backing table in the connected Supabase project at verification time. No newsletter schema or mail system is created during this UI redesign. When the backing table becomes available, the form enables automatically. It sends an email and source=blog-insights to the existing /api/newsletter endpoint. Native email validation, synchronous submission locking, pending and success states, timeout handling and accessible error announcements are provided. Successful subscription is shown only after the API reports success. Tests should avoid sending real welcome or owner notification emails unnecessarily.

## Responsive presentation

Desktop: approximately two-thirds lead story plus secondary features; three-column latest cards when available; editorial categories and a supporting sidebar. Tablet: simplified story hierarchy, two-column cards and sidebar modules moved into the flow. Mobile: full-width lead, compact secondary rows, swipeable category navigation, single-column stories, responsive labeled ads and full-width supporting modules. Wide desktops use a bounded 1400px publication.

Article body measure is bounded to 750px with an optional share/ad rail on large screens. Below 1100px the rail reflows. Image aspect ratios reserve space, Cloudinary images use existing Next optimization, only the lead image receives eager/high-priority loading, and motion respects reduced-motion preferences. All publication styles are scoped, including overrides for corporate section padding; global corporate styles are untouched.

Layout inspiration: https://demo.tagdiv.com/newspaper_pro/ (editorial hierarchy and varied story sizes, reinterpreted using PurpleSoftHub branding).

Out-of-range Supabase feed responses (HTTP 416 with a valid total) retain the actual count so the archive redirects to the last valid page. Other errors remain distinct from an empty publication. Article presentation suppresses only a matching opening Markdown title already shown in the header and demotes remaining body H1 headings to H2. Stored Markdown, source links, SEO and JSON-LD are unchanged.
