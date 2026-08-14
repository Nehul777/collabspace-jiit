-- Migration 008: Security Audit Fixes (P0-1, P0-2, P0-4)
BEGIN;

-- ============================================================================
-- Fix P0-4: Auto-populate display_name and enrollment_no on signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, enrollment_no)
    VALUES (
      new.id, 
      new.email,
      COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        split_part(new.email, '@', 1)
      ),
      split_part(new.email, '@', 1)
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Fix P0-1 & P0-2: Block non-admins from changing their name or enrollment_no
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enforce_display_name_and_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run enforcement on UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- If the user is NOT an admin, force the protected fields to remain unchanged
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = TRUE
    ) THEN
      -- Revert display_name if they tried to change it (and it wasn't null)
      IF OLD.display_name IS NOT NULL THEN
        NEW.display_name := OLD.display_name;
      END IF;
      
      -- Revert enrollment_no if they tried to change it (and it wasn't null)
      IF OLD.enrollment_no IS NOT NULL THEN
        NEW.enrollment_no := OLD.enrollment_no;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_enforce_display_name_and_enrollment ON public.profiles;
CREATE TRIGGER tr_enforce_display_name_and_enrollment
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_display_name_and_enrollment();

COMMIT;
