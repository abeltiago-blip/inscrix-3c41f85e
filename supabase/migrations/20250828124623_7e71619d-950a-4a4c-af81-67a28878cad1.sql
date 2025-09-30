-- Remove duplicate events (keep only one of each)
DELETE FROM events 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY title, category, start_date ORDER BY created_at) as rn
    FROM events
  ) t WHERE rn > 1
);

-- Update event_type constraint to include recreational and educational
ALTER TABLE events DROP CONSTRAINT events_event_type_check;
ALTER TABLE events ADD CONSTRAINT events_event_type_check 
CHECK (event_type = ANY (ARRAY['sports'::text, 'cultural'::text, 'recreational'::text, 'educational'::text]));

-- Insert cultural events
INSERT INTO events (
  organizer_id, title, description, category, subcategory, event_type,
  start_date, end_date, registration_start, registration_end,
  location, address, latitude, longitude,
  max_participants, min_age, max_age, requires_medical_certificate,
  organizer_notes, status, featured
)
VALUES
-- Teatro
('54c0493a-dbd2-4aae-b484-9fa4e451f0be', 'Festival de Teatro de Aveiro 2025', 
'Festival anual de teatro com espetáculos nacionais e internacionais. Três dias de programação diversificada com workshops, masterclasses e espetáculos para todas as idades. Inclui espetáculos de teatro clássico, contemporâneo e experimental.',
'Teatro', 'Festival', 'cultural',
'2025-07-10 19:00:00+00', '2025-07-12 23:00:00+00',
'2025-08-28 12:00:00+00', '2025-07-05 23:59:59+00',
'Aveiro', 'Teatro Aveirense, Rua Belém do Pará, 3810-095 Aveiro',
40.6443, -8.6455,
150, 6, NULL, false,
'Festival de referência na região. Parcerias com escolas de teatro nacionais.',
'published', true),

-- Música
('54c0493a-dbd2-4aae-b484-9fa4e451f0be', 'Concerto de Fado no Jardim da Sereia',
'Noite de fado tradicional português no histórico Jardim da Sereia. Apresentação de fadistas reconhecidos e novos talentos. Ambiente intimista com vista sobre o Mondego. Inclui degustação de petiscos regionais.',
'Música', 'Fado', 'cultural',
'2025-08-15 21:30:00+00', '2025-08-15 23:30:00+00',
'2025-08-28 12:00:00+00', '2025-08-10 18:00:00+00',
'Coimbra', 'Jardim da Sereia, 3000-213 Coimbra',
40.2108, -8.4294,
80, 12, NULL, false,
'Evento em parceria com a Casa do Fado de Coimbra.',
'published', true),

-- Dança
('54c0493a-dbd2-4aae-b484-9fa4e451f0be', 'Workshop de Danças Tradicionais Portuguesas',
'Aprenda as danças tradicionais das diferentes regiões de Portugal. Workshop prático com professores especializados. Inclui vira do Minho, corridinho algarvio, chula e fandango. Para iniciantes e avançados.',
'Dança', 'Tradicional', 'cultural',
'2025-09-20 14:00:00+00', '2025-09-20 18:00:00+00',
'2025-08-28 12:00:00+00', '2025-09-15 23:59:59+00',
'Viana do Castelo', 'Centro Cultural de Viana do Castelo, Rua Frei Bartolomeu dos Mártires, 4900-264 Viana do Castelo',
41.6936, -8.8347,
40, 8, 75, false,
'Workshop certificado pela Federação de Folclore Português.',
'published', true),

-- Exposições
('54c0493a-dbd2-4aae-b484-9fa4e451f0be', 'Exposição "Arte Contemporânea Portuguesa"',
'Grande exposição com obras de artistas portugueses contemporâneos. Pintura, escultura, instalações e arte digital. Visitas guiadas aos fins de semana. Entrada gratuita para estudantes e seniores.',
'Artes Visuais', 'Exposição', 'cultural',
'2025-06-01 10:00:00+00', '2025-08-31 18:00:00+00',
'2025-08-28 12:00:00+00', '2025-05-25 23:59:59+00',
'Porto', 'Museu de Serralves, Rua de Serralves 977, 4150-735 Porto',
41.1596, -8.6597,
200, 0, NULL, false,
'Exposição em parceria com a Fundação de Serralves.',
'published', false),

-- Família
('54c0493a-dbd2-4aae-b484-9fa4e451f0be', 'Dia da Família no Jardim Botânico',
'Dia repleto de atividades para toda a família no Jardim Botânico da Universidade de Coimbra. Jogos tradicionais, oficinas de jardinagem para crianças, piquenique no jardim e visita guiada às estufas. Atividades gratuitas.',
'Família', 'Atividades ao Ar Livre', 'recreational',
'2025-05-25 10:00:00+00', '2025-05-25 17:00:00+00',
'2025-08-28 12:00:00+00', '2025-05-20 23:59:59+00',
'Coimbra', 'Jardim Botânico UC, Calçada Martim de Freitas, 3000-456 Coimbra',
40.2070, -8.4241,
300, 0, NULL, false,
'Evento gratuito em parceria com a Universidade de Coimbra.',
'published', true),

-- Gastronomia
('54c0493a-dbd2-4aae-b484-9fa4e451f0be', 'Festival de Vinhos do Douro',
'Degustação de vinhos das melhores quintas do Douro. Harmonização com produtos regionais, showcooking com chefs conceituados e visitas às caves. Programa VIP inclui cruzeiro no Douro.',
'Gastronomia', 'Vinhos', 'recreational',
'2025-10-11 15:00:00+00', '2025-10-13 19:00:00+00',
'2025-08-28 12:00:00+00', '2025-10-05 23:59:59+00',
'Peso da Régua', 'Museu do Douro, Rua Marquês de Pombal, 5050-282 Peso da Régua',
41.1618, -7.7878,
120, 18, NULL, false,
'Evento premium com degustações exclusivas.',
'published', true),

-- Artesanato
('54c0493a-dbd2-4aae-b484-9fa4e451f0be', 'Feira de Artesanato Tradicional de Óbidos',
'Feira de artesanato com mestres artesãos de todo o país. Demonstrações ao vivo de cerâmica, tecelagem, marcenaria e ourivesaria. Workshops práticos para visitantes. Venda de peças únicas.',
'Artesanato', 'Feira', 'recreational',
'2025-04-26 09:00:00+00', '2025-04-28 18:00:00+00',
'2025-08-28 12:00:00+00', '2025-04-20 23:59:59+00',
'Óbidos', 'Vila de Óbidos, 2510-001 Óbidos',
39.3606, -9.1567,
500, 0, NULL, false,
'Feira tradicional com mais de 100 artesãos participantes.',
'published', false),

-- Tecnologia
('54c0493a-dbd2-4aae-b484-9fa4e451f0be', 'Workshop de Desenvolvimento Web Moderno',
'Curso intensivo de 2 dias sobre desenvolvimento web com React, Node.js e bancos de dados. Para iniciantes e desenvolvedores que querem atualizar conhecimentos. Inclui certificado de participação.',
'Tecnologia', 'Programação', 'educational',
'2025-11-15 09:00:00+00', '2025-11-16 17:00:00+00',
'2025-08-28 12:00:00+00', '2025-11-10 23:59:59+00',
'Lisboa', 'Centro de Congressos de Lisboa, Praça das Indústrias, 1300-307 Lisboa',
38.7436, -9.1952,
25, 16, NULL, false,
'Workshop certificado com instrutores especializados.',
'published', true),

-- Saúde
('54c0493a-dbd2-4aae-b484-9fa4e451f0be', 'Seminário sobre Alimentação Saudável',
'Conferência com nutricionistas e chefs sobre alimentação equilibrada. Apresentação de estudos recentes, showcooking de receitas saudáveis e degustação. Inclui manual de receitas.',
'Saúde', 'Nutrição', 'educational',
'2025-03-22 14:00:00+00', '2025-03-22 18:00:00+00',
'2025-08-28 12:00:00+00', '2025-03-18 23:59:59+00',
'Aveiro', 'Centro de Congressos de Aveiro, Cais da Fonte Nova, 3810-200 Aveiro',
40.6372, -8.6533,
80, 18, NULL, false,
'Seminário em parceria com a Ordem dos Nutricionistas.',
'published', false),

-- Sustentabilidade
('54c0493a-dbd2-4aae-b484-9fa4e451f0be', 'Curso de Permacultura e Agricultura Biológica',
'Curso prático de 3 dias sobre permacultura, compostagem, hortas biológicas e sustentabilidade. Aulas teóricas e práticas em quinta pedagógica. Inclui kit de sementes e manual.',
'Sustentabilidade', 'Agricultura', 'educational',
'2025-04-04 09:00:00+00', '2025-04-06 17:00:00+00',
'2025-08-28 12:00:00+00', '2025-03-30 23:59:59+00',
'Sintra', 'Quinta da Regaleira, Rua Barbosa du Bocage, 2710-567 Sintra',
38.7969, -9.3958,
30, 16, 70, false,
'Curso certificado com componente prática em quinta biológica.',
'published', true);

-- Create ticket types for the new events
INSERT INTO ticket_types (event_id, name, description, price, currency, max_quantity, is_active, includes_meal, includes_tshirt, includes_kit, includes_insurance)
SELECT e.id, 'Bilhete Geral', 'Acesso completo ao evento', 
  CASE 
    WHEN e.title LIKE '%Teatro%' THEN 15.00
    WHEN e.title LIKE '%Fado%' THEN 12.00
    WHEN e.title LIKE '%Dança%' THEN 8.00
    WHEN e.title LIKE '%Família%' THEN 0.00
    WHEN e.title LIKE '%Vinhos%' THEN 45.00
    WHEN e.title LIKE '%Artesanato%' THEN 3.00
    WHEN e.title LIKE '%Web%' THEN 120.00
    WHEN e.title LIKE '%Alimentação%' THEN 25.00
    WHEN e.title LIKE '%Permacultura%' THEN 85.00
    ELSE 10.00
  END,
  'EUR', 
  CASE 
    WHEN e.max_participants < 50 THEN e.max_participants
    ELSE e.max_participants / 2
  END,
  true,
  CASE WHEN e.title LIKE '%Vinhos%' OR e.title LIKE '%Permacultura%' THEN true ELSE false END,
  CASE WHEN e.event_type = 'educational' THEN true ELSE false END,
  CASE WHEN e.title LIKE '%Dança%' OR e.title LIKE '%Permacultura%' THEN true ELSE false END,
  false
FROM events e 
WHERE e.category != 'Ciclismo' AND e.status = 'published';