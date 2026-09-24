-- ============================================================
-- PurpleSoftHub — Privatise the account-recovery document bucket
--
-- Security findings addressed (see docs/security/ACCOUNT_RECOVERY_SECURITY_PATCH.md):
--   C1  `account-recovery-documents` was created as a PUBLIC bucket with a
--       public SELECT policy, and the public endpoint stored full public URLs
--       (getPublicUrl) produced from guessable object names
--       (`id_<timestamp>_<original-filename>`). Identity documents were
--       therefore readable by anyone who knew or guessed an object URL.
--   C2  The public endpoint persisted browser-supplied `admin_notes`, and the
--       anonymous INSERT policy on the table allowed anyone holding the anon
--       key to write rows (including internal fields) directly.
--   C3  `Allow users to read own submissions` used `auth.uid() IS NOT NULL`,
--       which let ANY signed-in user read EVERY recovery row — including
--       `admin_notes` and document references.
--
-- This migration:
--   1. makes the bucket private and drops the two public storage policies,
--   2. reports any OTHER storage policy that still targets the bucket,
--   3. removes the anonymous INSERT policy on account_recovery_requests,
--   4. replaces the over-broad own-row SELECT policy with an exact one,
--   5. restricts anon/authenticated table privileges so internal columns can
--      only be read or written by service-role server routes,
--   6. converts legacy public URLs in existing rows to canonical private object
--      paths (idempotent; the stored objects themselves are untouched).
--
-- Nothing is deleted: buckets, objects and recovery rows are all preserved.
-- Apply in the Supabase SQL Editor against the production project, then run the
-- verification queries at the bottom of this file.
-- ============================================================

BEGIN;

-- ─── 1. Bucket privacy + the two known public policies ───────
UPDATE storage.buckets
SET public = false
WHERE id = 'account-recovery-documents';

DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

-- ─── 2. Surface any remaining policy that targets the bucket ─
-- Containment is only complete when this block reports nothing.
DO $$
DECLARE
  policy record;
  remaining int := 0;
BEGIN
  FOR policy IN
    SELECT policyname, cmd, roles::text AS roles
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND (
        COALESCE(qual, '') || ' ' || COALESCE(with_check, '')
      ) LIKE '%account-recovery-documents%'
  LOOP
    remaining := remaining + 1;
    RAISE WARNING
      'REVIEW REQUIRED: storage.objects policy "%" (cmd=%, roles=%) still references the account-recovery-documents bucket',
      policy.policyname, policy.cmd, policy.roles;
  END LOOP;

  IF remaining > 0 THEN
    RAISE WARNING
      'Containment is INCOMPLETE until every policy listed above is removed or narrowed to service_role.';
  ELSE
    RAISE NOTICE 'No storage.objects policy references the account-recovery-documents bucket.';
  END IF;
END
$$;

-- ─── 3. Remove the anonymous INSERT policy ───────────────────
-- Public submissions are written by the service-role route handler
-- (app/api/account-recovery/route.ts), which validates and sanitises every
-- field. An anon-key client must not be able to insert rows directly.
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.account_recovery_requests;

-- ─── 4. Replace the over-broad own-row SELECT policy ─────────
DROP POLICY IF EXISTS "Allow users to read own submissions" ON public.account_recovery_requests;
DROP POLICY IF EXISTS "Users can read own recovery requests" ON public.account_recovery_requests;

CREATE POLICY "Users can read own recovery requests"
  ON public.account_recovery_requests
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR lower(auth.jwt() ->> 'email') = lower(email)
  );

-- The pre-existing "Allow admins to manage all recovery requests" policy is
-- left in place for documentation; every admin read/write now runs through
-- requireAdmin()-guarded service-role routes, and step 5 below removes the
-- client-side privileges that policy used to rely on.

-- ─── 5. Column-level privileges ──────────────────────────────
-- Internal columns (`admin_notes`, `id_document_url`, `screenshot_url`,
-- `created_by_admin_id`) must be reachable only by service-role server routes.
-- A column-level REVOKE cannot beat a table-level GRANT, so the table-level
-- privilege is revoked first and an explicit public column list is re-granted.
DO $$
DECLARE
  public_columns text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
  INTO public_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'account_recovery_requests'
    AND column_name IN (
      'id', 'first_name', 'last_name', 'full_name', 'handle', 'email', 'phone',
      'support_type', 'appeal_message', 'platform', 'amount', 'status',
      'payment_status', 'amount_paid', 'payment_method', 'created_at',
      'updated_at', 'user_id'
    );

  IF public_columns IS NULL THEN
    RAISE EXCEPTION
      'No recognised public columns on account_recovery_requests — aborting rather than locking the table down incorrectly.';
  END IF;

  EXECUTE 'REVOKE ALL ON public.account_recovery_requests FROM anon';
  EXECUTE 'REVOKE SELECT, INSERT, UPDATE, DELETE ON public.account_recovery_requests FROM authenticated';
  EXECUTE format(
    'GRANT SELECT (%s) ON public.account_recovery_requests TO authenticated',
    public_columns
  );

  RAISE NOTICE 'authenticated may read only these columns: %', public_columns;
END
$$;

-- ─── 6. Convert legacy public URLs to private object paths ───
-- Historical rows may hold
-- `.../storage/v1/object/public/account-recovery-documents/<object>` (produced
-- by the removed getPublicUrl() call). The URL prefix is stripped so the record
-- holds the bucket-relative object path the guarded signed-URL endpoint
-- expects. Idempotent; the stored objects themselves are untouched.
UPDATE public.account_recovery_requests
SET id_document_url = regexp_replace(
      id_document_url,
      '^https?://[^/]+/storage/v1/object/public/account-recovery-documents/',
      ''
    )
WHERE id_document_url ~ '^https?://[^/]+/storage/v1/object/public/account-recovery-documents/';

UPDATE public.account_recovery_requests
SET screenshot_url = regexp_replace(
      screenshot_url,
      '^https?://[^/]+/storage/v1/object/public/account-recovery-documents/',
      ''
    )
WHERE screenshot_url ~ '^https?://[^/]+/storage/v1/object/public/account-recovery-documents/';

NOTIFY pgrst, 'reload schema';

COMMIT;

-- ============================================================
-- Verification (run after applying; every query is read-only)
-- ============================================================
-- V1. The bucket must be private.
--   SELECT id, public FROM storage.buckets WHERE id = 'account-recovery-documents';
--   Expected: public = false
--
-- V2. No storage policy may reference the recovery bucket.
--   SELECT policyname, cmd, roles, qual, with_check
--   FROM pg_policies
--   WHERE schemaname = 'storage' AND tablename = 'objects';
--   Expected: no row whose qual / with_check mentions account-recovery-documents
--
-- V3. Policies on the recovery table.
--   SELECT policyname, cmd, roles, qual, with_check
--   FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'account_recovery_requests'
--   ORDER BY policyname;
--
-- V4. Privileges.
--   SELECT grantee, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE table_name = 'account_recovery_requests'
--   ORDER BY grantee, privilege_type;
--   Expected: no table-level SELECT/INSERT/UPDATE/DELETE for anon or authenticated
--
--   SELECT grantee, column_name, privilege_type
--   FROM information_schema.column_privileges
--   WHERE table_name = 'account_recovery_requests'
--     AND grantee IN ('anon', 'authenticated')
--   ORDER BY grantee, column_name;
--   Expected: authenticated SELECT only, and never on admin_notes,
--             id_document_url, screenshot_url or created_by_admin_id
--
-- V5. No legacy public URLs remain.
--   SELECT count(*) FROM public.account_recovery_requests
--   WHERE id_document_url LIKE '%/storage/v1/object/public/%'
--      OR screenshot_url  LIKE '%/storage/v1/object/public/%';
--   Expected: 0
--
-- V6. Unauthorised retrieval must now fail. From a machine that is NOT signed in
--     as an administrator:
--   curl -I "https://<project>.supabase.co/storage/v1/object/public/account-recovery-documents/<legacy-object-name>"
--   Expected: 400 / 404 — never 200
--
-- V7. Signed URLs expire as configured (web console).
--   Sign a URL for a known object, wait 61 seconds, reload it.
--   Expected: 400 / 403 "JWT expired"
--
-- ============================================================
-- Rollback (only if an emergency restore is unavoidable)
-- ============================================================
-- Rollback reintroduces the confidentiality exposure of identity documents.
-- Prefer restoring access through the guarded admin signed-URL endpoint.
--
--   UPDATE storage.buckets SET public = true
--   WHERE id = 'account-recovery-documents';
--
--   GRANT ALL ON public.account_recovery_requests TO anon, authenticated;
