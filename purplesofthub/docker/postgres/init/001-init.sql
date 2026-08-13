CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'purplesofthub_app'
  ) THEN
    CREATE ROLE purplesofthub_app LOGIN PASSWORD 'purplesofthub_app_password';
  END IF;
END
$$;
