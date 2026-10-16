# PurpleSoftHub blog publishing

The one-time application deployment and database migration install the publisher. **Normal article creation and updates only call the publisher; they never require Git changes or a Vercel deployment.** The existing Supabase blog and Cloudinary account remain the source of truth.

## One command

Configure credentials in OpenClaw's secret store, never in an article file or repository. Run:

```sh
node scripts/publish-blog.mjs article.json --image featured.png
node scripts/publish-blog.mjs article.json --image featured.png --publish
node scripts/publish-blog.mjs changes.json --update EXISTING_ARTICLE_UUID
node scripts/publish-blog.mjs changes.json --update EXISTING_ARTICLE_UUID --publish
```

The first command creates a draft. The second explicitly publishes. The third updates an existing record (and preserves its current status); the fourth explicitly publishes that record. Omit --image when keeping the existing image or submitting an existing HTTPS featured_image URL.

Authentication options:

- PURPLESOFTHUB_BLOG_ACCESS_TOKEN: a valid, short-lived **Supabase user access token for an existing administrator**. OpenClaw's normal login/session manager must refresh expired tokens.
- Alternatively, PURPLESOFTHUB_BLOG_EMAIL and PURPLESOFTHUB_BLOG_PASSWORD for an existing administrator, together with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. The command logs in automatically. Never use a service-role key as a publishing token.
- The CLI defaults to https://www.purplesofthub.com. PURPLESOFTHUB_BLOG_URL can select a local test server; plain HTTP is restricted to localhost/127.0.0.1.

The command prints the saved article ID, slug, status, author and URL. It never prints credentials. It exits nonzero on failure. Save the returned ID for later updates.

## Structured payload

```json
{
  "title": "An informative article title",
  "content": "## First section\n\nArticle text with **emphasis** and [source links](https://example.com/source).",
  "excerpt": "A useful summary of what the reader will learn.",
  "featured_image_alt": "Describe what is actually visible in the featured image.",
  "category": "technology",
  "tags": ["technology"],
  "source_urls": ["https://example.com/source"]
}
```

| Field | Behaviour |
| --- | --- |
| title | Required even for a draft; maximum 200 characters. |
| content | Markdown; maximum 100,000 characters. Required to publish. |
| excerpt | Maximum 500 characters. Required to publish. |
| featured_image | Existing HTTPS URL; omit when attaching a file or keeping an existing image. Required to publish unless an image file is supplied. |
| featured_image_alt | Descriptive text, maximum 300 characters. Required when an image exists or is uploaded. |
| category | Optional existing category name or slug. The stored value is the existing canonical category name. Unknown categories are rejected; no category is created. |
| tags | Optional array of at most 20 strings, 50 characters each; deduplicated. |
| source_urls | Optional array of at most 20 HTTPS URLs, 2,048 characters each; deduplicated, rendered as Sources and included in structured data. URLs containing credentials are rejected. |
| seo_title | Optional, at most 200 characters (50–70 recommended). Blank/missing on creation derives from the title. |
| seo_description | Optional, at most 500 characters (140–160 recommended). Blank/missing on creation derives from the excerpt at a word boundary. |
| slug | Optional on creation; automatically generated from the title. Maximum 100 lowercase ASCII characters, separated by single hyphens. Supply a Latin slug for titles with no Latin letters/numbers. |
| author | Defaults to PurpleSoftHub. An explicit other publication/person name is accepted; no author accounts are created. |
| author_type | Person or Organization for an explicitly supplied author. PurpleSoftHub always uses Organization. |
| status | Creation defaults to draft. Publishing requires published explicitly. Updates preserve the current status when omitted. |
| operation | create (default) or update. No implicit upsert. |
| id | Existing UUID for operation: update. Alternatively, use its existing slug. A published article's slug cannot change. |
| expected_updated_at | Optional timestamp returned by the last read/save. A stale value produces 409 instead of overwriting newer work. |
| content_format | Optional; only markdown is accepted. |

Updates are partial: omitted fields retain their current values. Clear optional text with an empty string or arrays with []. Clearing SEO fields regenerates their defaults. Clearing required publishing fields fails validation. The first publication date stays unchanged through edits, unpublishing and republishing; the publisher owns all timestamps and author IDs.

## HTTP interface

Use **POST /api/admin/blog/publish** for all four lifecycle operations. Send Authorization: Bearer <admin user access token>, or use the existing admin session cookie from the same-origin human form. Bearer tokens are verified with Supabase and the database profile must have role admin. Invalid Bearer tokens never fall back to cookies.

- JSON: Content-Type: application/json and the structured payload above.
- File: multipart/form-data, a payload field containing that same JSON, and one image file. This is one operation: validation, upload and save happen server-side.
- GET /api/admin/blog/publish returns existing categories. Add ?id=UUID or ?slug=SLUG to read an existing article.
- The human create/edit screens use this same operation. Manager publish/unpublish actions also use it.

Images support JPG, PNG, WebP and AVIF, maximum **3 MB**. The whole request is limited to 4 MB for the production hosting limit. MIME type, size and file signature are checked. SVG and arbitrary remote upload URLs are not accepted. The server uploads to **purplesofthub/blog**, stores Cloudinary's secure URL, and attempts to remove a newly uploaded asset if the database save fails. The previous image is retained when no replacement is supplied.

## Content and SEO

Submit Markdown, not HTML. H2/H3 headings, paragraphs, ordered/unordered lists, emphasis, fenced code and links are supported. Raw HTML is escaped; javascript:, data: and other unsafe link schemes are removed. Source links can be written inline or submitted in source_urls. Do not fetch a source automatically as part of publication: OpenClaw prepares and reviews the article first.

The live route reads actual database values on every request. It generates the canonical URL https://www.purplesofthub.com/blog/{slug}, Open Graph, Twitter metadata and escaped BlogPosting JSON-LD. PurpleSoftHub is an Organization author and publisher. Missing dates or other data are omitted rather than invented. The visible byline uses the stored author name. Articles immediately appear in the dynamic blog listing after publication.

## Multimedia content (same publishing contract)

Place each media object in a top-level fenced `psh-media` block inside the existing
`content` Markdown string. Do not send a new top-level `media` or `preview_video`
field. Raw iframe/script HTML remains escaped. The CMS Insert Media Embed dialog
creates the same blocks and can edit captions, replace URLs, reorder and remove them.

YouTube video (the official YouTube API documentation sample):

````text
```psh-media
{"version":1,"provider":"youtube","sourceUrl":"https://www.youtube.com/watch?v=M7lc1UVf-VE","contentId":"M7lc1UVf-VE","caption":"YouTube player demonstration","variant":"wide"}
```
````

TikTok video (full canonical URL; resolve share links in your browser first):

````text
```psh-media
{"version":1,"provider":"tiktok","sourceUrl":"https://www.tiktok.com/@scout2015/video/6718335390845095173","contentId":"6718335390845095173","caption":"TikTok video","variant":"vertical"}
```
````

Spotify audio:

````text
```psh-media
{"version":1,"provider":"spotify","sourceUrl":"https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC","contentId":"4uLU6hMCjMI75M1A2tKUQC","caption":"Listen on Spotify","variant":"audio"}
```
````

Apple Music (illustrative identifiers: replace with the actual reviewed album/track):

````text
```psh-media
{"version":1,"provider":"apple-music","sourceUrl":"https://music.apple.com/us/album/example/1234567890?i=1234567891","contentId":"1234567891","caption":"Listen on Apple Music","variant":"audio"}
```
````

Social post (illustrative X URL; replace with an actual public post):

````text
```psh-media
{"version":1,"provider":"x","sourceUrl":"https://x.com/example/status/1234567890","contentId":"1234567890","caption":"Original announcement","variant":"post"}
```
````

Optional approved native video and homepage Blog preview (illustrative asset):

````text
```psh-media
{"version":1,"provider":"cloudinary","sourceUrl":"https://res.cloudinary.com/approved/video/upload/v123/editorial/preview.mp4","contentId":"v123/editorial/preview.mp4","caption":"Approved editorial clip","variant":"wide"}
```
````

The first Cloudinary video block supplies the homepage Blog card preview. The full
article renders it as a click-to-load native player. Homepage cards derive a six-second,
720px `q_auto` delivery URL, mute and loop, with no video request until hover intent or
explicit play. Supply only approved MP4/WebM upload assets; YouTube/TikTok pages are
never native sources. No database migration or article source change is required for
image-only cards. Portfolio's optional Homepage video preview field stores `videos.preview`
in the existing JSON object and preserves the other video slots. Cards prefer that field,
then reuse eligible native `promo`, `animation` or `walkthrough` assets. No schema changes.

Instagram supports canonical public `/p/{shortcode}/` and `/reel/{shortcode}/` URLs
through a fixed provider frame; private/restricted posts may require Open original.
Every provider is opt-in. Frame loading is not proof of playable content: YouTube and
TikTok have provider readiness/error signals; other frames explicitly report that
availability is unconfirmed. Shortened TikTok URLs remain rejected: no server-side
redirect resolver or SSRF surface is introduced. Never publish a test article without
the owner's explicit approval.

## Success and failure responses

Successful creation returns 201; an update returns 200:

```json
{
  "ok": true,
  "operation": "create",
  "post": { "id": "saved-uuid", "slug": "article-slug", "status": "draft", "author_name": "PurpleSoftHub" },
  "url": "https://www.purplesofthub.com/blog/article-slug",
  "content_format": "markdown"
}
```

The actual post response includes the persisted fields and timestamps. The example is shortened.

Failures use { ok: false, code, error, fields? }:

- 400: invalid JSON, multipart encoding or operation body.
- 401/403: missing, expired or unauthorized access; cross-origin cookie writes are rejected.
- 404: an explicitly requested update target does not exist.
- 409 slug_exists: duplicate slug (including database uniqueness races). No suffix or duplicate is silently created. The preflight result includes the existing ID, slug and status; read it and request an explicit update if intended.
- 409 post_changed: another writer changed/deleted the article. Reload before retrying.
- 413/415: request/image too large or unsupported type.
- 422 validation_failed: correct the returned field messages; no article is partially published.
- 502/503: upload/database unavailable or migration missing. No provider secrets are returned.

## One-time installation

Apply supabase/migrations/20261007000000_blog_publishing_workflow.sql once and deploy the application. The migration adds image-alt, source and author-type fields, preserves the existing WhatsApp article, and removes browser database-write access. It also prevents ordinary clients from changing the profile role used for admin authorization. Published articles remain public; drafts remain admin-only. All mutations use server-side credentials behind admin authorization. No Supabase service-role or Cloudinary secret belongs in OpenClaw's article payload, documentation or browser code.

To run local behavioural tests: node --test tests/blog/publishing.test.mjs. The one-time release also verifies the authenticated lifecycle with a disposable article and removes that article after the checks.

The controlled release script is scripts/verify-blog-publisher.mjs. It requires an existing admin token and the server environment for test-asset cleanup; production use requires --allow-production. It creates only one disposable verification article and removes it and its uploaded image.

## Editorial CMS and public feed

The homepage shows the three most recently published articles, ordered by publication date. The editorial heading remains Trending Blog Posts; this is a recent-publication feed, not a fabricated engagement ranking. View tracking does not exist, so no view analytics are displayed. The homepage and archive fetch published metadata server-side with no-store, and the publishing operation revalidates the homepage, archive and affected article. New publication is visible on the next fresh request without deployment.

The CMS uses GET /api/admin/blog for paginated article summaries, real statistics and existing category/author suggestions. The write interface remains POST /api/admin/blog/publish. Draft previews require admin authorization. Newly generated slugs remain bounded to 100 ASCII characters; an unchanged URL from a previously published legacy article is preserved. SEO recommendations are guidance rather than publication blockers; the application caps title/description input at 200/500 characters.
