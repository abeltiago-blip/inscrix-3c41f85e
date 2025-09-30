-- Criar eventos de teste com featured = true para demonstração
-- Isto vai corrigir o problema do HeroSection

INSERT INTO events (
  organizer_id, 
  title, 
  description, 
  category, 
  subcategory,
  event_type,
  start_date,
  end_date,
  registration_start,
  registration_end,
  location,
  address,
  max_participants,
  status,
  featured,
  image_url
) VALUES 
-- Evento de ciclismo em destaque
(
  (SELECT user_id FROM profiles WHERE role = 'admin' LIMIT 1),
  'GRAN FONDO DO DOURO 2025',
  'Uma experiência única de ciclismo pelas magníficas paisagens do Douro. Percursos de 60km, 100km e 140km através das vinhas em socalcos e aldeias históricas da região.',
  'ciclismo',
  'estrada',
  'sports',
  '2025-05-18 08:00:00+00',
  '2025-05-18 18:00:00+00',
  now(),
  '2025-05-15 23:59:00+00',
  'Peso da Régua',
  'Estação de Comboios de Peso da Régua, 5050-284 Peso da Régua',
  500,
  'published',
  true,
  '/assets/gran-fondo-douro.jpg'
),
-- Evento cultural em destaque  
(
  (SELECT user_id FROM profiles WHERE role = 'admin' LIMIT 1),
  'FESTIVAL DE FADO DE COIMBRA',
  'Três noites mágicas de fado tradicional no coração de Coimbra. Artistas nacionais e internacionais numa celebração única da nossa música.',
  'musica',
  'fado',
  'cultural',
  '2025-04-25 21:00:00+00',
  '2025-04-27 23:30:00+00',
  now(),
  '2025-04-22 20:00:00+00',
  'Coimbra',
  'Sé Velha de Coimbra, Largo da Sé Velha, 3000-383 Coimbra',
  200,
  'published',
  true,
  '/assets/fado-coimbra.jpg'
),
-- Evento desportivo em destaque
(
  (SELECT user_id FROM profiles WHERE role = 'admin' LIMIT 1),
  'BTT CHALLENGE SERRA DA ESTRELA',
  'Aventura épica de BTT na Serra da Estrela com três percursos desafiantes: Iniciado (25km), Intermédio (45km) e Extremo (65km).',
  'ciclismo',
  'btt',
  'sports',
  '2025-06-14 09:00:00+00',
  '2025-06-14 17:00:00+00',
  now(),
  '2025-06-10 20:00:00+00',
  'Covilhã',
  'Centro de BTT da Serra da Estrela, Covilhã',
  300,
  'published',
  true,
  '/assets/btt-serra-estrela.jpg'
)