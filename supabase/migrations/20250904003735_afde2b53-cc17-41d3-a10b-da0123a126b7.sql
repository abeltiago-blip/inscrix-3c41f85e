-- Criar tabela para escalões etários configuráveis
CREATE TABLE public.age_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  min_age INTEGER,
  max_age INTEGER,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.age_groups ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Age groups are viewable by everyone" 
ON public.age_groups 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all age groups" 
ON public.age_groups 
FOR ALL 
USING (get_current_user_role() = 'admin'::text)
WITH CHECK (get_current_user_role() = 'admin'::text);

-- Trigger para updated_at
CREATE TRIGGER update_age_groups_updated_at
  BEFORE UPDATE ON public.age_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais para ciclismo baseados na tabela fornecida
INSERT INTO public.age_groups (category_id, name, min_age, max_age, description, sort_order) VALUES
('cycling', 'Sub-7 Masc', 5, 6, 'Homem 5-6 anos', 1),
('cycling', 'Sub-9 Masc', 7, 8, 'Homem 7-8 anos', 2),
('cycling', 'Sub-11 Masc', 9, 10, 'Homem 9-10 anos', 3),
('cycling', 'Sub-13 Masc', 11, 12, 'Homem 11-12 anos', 4),
('cycling', 'Sub-15 Masc', 13, 14, 'Homem 13-14 anos', 5),
('cycling', 'Sub-17 Masc', 15, 16, 'Homem 15-16 anos', 6),
('cycling', 'Sub-19 Masc', 17, 18, 'Homem 17-18 anos', 7),
('cycling', 'Sub-23 Masc', 19, 22, 'Homem 19-22 anos', 8),
('cycling', 'Elites Masc', 23, 29, 'Homem 23-29 anos', 9),
('cycling', 'Masters 30 Masc', 30, 34, 'Homem 30-34 anos', 10),
('cycling', 'Masters 35 Masc', 35, 39, 'Homem 35-39 anos', 11),
('cycling', 'Masters 40 Masc', 40, 44, 'Homem 40-44 anos', 12),
('cycling', 'Masters 45 Masc', 45, 49, 'Homem 45-49 anos', 13),
('cycling', 'Masters 50 Masc', 50, 54, 'Homem 50-54 anos', 14),
('cycling', 'Masters 55 Masc', 55, 59, 'Homem 55-59 anos', 15),
('cycling', 'Masters 60 Masc', 60, 64, 'Homem 60-64 anos', 16),
('cycling', 'Masters 65 Masc', 65, 69, 'Homem 65-69 anos', 17),
('cycling', 'Masters 70 Masc', 70, 120, 'Homem 70-120 anos', 18),
('cycling', 'Sub-7 Fem', 5, 6, 'Mulher 5-6 anos', 19),
('cycling', 'Sub-9 Fem', 7, 8, 'Mulher 7-8 anos', 20),
('cycling', 'Sub-11 Fem', 9, 10, 'Mulher 9-10 anos', 21),
('cycling', 'Sub-13 Fem', 11, 12, 'Mulher 11-12 anos', 22),
('cycling', 'Sub-15 Fem', 13, 14, 'Mulher 13-14 anos', 23),
('cycling', 'Sub-17 Fem', 15, 16, 'Mulher 15-16 anos', 24),
('cycling', 'Sub-19 Fem', 17, 18, 'Mulher 17-18 anos', 25),
('cycling', 'Sub-23 Fem', 19, 22, 'Mulher 19-22 anos', 26),
('cycling', 'Elites Fem', 23, 29, 'Mulher 23-29 anos', 27),
('cycling', 'Masters 30 Fem', 30, 34, 'Mulher 30-34 anos', 28),
('cycling', 'Masters 35 Fem', 35, 39, 'Mulher 35-39 anos', 29),
('cycling', 'Masters 40 Fem', 40, 44, 'Mulher 40-44 anos', 30),
('cycling', 'Masters 45 Fem', 45, 49, 'Mulher 45-49 anos', 31),
('cycling', 'Masters 50 Fem', 50, 54, 'Mulher 50-54 anos', 32),
('cycling', 'Masters 55 Fem', 55, 59, 'Mulher 55-59 anos', 33),
('cycling', 'Masters 60 Fem', 60, 120, 'Mulher 60-120 anos', 34);