-- Migration 007: Update Existing User Profiles with Real Names from Auth Metadata
BEGIN;

UPDATE public.profiles p
SET display_name = COALESCE(
  u.raw_user_meta_data->>'full_name',
  u.raw_user_meta_data->>'name',
  p.display_name
)
FROM auth.users u
WHERE p.id = u.id;

COMMIT;
