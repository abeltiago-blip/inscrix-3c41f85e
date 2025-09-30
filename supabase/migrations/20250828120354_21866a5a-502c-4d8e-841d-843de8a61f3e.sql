-- Atualizar datas dos eventos de ciclismo para 2025
UPDATE public.events 
SET 
    start_date = '2025-05-18 08:00:00+00'::timestamp with time zone,
    end_date = '2025-05-18 18:00:00+00'::timestamp with time zone,
    registration_end = '2025-05-10 23:59:59+00'::timestamp with time zone
WHERE title = 'Gran Fondo do Douro 2024' AND category = 'Ciclismo';

UPDATE public.events 
SET 
    title = 'Gran Fondo do Douro 2025',
    start_date = '2025-05-18 08:00:00+00'::timestamp with time zone,
    end_date = '2025-05-18 18:00:00+00'::timestamp with time zone,
    registration_end = '2025-05-10 23:59:59+00'::timestamp with time zone
WHERE title = 'Gran Fondo do Douro 2024' AND category = 'Ciclismo';

UPDATE public.events 
SET 
    title = 'BTT Challenge Serra da Estrela 2025',
    start_date = '2025-06-22 09:00:00+00'::timestamp with time zone,
    end_date = '2025-06-22 17:00:00+00'::timestamp with time zone,
    registration_end = '2025-06-15 23:59:59+00'::timestamp with time zone
WHERE title = 'BTT Challenge Serra da Estrela' AND category = 'Ciclismo';

UPDATE public.events 
SET 
    title = 'Volta ao Algarve Cicloturismo 2025',
    start_date = '2025-09-13 08:30:00+00'::timestamp with time zone,
    end_date = '2025-09-15 17:00:00+00'::timestamp with time zone,
    registration_end = '2025-09-01 23:59:59+00'::timestamp with time zone
WHERE title = 'Volta ao Algarve Cicloturismo 2024' AND category = 'Ciclismo';