// Categorias de Eventos Desportivos e Culturais - Sistema Completo

export interface Category {
  id: string;
  name: string;
  type: 'sport' | 'culture';
  subcategories?: Subcategory[];
  ageGroups?: AgeGroup[];
  genderCategories?: GenderCategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  description?: string;
}

export interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  description: string;
}

export interface GenderCategory {
  id: string;
  name: string;
  code: 'M' | 'F' | 'MIXED';
}

// Escalões específicos para Ciclismo (baseado na Federação Portuguesa de Ciclismo)
export const cyclingAgeGroups: AgeGroup[] = [
  { id: 's7-m', name: 'Sub-7 Masc', minAge: 5, maxAge: 6, description: 'Homem 5-6 anos' },
  { id: 's9-m', name: 'Sub-9 Masc', minAge: 7, maxAge: 8, description: 'Homem 7-8 anos' },
  { id: 's11-m', name: 'Sub-11 Masc', minAge: 9, maxAge: 10, description: 'Homem 9-10 anos' },
  { id: 's13-m', name: 'Sub-13 Masc', minAge: 11, maxAge: 12, description: 'Homem 11-12 anos' },
  { id: 's15-m', name: 'Sub-15 Masc', minAge: 13, maxAge: 14, description: 'Homem 13-14 anos' },
  { id: 's17-m', name: 'Sub-17 Masc', minAge: 15, maxAge: 16, description: 'Homem 15-16 anos' },
  { id: 's19-m', name: 'Sub-19 Masc', minAge: 17, maxAge: 18, description: 'Homem 17-18 anos' },
  { id: 's23-m', name: 'Sub-23 Masc', minAge: 19, maxAge: 22, description: 'Homem 19-22 anos' },
  { id: 'elt-m', name: 'Elites Masc', minAge: 23, maxAge: 29, description: 'Homem 23-29 anos' },
  { id: 'm30-m', name: 'Masters 30 Masc', minAge: 30, maxAge: 34, description: 'Homem 30-34 anos' },
  { id: 'm35-m', name: 'Masters 35 Masc', minAge: 35, maxAge: 39, description: 'Homem 35-39 anos' },
  { id: 'm40-m', name: 'Masters 40 Masc', minAge: 40, maxAge: 44, description: 'Homem 40-44 anos' },
  { id: 'm45-m', name: 'Masters 45 Masc', minAge: 45, maxAge: 49, description: 'Homem 45-49 anos' },
  { id: 'm50-m', name: 'Masters 50 Masc', minAge: 50, maxAge: 54, description: 'Homem 50-54 anos' },
  { id: 'm55-m', name: 'Masters 55 Masc', minAge: 55, maxAge: 59, description: 'Homem 55-59 anos' },
  { id: 'm60-m', name: 'Masters 60 Masc', minAge: 60, maxAge: 64, description: 'Homem 60-64 anos' },
  { id: 'm65-m', name: 'Masters 65 Masc', minAge: 65, maxAge: 69, description: 'Homem 65-69 anos' },
  { id: 'm70-m', name: 'Masters 70 Masc', minAge: 70, maxAge: 120, description: 'Homem 70-120 anos' },
  { id: 's7-f', name: 'Sub-7 Fem', minAge: 5, maxAge: 6, description: 'Mulher 5-6 anos' },
  { id: 's9-f', name: 'Sub-9 Fem', minAge: 7, maxAge: 8, description: 'Mulher 7-8 anos' },
  { id: 's11-f', name: 'Sub-11 Fem', minAge: 9, maxAge: 10, description: 'Mulher 9-10 anos' },
  { id: 's13-f', name: 'Sub-13 Fem', minAge: 11, maxAge: 12, description: 'Mulher 11-12 anos' },
  { id: 's15-f', name: 'Sub-15 Fem', minAge: 13, maxAge: 14, description: 'Mulher 13-14 anos' },
  { id: 's17-f', name: 'Sub-17 Fem', minAge: 15, maxAge: 16, description: 'Mulher 15-16 anos' },
  { id: 's19-f', name: 'Sub-19 Fem', minAge: 17, maxAge: 18, description: 'Mulher 17-18 anos' },
  { id: 's23-f', name: 'Sub-23 Fem', minAge: 19, maxAge: 22, description: 'Mulher 19-22 anos' },
  { id: 'elt-f', name: 'Elites Fem', minAge: 23, maxAge: 29, description: 'Mulher 23-29 anos' },
  { id: 'm30-f', name: 'Masters 30 Fem', minAge: 30, maxAge: 34, description: 'Mulher 30-34 anos' },
  { id: 'm35-f', name: 'Masters 35 Fem', minAge: 35, maxAge: 39, description: 'Mulher 35-39 anos' },
  { id: 'm40-f', name: 'Masters 40 Fem', minAge: 40, maxAge: 44, description: 'Mulher 40-44 anos' },
  { id: 'm45-f', name: 'Masters 45 Fem', minAge: 45, maxAge: 49, description: 'Mulher 45-49 anos' },
  { id: 'm50-f', name: 'Masters 50 Fem', minAge: 50, maxAge: 54, description: 'Mulher 50-54 anos' },
  { id: 'm55-f', name: 'Masters 55 Fem', minAge: 55, maxAge: 59, description: 'Mulher 55-59 anos' },
  { id: 'm60-f', name: 'Masters 60 Fem', minAge: 60, maxAge: 120, description: 'Mulher 60-120 anos' }
];

// Escalões Etários Padrão (fallback para modalidades sem escalões específicos)
export const standardAgeGroups: AgeGroup[] = [
  { id: 'infantis', name: 'Infantis', minAge: 6, maxAge: 11, description: '6-11 anos' },
  { id: 'juvenis', name: 'Juvenis', minAge: 12, maxAge: 15, description: '12-15 anos' },
  { id: 'juniores', name: 'Juniores', minAge: 16, maxAge: 19, description: '16-19 anos' },
  { id: 'seniores', name: 'Seniores', minAge: 20, maxAge: 34, description: '20-34 anos' },
  { id: 'veteranos', name: 'Veteranos +35', minAge: 35, maxAge: 999, description: '35+ anos' }
];

// Escalões Etários para Atletismo (baseado na FPA)
export const athleticsAgeGroups: AgeGroup[] = [
  { id: 'cangurus', name: 'Cangurus', minAge: 3, maxAge: 5, description: '3-5 anos' },
  { id: 'gato-monteses', name: 'Gato-Monteses', minAge: 6, maxAge: 7, description: '6-7 anos' },
  { id: 'benjamins-a', name: 'Benjamins A', minAge: 8, maxAge: 9, description: '8-9 anos' },
  { id: 'benjamins-b', name: 'Benjamins B', minAge: 10, maxAge: 11, description: '10-11 anos' },
  { id: 'infantis', name: 'Infantis', minAge: 12, maxAge: 13, description: '12-13 anos' },
  { id: 'iniciados', name: 'Iniciados', minAge: 14, maxAge: 15, description: '14-15 anos' },
  { id: 'juvenis', name: 'Juvenis', minAge: 16, maxAge: 17, description: '16-17 anos' },
  { id: 'juniores', name: 'Juniores', minAge: 18, maxAge: 19, description: '18-19 anos' },
  { id: 'sub23', name: 'Sub-23', minAge: 20, maxAge: 22, description: '20-22 anos' },
  { id: 'seniores', name: 'Seniores', minAge: 23, maxAge: 34, description: '23-34 anos' },
  { id: 'veteranos-35', name: 'Veteranos M35/F35', minAge: 35, maxAge: 39, description: '35-39 anos' },
  { id: 'veteranos-40', name: 'Veteranos M40/F40', minAge: 40, maxAge: 44, description: '40-44 anos' },
  { id: 'veteranos-45', name: 'Veteranos M45/F45', minAge: 45, maxAge: 49, description: '45-49 anos' },
  { id: 'veteranos-50', name: 'Veteranos M50/F50', minAge: 50, maxAge: 54, description: '50-54 anos' },
  { id: 'veteranos-55', name: 'Veteranos M55/F55', minAge: 55, maxAge: 59, description: '55-59 anos' },
  { id: 'veteranos-60', name: 'Veteranos M60/F60', minAge: 60, maxAge: 64, description: '60-64 anos' },
  { id: 'veteranos-65', name: 'Veteranos M65/F65', minAge: 65, maxAge: 69, description: '65-69 anos' },
  { id: 'veteranos-70', name: 'Veteranos M70/F70', minAge: 70, maxAge: 999, description: '70+ anos' }
];

// Escalões Etários para Futebol (baseado na FPF)
export const footballAgeGroups: AgeGroup[] = [
  { id: 'petizes', name: 'Petizes', minAge: 5, maxAge: 6, description: '5-6 anos' },
  { id: 'traquinas', name: 'Traquinas', minAge: 7, maxAge: 8, description: '7-8 anos' },
  { id: 'benjamins', name: 'Benjamins', minAge: 9, maxAge: 10, description: '9-10 anos' },
  { id: 'infantis', name: 'Infantis', minAge: 11, maxAge: 12, description: '11-12 anos' },
  { id: 'iniciados', name: 'Iniciados', minAge: 13, maxAge: 14, description: '13-14 anos' },
  { id: 'juvenis', name: 'Juvenis', minAge: 15, maxAge: 16, description: '15-16 anos' },
  { id: 'juniores', name: 'Juniores', minAge: 17, maxAge: 18, description: '17-18 anos' },
  { id: 'sub23', name: 'Sub-23', minAge: 19, maxAge: 22, description: '19-22 anos' },
  { id: 'seniores', name: 'Seniores', minAge: 23, maxAge: 34, description: '23-34 anos' },
  { id: 'veteranos', name: 'Veteranos +35', minAge: 35, maxAge: 999, description: '35+ anos' }
];

// Escalões Etários para Natação (baseado na FPN)
export const swimmingAgeGroups: AgeGroup[] = [
  { id: 'escolas-6', name: 'Escolas 6 anos', minAge: 6, maxAge: 6, description: '6 anos' },
  { id: 'escolas-7', name: 'Escolas 7 anos', minAge: 7, maxAge: 7, description: '7 anos' },
  { id: 'escolas-8', name: 'Escolas 8 anos', minAge: 8, maxAge: 8, description: '8 anos' },
  { id: 'escolas-9', name: 'Escolas 9 anos', minAge: 9, maxAge: 9, description: '9 anos' },
  { id: 'escolas-10', name: 'Escolas 10 anos', minAge: 10, maxAge: 10, description: '10 anos' },
  { id: 'infantis-a', name: 'Infantis A', minAge: 11, maxAge: 12, description: '11-12 anos' },
  { id: 'infantis-b', name: 'Infantis B', minAge: 13, maxAge: 14, description: '13-14 anos' },
  { id: 'cadetes', name: 'Cadetes', minAge: 15, maxAge: 16, description: '15-16 anos' },
  { id: 'juniores', name: 'Juniores', minAge: 17, maxAge: 18, description: '17-18 anos' },
  { id: 'seniores', name: 'Seniores', minAge: 19, maxAge: 24, description: '19-24 anos' },
  { id: 'masters-25', name: 'Masters 25-29', minAge: 25, maxAge: 29, description: '25-29 anos' },
  { id: 'masters-30', name: 'Masters 30-34', minAge: 30, maxAge: 34, description: '30-34 anos' },
  { id: 'masters-35', name: 'Masters 35-39', minAge: 35, maxAge: 39, description: '35-39 anos' },
  { id: 'masters-40', name: 'Masters 40-44', minAge: 40, maxAge: 44, description: '40-44 anos' },
  { id: 'masters-45', name: 'Masters 45-49', minAge: 45, maxAge: 49, description: '45-49 anos' },
  { id: 'masters-50', name: 'Masters 50+', minAge: 50, maxAge: 999, description: '50+ anos' }
];

// Escalões Etários para Basquetebol (baseado na FPB)
export const basketballAgeGroups: AgeGroup[] = [
  { id: 'minis', name: 'Minis', minAge: 5, maxAge: 8, description: '5-8 anos' },
  { id: 'infantis', name: 'Infantis', minAge: 9, maxAge: 10, description: '9-10 anos' },
  { id: 'sub12', name: 'Sub-12', minAge: 11, maxAge: 12, description: '11-12 anos' },
  { id: 'sub14', name: 'Sub-14', minAge: 13, maxAge: 14, description: '13-14 anos' },
  { id: 'sub16', name: 'Sub-16', minAge: 15, maxAge: 16, description: '15-16 anos' },
  { id: 'sub18', name: 'Sub-18', minAge: 17, maxAge: 18, description: '17-18 anos' },
  { id: 'sub20', name: 'Sub-20', minAge: 19, maxAge: 20, description: '19-20 anos' },
  { id: 'seniores', name: 'Seniores', minAge: 21, maxAge: 999, description: '21+ anos' }
];

// Escalões Etários para Andebol (baseado na FAP)
export const handballAgeGroups: AgeGroup[] = [
  { id: 'minis', name: 'Minis', minAge: 5, maxAge: 8, description: '5-8 anos' },
  { id: 'infantis', name: 'Infantis', minAge: 9, maxAge: 10, description: '9-10 anos' },
  { id: 'iniciados', name: 'Iniciados', minAge: 11, maxAge: 12, description: '11-12 anos' },
  { id: 'juvenis', name: 'Juvenis', minAge: 13, maxAge: 14, description: '13-14 anos' },
  { id: 'cadetes', name: 'Cadetes', minAge: 15, maxAge: 16, description: '15-16 anos' },
  { id: 'juniores', name: 'Juniores', minAge: 17, maxAge: 18, description: '17-18 anos' },
  { id: 'seniores', name: 'Seniores', minAge: 19, maxAge: 999, description: '19+ anos' }
];

// Escalões Etários para Voleibol (baseado na FPV)
export const volleyballAgeGroups: AgeGroup[] = [
  { id: 'minis', name: 'Minis', minAge: 6, maxAge: 9, description: '6-9 anos' },
  { id: 'infantis', name: 'Infantis', minAge: 10, maxAge: 11, description: '10-11 anos' },
  { id: 'iniciados', name: 'Iniciados', minAge: 12, maxAge: 13, description: '12-13 anos' },
  { id: 'juvenis', name: 'Juvenis', minAge: 14, maxAge: 15, description: '14-15 anos' },
  { id: 'cadetes', name: 'Cadetes', minAge: 16, maxAge: 17, description: '16-17 anos' },
  { id: 'juniores', name: 'Juniores', minAge: 18, maxAge: 19, description: '18-19 anos' },
  { id: 'seniores', name: 'Seniores', minAge: 20, maxAge: 999, description: '20+ anos' }
];

// Escalões Etários para Ténis (baseado na FPT)
export const tennisAgeGroups: AgeGroup[] = [
  { id: 'pre-tenis', name: 'Pré-Ténis', minAge: 4, maxAge: 6, description: '4-6 anos' },
  { id: 'tenis-10s', name: 'Ténis 10s', minAge: 7, maxAge: 10, description: '7-10 anos' },
  { id: 'sub12', name: 'Sub-12', minAge: 11, maxAge: 12, description: '11-12 anos' },
  { id: 'sub14', name: 'Sub-14', minAge: 13, maxAge: 14, description: '13-14 anos' },
  { id: 'sub16', name: 'Sub-16', minAge: 15, maxAge: 16, description: '15-16 anos' },
  { id: 'sub18', name: 'Sub-18', minAge: 17, maxAge: 18, description: '17-18 anos' },
  { id: 'seniores', name: 'Seniores', minAge: 19, maxAge: 34, description: '19-34 anos' },
  { id: 'veteranos-35', name: 'Veteranos +35', minAge: 35, maxAge: 44, description: '35-44 anos' },
  { id: 'veteranos-45', name: 'Veteranos +45', minAge: 45, maxAge: 54, description: '45-54 anos' },
  { id: 'veteranos-55', name: 'Veteranos +55', minAge: 55, maxAge: 999, description: '55+ anos' }
];

// Escalões Etários para Ginástica
export const gymnasticsAgeGroups: AgeGroup[] = [
  { id: 'pre-competicao', name: 'Pré-Competição', minAge: 4, maxAge: 6, description: '4-6 anos' },
  { id: 'infantis', name: 'Infantis', minAge: 7, maxAge: 9, description: '7-9 anos' },
  { id: 'juvenis', name: 'Juvenis', minAge: 10, maxAge: 12, description: '10-12 anos' },
  { id: 'cadetes', name: 'Cadetes', minAge: 13, maxAge: 15, description: '13-15 anos' },
  { id: 'juniores', name: 'Juniores', minAge: 16, maxAge: 18, description: '16-18 anos' },
  { id: 'seniores', name: 'Seniores', minAge: 19, maxAge: 999, description: '19+ anos' }
];

// Categorias de Género
export const genderCategories: GenderCategory[] = [
  { id: 'masculino', name: 'Masculino', code: 'M' },
  { id: 'feminino', name: 'Feminino', code: 'F' },
  { id: 'misto', name: 'Misto', code: 'MIXED' }
];

// CATEGORIAS DESPORTIVAS
export const sportCategories: Category[] = [
  {
    id: 'atletismo',
    name: 'Atletismo',
    type: 'sport',
    ageGroups: athleticsAgeGroups,
    genderCategories,
    subcategories: [
      { id: 'pista', name: 'Pista', description: 'Corridas em pista (100m, 200m, 400m, 800m, 1500m, 5000m, 10000m)' },
      { id: 'estrada', name: 'Estrada', description: 'Corridas de estrada (5km, 10km, meia maratona, maratona)' },
      { id: 'marcha', name: 'Marcha Atlética', description: 'Provas de marcha atlética' },
      { id: 'saltos', name: 'Saltos', description: 'Salto em altura, comprimento, triplo, vara' },
      { id: 'lancamentos', name: 'Lançamentos', description: 'Peso, disco, martelo, dardo' },
      { id: 'combinadas', name: 'Provas Combinadas', description: 'Heptathlon, decathlon' },
      { id: 'trail', name: 'Trail Running', description: 'Corridas na natureza e montanha' },
      { id: 'cross', name: 'Corta-Mato', description: 'Cross country' }
    ]
  },
  {
    id: 'futebol',
    name: 'Futebol',
    type: 'sport',
    ageGroups: footballAgeGroups,
    genderCategories,
    subcategories: [
      { id: 'futebol-11', name: 'Futebol 11', description: 'Futebol tradicional com 11 jogadores' },
      { id: 'futebol-7', name: 'Futebol 7', description: 'Variante com 7 jogadores por equipa' },
      { id: 'futsal', name: 'Futsal', description: 'Futebol de salão' },
      { id: 'futebol-praia', name: 'Futebol de Praia', description: 'Futebol praticado na areia' }
    ]
  },
  {
    id: 'natacao',
    name: 'Natação',
    type: 'sport',
    ageGroups: swimmingAgeGroups,
    genderCategories,
    subcategories: [
      { id: 'piscina', name: 'Natação Pura', description: 'Provas em piscina (livre, costas, bruços, mariposa)' },
      { id: 'aguas-abertas', name: 'Águas Abertas', description: 'Natação em mar, lagos e rios' },
      { id: 'polo-aquatico', name: 'Polo Aquático', description: 'Desporto coletivo aquático' },
      { id: 'natacao-sincronizada', name: 'Natação Sincronizada', description: 'Natação artística' },
      { id: 'masters', name: 'Masters', description: 'Natação para veteranos' }
    ]
  },
  {
    id: 'ciclismo',
    name: 'Ciclismo',
    type: 'sport',
    ageGroups: cyclingAgeGroups,
    genderCategories,
    subcategories: [
      { id: 'estrada', name: 'Estrada', description: 'Ciclismo em estrada' },
      { id: 'pista', name: 'Pista', description: 'Ciclismo em velódromo' },
      { id: 'mountain-bike', name: 'BTT/Mountain Bike', description: 'Ciclismo todo-o-terreno' },
      { id: 'bmx', name: 'BMX', description: 'Bicycle Motocross' },
      { id: 'ciclocrosse', name: 'Ciclocrosse', description: 'Ciclismo cross country' }
    ]
  },
  {
    id: 'basquetebol',
    name: 'Basquetebol',
    type: 'sport',
    ageGroups: basketballAgeGroups,
    genderCategories,
    subcategories: [
      { id: 'basquetebol-5x5', name: 'Basquetebol 5x5', description: 'Basquetebol tradicional' },
      { id: 'basquetebol-3x3', name: 'Basquetebol 3x3', description: 'Variante olímpica com 3 jogadores' },
      { id: 'streetball', name: 'Streetball', description: 'Basquetebol urbano' }
    ]
  },
  {
    id: 'andebol',
    name: 'Andebol',
    type: 'sport',
    ageGroups: handballAgeGroups,
    genderCategories,
    subcategories: [
      { id: 'andebol-11', name: 'Andebol 11', description: 'Andebol de campo com 11 jogadores' },
      { id: 'andebol-7', name: 'Andebol 7', description: 'Andebol de pavilhão com 7 jogadores' },
      { id: 'andebol-praia', name: 'Andebol de Praia', description: 'Andebol praticado na areia' }
    ]
  },
  {
    id: 'voleibol',
    name: 'Voleibol',
    type: 'sport',
    ageGroups: volleyballAgeGroups,
    genderCategories,
    subcategories: [
      { id: 'voleibol-indoor', name: 'Voleibol Indoor', description: 'Voleibol em pavilhão' },
      { id: 'voleibol-praia', name: 'Voleibol de Praia', description: 'Beach volleyball' },
      { id: 'voleibol-sentado', name: 'Voleibol Sentado', description: 'Modalidade paraolímpica' }
    ]
  },
  {
    id: 'tenis',
    name: 'Ténis',
    type: 'sport',
    ageGroups: tennisAgeGroups,
    genderCategories,
    subcategories: [
      { id: 'singulares', name: 'Singulares', description: 'Jogos individuais' },
      { id: 'pares', name: 'Pares', description: 'Jogos de pares' },
      { id: 'pares-mistos', name: 'Pares Mistos', description: 'Pares masculino/feminino' }
    ]
  },
  {
    id: 'artes-marciais',
    name: 'Artes Marciais',
    type: 'sport',
    ageGroups: gymnasticsAgeGroups, // Similar age structure
    genderCategories,
    subcategories: [
      { id: 'judo', name: 'Judo', description: 'Arte marcial japonesa' },
      { id: 'karate', name: 'Karaté', description: 'Arte marcial de origem japonesa' },
      { id: 'taekwondo', name: 'Taekwondo', description: 'Arte marcial coreana' },
      { id: 'boxe', name: 'Boxe', description: 'Desporto de combate' },
      { id: 'kickboxing', name: 'Kickboxing', description: 'Combinação de boxe e artes marciais' },
      { id: 'mma', name: 'MMA', description: 'Artes marciais mistas' },
      { id: 'aikido', name: 'Aikido', description: 'Arte marcial japonesa defensiva' }
    ]
  },
  {
    id: 'ginastica',
    name: 'Ginástica',
    type: 'sport',
    ageGroups: gymnasticsAgeGroups,
    genderCategories,
    subcategories: [
      { id: 'artistica', name: 'Ginástica Artística', description: 'Aparelhos e solo' },
      { id: 'ritmica', name: 'Ginástica Rítmica', description: 'Com música e aparelhos' },
      { id: 'trampolins', name: 'Trampolins', description: 'Ginástica de trampolins' },
      { id: 'aerobica', name: 'Ginástica Aeróbica', description: 'Ginástica de competição aeróbica' }
    ]
  },
  {
    id: 'desportos-aquaticos',
    name: 'Desportos Aquáticos',
    type: 'sport',
    ageGroups: swimmingAgeGroups, // Use similar age structure as swimming
    genderCategories,
    subcategories: [
      { id: 'surf', name: 'Surf', description: 'Desporto de ondas' },
      { id: 'bodyboard', name: 'Bodyboard', description: 'Modalidade de ondas deitado' },
      { id: 'windsurf', name: 'Windsurf', description: 'Vela com prancha' },
      { id: 'kitesurf', name: 'Kitesurf', description: 'Pipa com prancha' },
      { id: 'stand-up-paddle', name: 'Stand Up Paddle', description: 'Remo em pé na prancha' },
      { id: 'vela', name: 'Vela', description: 'Navegação à vela' },
      { id: 'remo', name: 'Remo', description: 'Desporto de remo' },
      { id: 'canoagem', name: 'Canoagem', description: 'Desporto de canoa e caiaque' }
    ]
  },
  {
    id: 'desportos-motorizados',
    name: 'Desportos Motorizados',
    type: 'sport',
    ageGroups: [
      { id: 'juvenil-motorizado', name: 'Juvenil', minAge: 16, maxAge: 20, description: '16-20 anos' },
      { id: 'senior-motorizado', name: 'Sénior', minAge: 21, maxAge: 39, description: '21-39 anos' },
      { id: 'veterano-motorizado', name: 'Veterano', minAge: 40, maxAge: 999, description: '40+ anos' }
    ],
    genderCategories,
    subcategories: [
      { id: 'automobilismo', name: 'Automobilismo', description: 'Corridas de automóveis' },
      { id: 'motociclismo', name: 'Motociclismo', description: 'Corridas de motociclos' },
      { id: 'karting', name: 'Karting', description: 'Corridas de kart' },
      { id: 'rally', name: 'Rali', description: 'Provas de velocidade e regularidade' },
      { id: 'motocross', name: 'Motocross', description: 'Motociclismo todo-o-terreno' }
    ]
  }
];

// CATEGORIAS CULTURAIS
export const culturalCategories: Category[] = [
  {
    id: 'musica',
    name: 'Música',
    type: 'culture',
    subcategories: [
      { id: 'concerto', name: 'Concertos', description: 'Apresentações musicais ao vivo' },
      { id: 'festival-musica', name: 'Festivais de Música', description: 'Eventos musicais com múltiplos artistas' },
      { id: 'recital', name: 'Recitais', description: 'Apresentações solo ou pequenos grupos' },
      { id: 'opera', name: 'Ópera', description: 'Espetáculos de ópera' },
      { id: 'musical', name: 'Musicais', description: 'Teatro musical' },
      { id: 'fado', name: 'Fado', description: 'Música tradicional portuguesa' },
      { id: 'folclore', name: 'Folclore', description: 'Música popular tradicional' },
      { id: 'jazz', name: 'Jazz', description: 'Eventos de jazz' },
      { id: 'rock-pop', name: 'Rock/Pop', description: 'Música popular contemporânea' },
      { id: 'classica', name: 'Música Clássica', description: 'Música erudita' },
      { id: 'eletronica', name: 'Música Eletrónica', description: 'DJ sets e música eletrónica' }
    ]
  },
  {
    id: 'teatro',
    name: 'Teatro',
    type: 'culture',
    subcategories: [
      { id: 'drama', name: 'Drama', description: 'Peças dramáticas' },
      { id: 'comedia', name: 'Comédia', description: 'Espetáculos humorísticos' },
      { id: 'monologo', name: 'Monólogo', description: 'Apresentações individuais' },
      { id: 'teatro-infantil', name: 'Teatro Infantil', description: 'Espetáculos para crianças' },
      { id: 'teatro-experimental', name: 'Teatro Experimental', description: 'Teatro contemporâneo e vanguarda' },
      { id: 'stand-up', name: 'Stand-up Comedy', description: 'Comédia em pé' },
      { id: 'improviso', name: 'Teatro de Improviso', description: 'Espetáculos improvisados' },
      { id: 'teatro-musical', name: 'Teatro Musical', description: 'Combinação de teatro, música e dança' }
    ]
  },
  {
    id: 'danca',
    name: 'Dança',
    type: 'culture',
    subcategories: [
      { id: 'ballet', name: 'Ballet', description: 'Dança clássica' },
      { id: 'contemporanea', name: 'Dança Contemporânea', description: 'Dança moderna e contemporânea' },
      { id: 'folclorica', name: 'Dança Folclórica', description: 'Danças tradicionais portuguesas' },
      { id: 'flamenco', name: 'Flamenco', description: 'Dança espanhola tradicional' },
      { id: 'hip-hop', name: 'Hip-Hop', description: 'Dança urbana' },
      { id: 'ballroom', name: 'Danças de Salão', description: 'Vals, tango, salsa, bachata' },
      { id: 'jazz-dance', name: 'Jazz Dance', description: 'Dança de jazz' },
      { id: 'tap', name: 'Sapateado', description: 'Tap dance' },
      { id: 'danca-do-ventre', name: 'Dança do Ventre', description: 'Dança oriental' }
    ]
  },
  {
    id: 'artes-visuais',
    name: 'Artes Visuais',
    type: 'culture',
    subcategories: [
      { id: 'exposicao-pintura', name: 'Exposições de Pintura', description: 'Mostras de arte pictórica' },
      { id: 'exposicao-escultura', name: 'Exposições de Escultura', description: 'Arte tridimensional' },
      { id: 'fotografia', name: 'Exposições de Fotografia', description: 'Arte fotográfica' },
      { id: 'instalacao', name: 'Instalações Artísticas', description: 'Arte conceptual e instalações' },
      { id: 'arte-digital', name: 'Arte Digital', description: 'Arte criada digitalmente' },
      { id: 'ceramica', name: 'Cerâmica e Olaria', description: 'Arte em barro e cerâmica' },
      { id: 'gravura', name: 'Gravura e Serigrafia', description: 'Artes gráficas' },
      { id: 'street-art', name: 'Arte Urbana', description: 'Graffiti e arte de rua' }
    ]
  },
  {
    id: 'literatura',
    name: 'Literatura',
    type: 'culture',
    subcategories: [
      { id: 'apresentacao-livro', name: 'Apresentação de Livros', description: 'Lançamentos literários' },
      { id: 'sarau', name: 'Saraus Literários', description: 'Encontros de literatura' },
      { id: 'concurso-poesia', name: 'Concursos de Poesia', description: 'Competições poéticas' },
      { id: 'leitura-publica', name: 'Leituras Públicas', description: 'Performances de leitura' },
      { id: 'oficina-escrita', name: 'Oficinas de Escrita', description: 'Workshops de escrita criativa' },
      { id: 'club-leitura', name: 'Clubes de Leitura', description: 'Discussões sobre livros' },
      { id: 'feira-livro', name: 'Feiras do Livro', description: 'Eventos comerciais literários' }
    ]
  },
  {
    id: 'cinema',
    name: 'Cinema e Audiovisual',
    type: 'culture',
    subcategories: [
      { id: 'festival-cinema', name: 'Festivais de Cinema', description: 'Mostras cinematográficas' },
      { id: 'estreia', name: 'Estreias de Filmes', description: 'Primeiras exibições' },
      { id: 'documentario', name: 'Documentários', description: 'Cinema documental' },
      { id: 'curtas', name: 'Curtas-metragens', description: 'Filmes de curta duração' },
      { id: 'cinema-ar-livre', name: 'Cinema ao Ar Livre', description: 'Sessões exteriores' },
      { id: 'debate-cinema', name: 'Debates Cinematográficos', description: 'Discussões sobre cinema' },
      { id: 'masterclass-cinema', name: 'Masterclasses de Cinema', description: 'Workshops especializados' }
    ]
  },
  {
    id: 'gastronomia',
    name: 'Gastronomia',
    type: 'culture',
    subcategories: [
      { id: 'festival-gastronomico', name: 'Festivais Gastronómicos', description: 'Celebrações culinárias' },
      { id: 'degustacao', name: 'Degustações', description: 'Provas de vinhos e comidas' },
      { id: 'workshop-culinario', name: 'Workshops Culinários', description: 'Aulas de cozinha' },
      { id: 'jantar-tematico', name: 'Jantares Temáticos', description: 'Experiências gastronómicas' },
      { id: 'mercado-gastronomico', name: 'Mercados Gastronómicos', description: 'Feiras de comida' },
      { id: 'concurso-culinario', name: 'Concursos Culinários', description: 'Competições gastronómicas' }
    ]
  },
  {
    id: 'patrimonio',
    name: 'Património e História',
    type: 'culture',
    subcategories: [
      { id: 'visita-guiada', name: 'Visitas Guiadas', description: 'Tours patrimoniais' },
      { id: 'conferencia-historia', name: 'Conferências de História', description: 'Palestras históricas' },
      { id: 'reconstituicao', name: 'Reconstituições Históricas', description: 'Eventos de época' },
      { id: 'museu', name: 'Eventos em Museus', description: 'Atividades museológicas' },
      { id: 'arqueologia', name: 'Arqueologia', description: 'Descobertas arqueológicas' },
      { id: 'festa-medieval', name: 'Festas Medievais', description: 'Eventos de época medieval' }
    ]
  },
  {
    id: 'workshops-formacao',
    name: 'Workshops e Formação',
    type: 'culture',
    subcategories: [
      { id: 'masterclass', name: 'Masterclasses', description: 'Aulas com especialistas' },
      { id: 'oficina-arte', name: 'Oficinas de Arte', description: 'Workshops criativos' },
      { id: 'curso-intensivo', name: 'Cursos Intensivos', description: 'Formação concentrada' },
      { id: 'seminario', name: 'Seminários', description: 'Eventos formativos' },
      { id: 'palestra', name: 'Palestras', description: 'Apresentações educativas' },
      { id: 'mesa-redonda', name: 'Mesas Redondas', description: 'Debates temáticos' }
    ]
  }
];

// Função para obter todas as categorias
export const getAllCategories = (): Category[] => {
  return [...sportCategories, ...culturalCategories];
};

// Função para obter categorias por tipo
export const getCategoriesByType = (type: 'sport' | 'culture'): Category[] => {
  return type === 'sport' ? sportCategories : culturalCategories;
};

// Função para obter categoria por ID - com matching flexível
export const getCategoryById = (categoryId: string): Category | undefined => {
  if (!categoryId) return undefined;
  
  // Normalize the category ID to lowercase for matching
  const normalizedId = categoryId.toLowerCase();
  
  // Create a map for better matching
  const categoryMap: { [key: string]: string } = {
    'ciclismo': 'ciclismo',
    'btt': 'ciclismo',
    'atletismo': 'atletismo',
    'corrida': 'atletismo',
    'musica': 'musica',
    'música': 'musica',
    'fado': 'musica',
    'festival': 'musica',
    'futebol': 'futebol',
    'natacao': 'natacao',
    'natação': 'natacao',
    'basquetebol': 'basquetebol',
    'andebol': 'andebol',
    'voleibol': 'voleibol',
    'tenis': 'tenis',
    'ténis': 'tenis',
  };

  const allCategories = getAllCategories();

  // Try to find exact match first
  let foundCategory = allCategories.find(cat => cat.id === normalizedId);
  
  // If not found, try mapped categories
  if (!foundCategory && categoryMap[normalizedId]) {
    foundCategory = allCategories.find(cat => cat.id === categoryMap[normalizedId]);
  }
  
  // If still not found, try partial matching
  if (!foundCategory) {
    foundCategory = allCategories.find(cat => 
      cat.name.toLowerCase().includes(normalizedId) || 
      normalizedId.includes(cat.name.toLowerCase())
    );
  }

  return foundCategory;
};

// Função para obter subcategoria por ID
export const getSubcategoryById = (categoryId: string, subcategoryId: string): Subcategory | undefined => {
  const category = getCategoryById(categoryId);
  return category?.subcategories?.find(sub => sub.id === subcategoryId);
};