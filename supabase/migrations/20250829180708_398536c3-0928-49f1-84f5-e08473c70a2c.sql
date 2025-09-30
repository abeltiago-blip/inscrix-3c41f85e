-- Criar tipos de bilhetes para os eventos de demonstração
INSERT INTO ticket_types (event_id, name, description, price, max_quantity, includes_tshirt, includes_kit, includes_meal, includes_insurance, sort_order, is_active)
SELECT 
    e.id,
    'Inscrição Geral',
    'Inclui participação no evento, seguro, t-shirt técnica e medalha de participação',
    CASE 
        WHEN e.title LIKE '%GRAN FONDO%' THEN 35.00
        WHEN e.title LIKE '%FADO%' THEN 15.00  
        WHEN e.title LIKE '%BTT%' THEN 25.00
        ELSE 20.00
    END,
    CASE 
        WHEN e.title LIKE '%GRAN FONDO%' THEN 500
        WHEN e.title LIKE '%FADO%' THEN 200
        WHEN e.title LIKE '%BTT%' THEN 300
        ELSE 100
    END,
    true,  -- includes_tshirt
    CASE WHEN e.event_type = 'sports' THEN true ELSE false END, -- includes_kit
    CASE WHEN e.title LIKE '%FADO%' THEN true ELSE false END,   -- includes_meal
    CASE WHEN e.event_type = 'sports' THEN true ELSE false END, -- includes_insurance
    0,     -- sort_order
    true   -- is_active
FROM events e 
WHERE e.featured = true AND e.status = 'published';

-- Adicionar bilhetes premium para alguns eventos
INSERT INTO ticket_types (event_id, name, description, price, max_quantity, includes_tshirt, includes_kit, includes_meal, includes_insurance, sort_order, is_active)
SELECT 
    e.id,
    CASE 
        WHEN e.title LIKE '%GRAN FONDO%' THEN 'Inscrição VIP'
        WHEN e.title LIKE '%FADO%' THEN 'Lugar Premium'
        WHEN e.title LIKE '%BTT%' THEN 'Pack Completo'
    END,
    CASE 
        WHEN e.title LIKE '%GRAN FONDO%' THEN 'Inclui tudo + jantar de encerramento + massagem pós-prova + t-shirt premium'
        WHEN e.title LIKE '%FADO%' THEN 'Mesa reservada, jantar incluído e CD de recordação'
        WHEN e.title LIKE '%BTT%' THEN 'Inclui tudo + almoço + assistência técnica personalizada + mochila'
    END,
    CASE 
        WHEN e.title LIKE '%GRAN FONDO%' THEN 65.00
        WHEN e.title LIKE '%FADO%' THEN 45.00  
        WHEN e.title LIKE '%BTT%' THEN 55.00
    END,
    CASE 
        WHEN e.title LIKE '%GRAN FONDO%' THEN 100
        WHEN e.title LIKE '%FADO%' THEN 50
        WHEN e.title LIKE '%BTT%' THEN 80
    END,
    true,  -- includes_tshirt
    true,  -- includes_kit
    true,  -- includes_meal
    true,  -- includes_insurance
    1,     -- sort_order
    true   -- is_active
FROM events e 
WHERE e.featured = true AND e.status = 'published';