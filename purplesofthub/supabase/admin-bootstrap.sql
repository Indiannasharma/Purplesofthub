-- Make purplesofthub@gmail.com an admin
-- Run this in the Supabase SQL Editor after the profiles table exists.

UPDATE profiles
SET role = 'admin'
WHERE email = 'purplesofthub@gmail.com';

-- If the profile row doesn't exist yet, create it
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'purplesofthub@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
