-- Corrigir datas de fim de inscrição que estão no passado
-- Colocar todas para pelo menos 1 semana antes do evento

-- Eventos em 2025 que têm registration_end no passado
UPDATE events 
SET registration_end = CASE 
  -- Para eventos em abril, colocar inscrições até março de 2025
  WHEN start_date >= '2025-04-01' AND start_date < '2025-05-01' THEN '2025-03-25 23:59:59+00'
  -- Para eventos em maio, colocar inscrições até abril de 2025
  WHEN start_date >= '2025-05-01' AND start_date < '2025-06-01' THEN '2025-04-25 23:59:59+00'
  -- Para eventos em junho, colocar inscrições até maio de 2025
  WHEN start_date >= '2025-06-01' AND start_date < '2025-07-01' THEN '2025-05-30 23:59:59+00'
  -- Para eventos em julho, colocar inscrições até junho de 2025
  WHEN start_date >= '2025-07-01' AND start_date < '2025-08-01' THEN '2025-06-30 23:59:59+00'
  -- Para eventos em agosto, colocar inscrições até julho de 2025
  WHEN start_date >= '2025-08-01' AND start_date < '2025-09-01' THEN '2025-07-31 23:59:59+00'
  -- Para eventos em setembro, colocar inscrições até agosto de 2025
  WHEN start_date >= '2025-09-01' AND start_date < '2025-10-01' THEN '2025-08-31 23:59:59+00'
  -- Para eventos em outubro, colocar inscrições até setembro de 2025
  WHEN start_date >= '2025-10-01' AND start_date < '2025-11-01' THEN '2025-09-30 23:59:59+00'
  -- Para eventos em novembro, colocar inscrições até outubro de 2025
  WHEN start_date >= '2025-11-01' AND start_date < '2025-12-01' THEN '2025-10-31 23:59:59+00'
  ELSE registration_end
END
WHERE registration_end < NOW() AND status = 'published';