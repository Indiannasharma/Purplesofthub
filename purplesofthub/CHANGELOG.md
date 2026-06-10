## [Unreleased]
### Added
- Added a structured PurpleSoftHub Academy course catalog with filters, learning paths, scholarship messaging, and a course-interest waitlist.
- Added branded PurpleSoftHub welcome and login notification emails for account signup and sign-in flows.

### Fixed
- Homepage Academy CTA now links to `/academy` instead of the blog.
- Login notification emails now verify the signed-in user with the current Supabase access token when cookies are not immediately available server-side.
- Sign-up form fields no longer lose focus after the first typed character.
- Added a Supabase repair migration for auth signup/invite failures caused by database triggers during user creation.
- Service checkout and client dashboard pricing now use the official service plan catalog instead of stale duplicated plan lists.
