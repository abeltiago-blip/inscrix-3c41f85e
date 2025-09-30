-- Add some example age groups with subcategories for testing
INSERT INTO public.age_groups (category_id, subcategory, name, min_age, max_age, description, is_active, sort_order) VALUES 
('ciclismo', 'Masculino', 'Sub-15 Masculino', 13, 14, 'Escalão masculino 13-14 anos', true, 1),
('ciclismo', 'Masculino', 'Sub-17 Masculino', 15, 16, 'Escalão masculino 15-16 anos', true, 2),
('ciclismo', 'Feminino', 'Sub-15 Feminino', 13, 14, 'Escalão feminino 13-14 anos', true, 3),
('ciclismo', 'Feminino', 'Sub-17 Feminino', 15, 16, 'Escalão feminino 15-16 anos', true, 4),
('atletismo', 'Masculino', 'Sub-20 Masculino', 18, 19, 'Escalão masculino 18-19 anos', true, 1),
('atletismo', 'Feminino', 'Sub-20 Feminino', 18, 19, 'Escalão feminino 18-19 anos', true, 2),
('natacao', 'Masculino', 'Juniores Masculino', 17, 18, 'Escalão masculino 17-18 anos', true, 1),
('natacao', 'Feminino', 'Juniores Feminino', 17, 18, 'Escalão feminino 17-18 anos', true, 2);