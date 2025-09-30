-- =============================================
-- Fix image paths to use public folder
-- =============================================

UPDATE public.events 
SET image_url = REPLACE(image_url, '/src/assets/', '/assets/')
WHERE image_url LIKE '/src/assets/%';

-- Update specific images
UPDATE public.events 
SET image_url = '/assets/permacultura-agricultura.jpg'
WHERE image_url = '/src/assets/permacultura-agricultura.jpg';

UPDATE public.events 
SET image_url = '/assets/gran-fondo-douro.jpg'
WHERE image_url = '/src/assets/gran-fondo-douro.jpg';

UPDATE public.events 
SET image_url = '/assets/jardim-botanico-familia.jpg'
WHERE image_url = '/src/assets/jardim-botanico-familia.jpg';

UPDATE public.events 
SET image_url = '/assets/btt-serra-estrela.jpg'
WHERE image_url = '/src/assets/btt-serra-estrela.jpg';

UPDATE public.events 
SET image_url = '/assets/fado-coimbra.jpg'
WHERE image_url = '/src/assets/fado-coimbra.jpg';

UPDATE public.events 
SET image_url = '/assets/danca-tradicional.jpg'
WHERE image_url = '/src/assets/danca-tradicional.jpg';

UPDATE public.events 
SET image_url = '/assets/arte-contemporanea.jpg'
WHERE image_url = '/src/assets/arte-contemporanea.jpg';

UPDATE public.events 
SET image_url = '/assets/artesanato-obidos.jpg'
WHERE image_url = '/src/assets/artesanato-obidos.jpg';