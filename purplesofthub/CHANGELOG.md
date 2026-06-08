## [Unreleased]
### Added
- Added branded PurpleSoftHub welcome and login notification emails for account signup and sign-in flows.

### Fixed
- Login notification emails now verify the signed-in user with the current Supabase access token when cookies are not immediately available server-side.
- Sign-up form fields no longer lose focus after the first typed character.
