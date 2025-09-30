-- Criar utilizadores de teste
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at
) VALUES 
-- Organizador de teste
(
    '11111111-1111-1111-1111-111111111111'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'organizador@inscrix.pt',
    '$2a$10$0000000000000000000000000',
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Organizador", "last_name": "Inscrix", "role": "organizer"}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null
),
-- Participante de teste
(
    '22222222-2222-2222-2222-222222222222'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'participante@inscrix.pt',
    '$2a$10$0000000000000000000000000',
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Participante", "last_name": "Inscrix", "role": "participant"}',
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null
)
ON CONFLICT (id) DO NOTHING;

-- Criar perfis para os utilizadores de teste
INSERT INTO public.profiles (
    user_id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    phone,
    bio,
    organization_name,
    created_at,
    updated_at
) VALUES 
(
    '11111111-1111-1111-1111-111111111111'::uuid,
    'organizador@inscrix.pt',
    'Organizador',
    'Inscrix',
    'organizer',
    true,
    '+351 912 345 678',
    'Organizador oficial da plataforma Inscrix, especializado em eventos desportivos.',
    'Inscrix - Gestão de Eventos Desportivos',
    now(),
    now()
),
(
    '22222222-2222-2222-2222-222222222222'::uuid,
    'participante@inscrix.pt',
    'Participante',
    'Inscrix',
    'participant',
    true,
    '+351 918 765 432',
    'Participante de teste da plataforma Inscrix, apaixonado por desporto.',
    null,
    now(),
    now()
)
ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    bio = EXCLUDED.bio,
    organization_name = EXCLUDED.organization_name,
    updated_at = now();

-- Atualizar eventos existentes para serem do organizador de teste
UPDATE public.events 
SET organizer_id = '11111111-1111-1111-1111-111111111111'::uuid
WHERE organizer_id IS NOT NULL;

-- Criar eventos de ciclismo
INSERT INTO public.events (
    id,
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
    gen_random_uuid(),
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
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Evento premium com paisagens deslumbrantes. Parcerias com quintas locais para avitualamento.',
    true,
    now(),
    now()
),
-- Evento 2: BTT Serra da Estrela
(
    gen_random_uuid(),
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
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Percursos técnicos com vistas espetaculares. Requer alguma experiência em BTT.',
    true,
    now(),
    now()
),
-- Evento 3: Volta ao Algarve Cicloturismo
(
    gen_random_uuid(),
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
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Evento premium de múltiplos dias. Inclui alojamento em hotel 4 estrelas e todas as refeições.',
    true,
    now(),
    now()
);

-- Criar tipos de bilhetes para os eventos de ciclismo
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
    END,
    CASE 
        WHEN e.title LIKE '%Gran Fondo%' THEN 35.00
        WHEN e.title LIKE '%BTT%' THEN 25.00
        WHEN e.title LIKE '%Volta ao Algarve%' THEN 179.00
    END,
    CASE 
        WHEN e.title LIKE '%Gran Fondo%' THEN '2024-04-30 23:59:59+00'::timestamptz
        WHEN e.title LIKE '%BTT%' THEN '2024-06-01 23:59:59+00'::timestamptz
        WHEN e.title LIKE '%Volta ao Algarve%' THEN '2024-08-15 23:59:59+00'::timestamptz
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
FROM public.events e 
WHERE e.category = 'Ciclismo' AND e.organizer_id = '11111111-1111-1111-1111-111111111111'::uuid;

-- Criar algumas inscrições de teste para simular atividade
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
    e.id,
    '22222222-2222-2222-2222-222222222222'::uuid,
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
    tt.early_bird_price,
    'paid',
    'stripe',
    'not_checked_in',
    'active',
    tt.id,
    now() - interval '2 days',
    now() - interval '2 days'
FROM public.events e
JOIN public.ticket_types tt ON tt.event_id = e.id
WHERE e.category = 'Ciclismo' 
AND e.organizer_id = '11111111-1111-1111-1111-111111111111'::uuid
LIMIT 2;