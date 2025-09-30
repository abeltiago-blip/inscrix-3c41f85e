-- Add image_url column to events table
ALTER TABLE events ADD COLUMN image_url TEXT;

-- Add images to specific events
UPDATE events SET image_url = '/src/assets/gran-fondo-douro.jpg' WHERE title = 'Gran Fondo do Douro 2025';
UPDATE events SET image_url = '/src/assets/fado-coimbra.jpg' WHERE title = 'Concerto de Fado no Jardim da Sereia';
UPDATE events SET image_url = '/src/assets/danca-tradicional.jpg' WHERE title = 'Workshop de Danças Tradicionais Portuguesas';