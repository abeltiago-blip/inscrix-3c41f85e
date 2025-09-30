-- Atualizar perfis dos utilizadores de teste
UPDATE public.profiles 
SET 
    first_name = 'Organizador',
    last_name = 'Inscrix',
    role = 'organizer',
    phone = '+351 912 345 678',
    bio = 'Organizador oficial da plataforma Inscrix, especializado em eventos desportivos.',
    organization_name = 'Inscrix - Gestão de Eventos Desportivos',
    updated_at = now()
WHERE email = 'organizador@inscrix.pt';

UPDATE public.profiles 
SET 
    first_name = 'Participante',
    last_name = 'Inscrix',
    role = 'participant',
    phone = '+351 918 765 432',
    bio = 'Participante de teste da plataforma Inscrix, apaixonado por desporto.',
    updated_at = now()
WHERE email = 'participante@inscrix.pt';

-- Atualizar eventos existentes para serem do organizador de teste
UPDATE public.events 
SET organizer_id = (SELECT user_id FROM public.profiles WHERE email = 'organizador@inscrix.pt' LIMIT 1)
WHERE organizer_id IS NOT NULL;

-- Criar eventos de ciclismo
INSERT INTO public.events (
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
    latitude,
    longitude,
    max_participants,
    min_age,
    max_age,
    requires_medical_certificate,
    status,
    organizer_id,
    organizer_notes,
    featured,
    created_at,
    updated_at
) VALUES 
-- Evento 1: Gran Fondo do Douro
(
    'Gran Fondo do Douro 2024',
    'Uma experiência única de ciclismo pelas magníficas paisagens do Douro. Percursos de 60km, 100km e 140km através das vinhas em socalcos e aldeias históricas da região. Inclui pontos de avitualamento, assistência técnica e medalha de participação.',
    'Ciclismo',
    'Estrada',
    'competitivo',
    '2024-05-18 08:00:00+00',
    '2024-05-18 18:00:00+00',
    now(),
    '2024-05-10 23:59:59+00',
    'Peso da Régua',
    'Avenida Sacadura Cabral, 5050-307 Peso da Régua',
    41.1618,
    -7.7878,
    500,
    16,
    75,
    false,
    'published',
    (SELECT user_id FROM public.profiles WHERE email = 'organizador@inscrix.pt' LIMIT 1),
    'Evento premium com paisagens deslumbrantes. Parcerias com quintas locais para avitualamento.',
    true,
    now(),
    now()
),
-- Evento 2: BTT Serra da Estrela
(
    'BTT Challenge Serra da Estrela',
    'Aventura épica de BTT na Serra da Estrela com três percursos desafiantes: Iniciado (25km), Intermédio (45km) e Extremo (65km). Terrenos variados desde trilhos técnicos a subidas exigentes. Inclui seguro, t-shirt técnica e almoço.',
    'Ciclismo',
    'BTT',
    'recreativo',
    '2024-06-22 09:00:00+00',
    '2024-06-22 17:00:00+00',  
    now(),
    '2024-06-15 23:59:59+00',
    'Covilhã',
    'Parque da Goldra, 6200-570 Covilhã',
    40.2741,
    -7.5065,
    300,
    14,
    70,
    true,
    'published',
    (SELECT user_id FROM public.profiles WHERE email = 'organizador@inscrix.pt' LIMIT 1),
    'Percursos técnicos com vistas espetaculares. Requer alguma experiência em BTT.',
    true,
    now(),
    now()
),
-- Evento 3: Volta ao Algarve Cicloturismo
(
    'Volta ao Algarve Cicloturismo 2024',
    'Três dias de ciclismo pelo Algarve seguindo parte do percurso da famosa Volta ao Algarve profissional. Etapas de 80-120km por dia com pernoita incluída. Paisagens costeiras, serra algarvia e aldeias típicas. Inclui alojamento, refeições e van de apoio.',
    'Ciclismo',
    'Estrada',
    'recreativo',
    '2024-09-13 08:30:00+00',
    '2024-09-15 17:00:00+00',
    now(),
    '2024-09-01 23:59:59+00',
    'Lagos',
    'Marina de Lagos, 8600-315 Lagos',
    37.1000,
    -8.6700,
    100,
    18,
    65,
    false,
    'published',  
    (SELECT user_id FROM public.profiles WHERE email = 'organizador@inscrix.pt' LIMIT 1),
    'Evento premium de múltiplos dias. Inclui alojamento em hotel 4 estrelas e todas as refeições.',
    true,
    now(),
    now()
);

-- Criar tipos de bilhetes para os eventos de ciclismo
WITH cycling_events AS (
    SELECT id, title FROM public.events 
    WHERE category = 'Ciclismo' 
    AND organizer_id = (SELECT user_id FROM public.profiles WHERE email = 'organizador@inscrix.pt' LIMIT 1)
)
INSERT INTO public.ticket_types (
    event_id,
    name,
    description,
    price,
    early_bird_price,
    early_bird_end_date,
    max_quantity,
    age_group,
    gender_restriction,
    includes_tshirt,
    includes_kit,
    includes_meal,
    includes_insurance,
    is_active,
    sort_order,
    currency,
    created_at,
    updated_at
)
SELECT 
    e.id,
    'Inscrição Individual',
    'Inscrição individual com direito a medalha de participação, t-shirt técnica e avitualamento',
    CASE 
        WHEN e.title LIKE '%Gran Fondo%' THEN 45.00
        WHEN e.title LIKE '%BTT%' THEN 35.00
        WHEN e.title LIKE '%Volta ao Algarve%' THEN 199.00
        ELSE 30.00
    END,
    CASE 
        WHEN e.title LIKE '%Gran Fondo%' THEN 35.00
        WHEN e.title LIKE '%BTT%' THEN 25.00
        WHEN e.title LIKE '%Volta ao Algarve%' THEN 179.00
        ELSE 25.00
    END,
    CASE 
        WHEN e.title LIKE '%Gran Fondo%' THEN '2024-04-30 23:59:59+00'::timestamptz
        WHEN e.title LIKE '%BTT%' THEN '2024-06-01 23:59:59+00'::timestamptz
        WHEN e.title LIKE '%Volta ao Algarve%' THEN '2024-08-15 23:59:59+00'::timestamptz
        ELSE now() + interval '30 days'
    END,
    null,
    null,
    null,
    true,
    true,
    CASE 
        WHEN e.title LIKE '%Volta ao Algarve%' THEN true
        ELSE false
    END,
    true,
    true,
    0,
    'EUR',
    now(),
    now()
FROM cycling_events e;

-- Criar algumas inscrições de teste
WITH cycling_events AS (
    SELECT e.id as event_id, tt.id as ticket_type_id, tt.early_bird_price
    FROM public.events e
    JOIN public.ticket_types tt ON tt.event_id = e.id
    WHERE e.category = 'Ciclismo' 
    AND e.organizer_id = (SELECT user_id FROM public.profiles WHERE email = 'organizador@inscrix.pt' LIMIT 1)
    LIMIT 2
)
INSERT INTO public.registrations (
    event_id,
    participant_id,
    participant_name,
    participant_email,
    participant_phone,
    participant_gender,
    participant_birth_date,
    participant_nationality,
    participant_document_number,
    emergency_contact_name,
    emergency_contact_phone,
    tshirt_size,
    team_name,
    amount_paid,
    payment_status,
    payment_method,
    check_in_status,
    status,
    ticket_type_id,
    created_at,
    updated_at
)
SELECT 
    ce.event_id,
    (SELECT user_id FROM public.profiles WHERE email = 'participante@inscrix.pt'),
    'Participante Inscrix',
    'participante@inscrix.pt',
    '+351 918 765 432',
    'masculino',
    '1985-03-15'::date,
    'Portugal',
    '12345678',
    'Maria Inscrix',
    '+351 912 333 444',
    'M',
    null,
    ce.early_bird_price,
    'paid',
    'stripe',
    'not_checked_in',
    'active',
    ce.ticket_type_id,
    now() - interval '2 days',
    now() - interval '2 days'
FROM cycling_events ce;