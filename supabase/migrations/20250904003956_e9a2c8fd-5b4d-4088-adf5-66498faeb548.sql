-- Inserir escalões para atletismo
INSERT INTO public.age_groups (category_id, name, min_age, max_age, description, sort_order) VALUES
('athletics', 'Cangurus', 3, 5, '3-5 anos', 1),
('athletics', 'Gato-Monteses', 6, 7, '6-7 anos', 2),
('athletics', 'Benjamins A', 8, 9, '8-9 anos', 3),
('athletics', 'Benjamins B', 10, 11, '10-11 anos', 4),
('athletics', 'Infantis', 12, 13, '12-13 anos', 5),
('athletics', 'Iniciados', 14, 15, '14-15 anos', 6),
('athletics', 'Juvenis', 16, 17, '16-17 anos', 7),
('athletics', 'Juniores', 18, 19, '18-19 anos', 8),
('athletics', 'Sub-23', 20, 22, '20-22 anos', 9),
('athletics', 'Seniores', 23, 34, '23-34 anos', 10),
('athletics', 'Veteranos M35/F35', 35, 39, '35-39 anos', 11),
('athletics', 'Veteranos M40/F40', 40, 44, '40-44 anos', 12),
('athletics', 'Veteranos M45/F45', 45, 49, '45-49 anos', 13),
('athletics', 'Veteranos M50/F50', 50, 54, '50-54 anos', 14),
('athletics', 'Veteranos M55/F55', 55, 59, '55-59 anos', 15),
('athletics', 'Veteranos M60/F60', 60, 64, '60-64 anos', 16),
('athletics', 'Veteranos M65/F65', 65, 69, '65-69 anos', 17),
('athletics', 'Veteranos M70/F70', 70, 999, '70+ anos', 18);

-- Inserir escalões para futebol
INSERT INTO public.age_groups (category_id, name, min_age, max_age, description, sort_order) VALUES
('football', 'Petizes', 5, 6, '5-6 anos', 1),
('football', 'Traquinas', 7, 8, '7-8 anos', 2),
('football', 'Benjamins', 9, 10, '9-10 anos', 3),
('football', 'Infantis', 11, 12, '11-12 anos', 4),
('football', 'Iniciados', 13, 14, '13-14 anos', 5),
('football', 'Juvenis', 15, 16, '15-16 anos', 6),
('football', 'Juniores', 17, 18, '17-18 anos', 7),
('football', 'Sub-23', 19, 22, '19-22 anos', 8),
('football', 'Seniores', 23, 34, '23-34 anos', 9),
('football', 'Veteranos +35', 35, 999, '35+ anos', 10);

-- Inserir escalões para basquetebol
INSERT INTO public.age_groups (category_id, name, min_age, max_age, description, sort_order) VALUES
('basketball', 'Minis', 5, 8, '5-8 anos', 1),
('basketball', 'Infantis', 9, 10, '9-10 anos', 2),
('basketball', 'Sub-12', 11, 12, '11-12 anos', 3),
('basketball', 'Sub-14', 13, 14, '13-14 anos', 4),
('basketball', 'Sub-16', 15, 16, '15-16 anos', 5),
('basketball', 'Sub-18', 17, 18, '17-18 anos', 6),
('basketball', 'Sub-20', 19, 20, '19-20 anos', 7),
('basketball', 'Seniores', 21, 999, '21+ anos', 8);