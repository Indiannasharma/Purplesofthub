# Insights rich media embeds

## Editing and storage

The existing Markdown editor and authenticated publishing API are retained. Insert Media
Embed opens an accessible dialog with URL detection, an optional 400-character caption
and the same privacy-aware preview used in articles. Insert places the block at the current
textarea cursor. The media list offers edit/replace, remove and move up/down between media
positions. Markdown cut/paste can position a complete block anywhere among paragraphs.
Ordinary pasted links are not silently converted. Preview shows unsaved content without
publishing it. No test article or production content was created or changed.

Media uses a top-level fenced `psh-media` JSON block in the existing `content` TEXT field:

````text
```psh-media
{"version":1,"provider":"youtube","sourceUrl":"https://www.youtube.com/watch?v=M7lc1UVf-VE","contentId":"M7lc1UVf-VE","caption":"A caption","variant":"wide"}
```
````

Only version, provider, canonical source, derived content ID, caption and derived variant
are stored. Render-time frame URLs/scripts cannot be supplied by authors. Source offsets
identify editable block positions; no additional identifier column or migration is needed.
Invalid/forged blocks and nested code examples remain escaped Markdown code. Existing
articles without embeds retain their original Markdown input and rendering behavior.

## Provider registry

`lib/blog/media.ts` owns exact host allowlists, recognition, canonicalization and generated
players. Query tracking parameters and fragments are discarded; YouTube video IDs,
Facebook watch IDs and Apple track selections are retained as content identifiers.

| Provider | Recognized original URLs | Player |
| --- | --- | --- |
| YouTube | `youtube.com/watch?v=ID`, `/shorts/ID`, `/embed/ID`, `youtu.be/ID`; 11-character ID | youtube-nocookie iframe; Shorts are vertical |
| TikTok | `tiktok.com/@creator/video/NUMERIC_ID` | Official `/player/v1/ID`, autoplay off |
| Facebook | `/{creator}/videos/ID`, `/{creator}/posts/ID`, `/watch?v=ID`, `/reel/ID` | Official video/post plugin iframe |
| X | `x.com/{user}/status/ID`, equivalent twitter.com URL | Official widgets script in an isolated frame |
| Threads | threads.net or threads.com `/@user/post/ID` | Official embed script in an isolated frame |
| Reddit | `/r/{community}/comments/{id}/{optional_slug}` | Official widgets script in an isolated frame |
| Spotify | `/track/ID`, `/album/ID`, `/playlist/ID`, `/artist/ID`; optional `intl-xx` prefix | Official `/embed/{type}/{ID}` |
| Audiomack | `/{creator}/song/{slug}`, `/album/{slug}`, `/playlist/{slug}` | Official `/embed/{creator}/{type}/{slug}` |
| Apple Music | `/{country}/{song,album,playlist}/{slug}/{id}`, album `?i=trackId` | embed.music.apple.com; artist URLs are original-link fallback |
| Instagram | `/p/{shortcode}/`, `/reel/{shortcode}/` | Fixed instagram.com content frame; original-link fallback always present |
| Cloudinary native video | `res.cloudinary.com/{cloud}/video/upload/...mp4` or `.webm` | Native controls in articles; optional homepage card preview |

Arbitrary provider pages, unsupported content types and unresolved short redirects are
rejected with guidance to paste the full original URL. youtu.be is deterministic and needs
no redirect lookup. No external metadata/oEmbed calls, access tokens or proxy are needed.

Primary integration references:

- [YouTube iframe parameters](https://developers.google.com/youtube/player_parameters)
- [TikTok Embed Player](https://developers.tiktok.com/doc/embed-player/)
- [Meta's official embed integration](https://github.com/facebook/meta-embeds-for-wordpress)
- [X embedded posts](https://help.x.com/en/using-x/how-to-embed-a-post)
- [Reddit embeds](https://support.reddithelp.com/hc/en-us/articles/360043033532-How-do-I-embed-a-Reddit-post-or-comment-in-an-article-or-other-publication)
- [Spotify embeds](https://developer.spotify.com/documentation/embeds)
- [Audiomack](https://audiomack.com/data-api/docs)
- [Apple Music sharing and embed codes](https://support.apple.com/guide/music-web/share-music-apdm0783785d/web)

## Rendering, privacy and security

`ArticleBody` renders normal article text through the existing escaped Markdown renderer.
Reference definitions survive segment boundaries. Canonicals, publication metadata and
BlogPosting JSON-LD are unchanged. No fabricated VideoObject/MusicRecording metadata.

`RichMediaEmbed` initially emits a local styled placeholder, caption, attribution and safe
external link. There is no iframe, provider thumbnail, SDK, DNS prefetch or provider fetch
before Load is deliberately selected. Neither GA4 consent nor newsletter consent activates
media. Each media component has a transient local activation state; it is not stored.
Closing media unmounts its frame. No player autoplays from the app's configuration.

Player sources are rebuilt from validated IDs. HTTPS, exact hosts, no credentials or custom
ports, and bounded identifiers are required; JavaScript/data URLs, iframe snippets, encoded
path separators and deceptive domains are rejected. Captions are React text, never HTML.
No server URL fetching means no new SSRF/redirect-resolution endpoint.

Frames use no-referrer except YouTube, which uses strict-origin-when-cross-origin to
provide the identification required by the provider. A restricted sandbox excludes top navigation and forms. Direct
cross-origin provider frames need scripts/same-origin for the provider's own storage and
player operation. X/Threads/Reddit scripts are generated from fixed templates in a sandboxed
srcDoc frame **without** same-origin privileges. Only fixed official script URLs and validated source URLs enter that template.
After deliberate YouTube activation, its fixed official iframe API is loaded once in the
parent to receive onReady/onError/onStateChange. No YouTube SDK is loaded before activation.
Provider policies, storage restrictions or opaque-origin incompatibility may prevent rendering;
the original-link action remains available.

## Layout, loading and limitations

Existing typography/tokens are reused, with quiet attribution, rounded borders and responsive
wide, vertical, audio and post containers. Dimensions are reserved before activation; the
mobile widescreen placeholder keeps a readable minimum height. Frame creation is lazy and
scoped to activation. An accessible connecting status and a 20-second timeout provide a
retry/link fallback on errors or slow loading. No new package or global SDK was added.

Cross-origin documents cannot be inspected reliably. An iframe load event means its document
loaded, **not** that a private, removed, age/region-restricted or embedding-disabled item is
playable. YouTube API events and source/origin-validated TikTok messages distinguish player
ready, playing and errors. Other providers say "Frame loaded; content availability is not
confirmed". Native clips use canplay/playing/error. Long posts scroll inside the frame and
offer an expanded 1000px view. Open Original is always present, including after load, so articles remain usable.
No player availability, third-party cookie compliance or full-provider compatibility claim is
made merely from URL recognition. Manual provider restrictions are not bypassed.

To add a provider, extend the central allowlist/parser and generated player definition,
retain block-version compatibility, add valid/malicious URL and serialization tests, then
verify zero provider traffic before activation and an explicit click with a public sample.
Do not accept arbitrary HTML, add broad hostname suffix matching or auto-resolve redirects.

## Homepage previews and rollout

`CardVideoPreview` shares one controller across cards. Fine-pointer hover waits 250ms,
then plays a muted looping native preview. Exit, blur, leaving the viewport, hidden pages,
another active preview and preference changes pause/reset it. Touch and keyboard use a
separate accessible play/pause button outside the poster/title links. Reduced motion
disables automatic hover playback; explicit user play remains available. No `src` is emitted
in server HTML; `preload=none` and a static image preserve the existing card dimensions.
Native preview URLs are restricted to Cloudinary video uploads. Delivery derives a six-second,
720px, quality-auto version of the approved asset; failure retains the poster and navigation.
Portfolio images now use responsive Next Image, optimizing configured/local hosts and
retaining external legacy sources unoptimized. Blog images retain their existing optimization.

No approved video has been assigned to production content by this implementation. Portfolio
prefers the CMS Homepage video preview field (`videos.preview` in the existing JSON),
then existing `promo`/`animation`/`walkthrough`; Blog uses its first native `psh-media`
block and derives only the URL server-side for the three homepage stories. Full article
content is never serialized into homepage cards. Existing API fields/schema are unchanged.
See `OPENCLAW_BLOG_PUBLISHING.md` for exact versioned block examples.
The Portfolio editor preserves other video slots on save. Strict or signed Cloudinary
delivery configurations must allow the derived transformation; blocked delivery falls
back to the poster. No upload or Cloudinary account setting is changed automatically.

Instagram uses only canonical public content URLs and the provider's fixed frame endpoint;
availability/sign-in requirements remain unverified until checked with a real public post.
TikTok short links remain unsupported after evaluation: automatic resolution would add a
server redirect/SSRF boundary. Editors instead open the short link and copy the full URL.

## Previous validation (multimedia foundation)

- 47 focused analytics, media, publishing and editorial tests passed, including legacy Markdown,
  URL attacks, serialization, insertion/replacement/reordering/removal, safe frame construction,
  local-only SSR, fallback states and withdrawal/persistence guards.
- TypeScript and changed-file ESLint passed. The first production build compiled but hit a
  stale `.next/dev/types/validator.ts` import after the temporary fixture was removed. Only
  generated `.next/dev/types` was cleared before the necessary build retry; no source
  workaround, type suppression or fixture route was shipped.
- Final production build passed with TypeScript and 132 generated entries. The build route
  manifest explicitly excludes the temporary QA fixture.
- Real Chrome passed editor insertion, detection/preview, caption editing, reorder and removal;
  URL replacement is covered by focused content-operation tests. It also passed
  zero provider connections before activation, an actual YouTube iframe request after Load,
  safe frame removal, and no hydration/runtime errors. A follow-up visual/focus check passed
  light/dark at 1440/390px: no horizontal overflow, focus into the activated frame and back to
  Load after closing. No production subscriber or article records were created.
- Evidence: `C:/Users/HP/AppData/Local/Temp/psh-consent-wdhR2i/verification.json` (28 combined
  consent/media checks) and `C:/Users/HP/AppData/Local/Temp/psh-consent-VNyuYm/verification.json`
  with adjacent media-card screenshots. These temporary files are excluded from Git.
- Every listed provider format has parser/security tests; real player networking was checked
  with YouTube, not every provider/content restriction. Authenticated production editor
  save/publish remains untested without authorized content changes.
