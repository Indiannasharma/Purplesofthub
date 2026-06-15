## [Unreleased]
### Added
- Added Nova by PurpleSoftHub, a floating website agent with public sales, client support, and admin operations modes.
- Added `/api/nova` for role-aware agent replies, lead capture, Supabase persistence, and Softclaw/Railway alert forwarding.
- Added Supabase migration for Nova conversations, messages, handoffs, and alerts.
- Added a structured PurpleSoftHub Academy course catalog with filters, learning paths, scholarship messaging, and a course-interest waitlist.
- Added branded PurpleSoftHub welcome and login notification emails for account signup and sign-in flows.

### Fixed
- Nova now uses Softclaw as the primary AI provider instead of OpenRouter, keeping scripted fallback replies if Softclaw is unavailable.
- Replaced separate floating WhatsApp and Telegram buttons with Nova handoff options inside the assistant.
- Homepage Academy CTA now links to `/academy` instead of the blog.
- Login notification emails now verify the signed-in user with the current Supabase access token when cookies are not immediately available server-side.
- Sign-up form fields no longer lose focus after the first typed character.
- Added a Supabase repair migration for auth signup/invite failures caused by database triggers during user creation.
- Service checkout and client dashboard pricing now use the official service plan catalog instead of stale duplicated plan lists.
