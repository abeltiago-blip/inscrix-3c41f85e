-- Fix security warnings by setting search_path on functions

-- Update generate_slug function with proper search_path
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT) 
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Convert title to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(
    regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  ));
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure we have something, fallback to 'evento' if empty
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'evento';
  END IF;
  
  final_slug := base_slug;
  
  -- Check if slug exists and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Update ensure_event_slug function with proper search_path
CREATE OR REPLACE FUNCTION public.ensure_event_slug()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Generate slug if not provided or if title changed
  IF NEW.slug IS NULL OR (OLD IS NOT NULL AND NEW.title != OLD.title) THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  
  RETURN NEW;
END;
$$;