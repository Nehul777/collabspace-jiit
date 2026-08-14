-- Migration 011: Clean display names by removing enrollment numbers
BEGIN;

-- 1. Update the handle_new_user trigger to clean the name during signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    raw_name TEXT;
    cleaned_name TEXT;
BEGIN
    -- Extract the best available name from metadata or email
    raw_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        split_part(new.email, '@', 1)
    );

    -- Remove any quotes, numbers, and anything after them, then trim whitespace
    -- Example: "SHREYA KANSAL '992501230005" -> "SHREYA KANSAL"
    cleaned_name := trim(regexp_replace(raw_name, '[\d''].*$', ''));

    -- Fallback to the first part of the email if the regex completely stripped the name
    IF cleaned_name = '' OR cleaned_name IS NULL THEN
        cleaned_name := split_part(new.email, '@', 1);
    END IF;

    INSERT INTO public.profiles (id, email, display_name, enrollment_no)
    VALUES (
      new.id, 
      new.email,
      cleaned_name,
      split_part(new.email, '@', 1)
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Clean up all existing display names in the profiles table
UPDATE public.profiles
SET display_name = trim(regexp_replace(display_name, '[\d''].*$', ''))
WHERE display_name ~ '[\d'']';

COMMIT;
