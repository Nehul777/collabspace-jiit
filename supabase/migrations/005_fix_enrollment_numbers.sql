-- Migration 005: Fix Enrollment Numbers for Existing Users
-- This migration updates the enrollment_no for all existing profiles 
-- by extracting the enrollment number from their JIIT email address.

BEGIN;

UPDATE public.profiles
SET enrollment_no = SPLIT_PART(email, '@', 1)
WHERE email LIKE '%@mail.jiit.ac.in';

COMMIT;
