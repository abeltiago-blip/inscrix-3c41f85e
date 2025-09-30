-- Add subcategory column to age_groups table
ALTER TABLE public.age_groups 
ADD COLUMN subcategory text;