-- Ativar realtime para tabelas relevantes de pagamentos e registrations
-- Isso permite atualizações automáticas nos clientes quando há mudanças

-- Ativar replica identity FULL para capturar todos os dados nas mudanças
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.registrations REPLICA IDENTITY FULL;
ALTER TABLE public.easypay_payments REPLICA IDENTITY FULL;
ALTER TABLE public.event_checkins REPLICA IDENTITY FULL;

-- Adicionar as tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.easypay_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_checkins;