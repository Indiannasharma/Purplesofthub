-- Enable http calls from Postgres if not already enabled
create extension if not exists pg_net;

-- Sends signup payload to Edge Function
create or replace function public.handle_new_user_welcome()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-function-secret', 'YOUR_WELCOME_FUNCTION_SECRET'
    ),
    body := jsonb_build_object(
      'user_id', NEW.id,
      'email', NEW.email,
      'first_name', coalesce(NEW.raw_user_meta_data->>'first_name', split_part(coalesce(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1))
    )
  );

  return NEW;
end;
$$;

-- Recreate trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created_welcome ON auth.users;

CREATE TRIGGER on_auth_user_created_welcome
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_welcome();
