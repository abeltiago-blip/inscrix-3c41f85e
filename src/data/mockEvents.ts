import { getAllCategories, getCategoryById } from './eventCategories';

export interface MockEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_start: string;
  registration_end: string;
  location: string;
  address: string;
  category: string;
  subcategory: string;
  event_type: 'sports' | 'cultural';
  max_participants: number;
  min_age?: number;
  max_age?: number;
  requires_medical_certificate: boolean;
  organizer_notes: string;
  status: 'published';
  featured: boolean;
  organizer_id: string;
  participants: number;
  price: number;
  images: string[];
}

export interface MockTicketType {
  id: string;
  event_id: string;
  name: string;
  description: string;
  price: number;
  early_bird_price?: number;
  early_bird_end_date?: string;
  currency: string;
  max_quantity: number;
  includes_tshirt: boolean;
  includes_kit: boolean;
  includes_meal: boolean;
  includes_insurance: boolean;
  age_group: string;
  gender_restriction: string;
  is_active: boolean;
  sort_order: number;
}

// Eventos Desportivos
export const mockSportEvents: MockEvent[] = [
  {
    id: "sport-marathon-2024",
    title: "Maratona de Lisboa 2026",
    description: "A maior corrida da capital portuguesa. Percurso histórico pelas ruas de Lisboa, passando pelos principais monumentos e zonas icónicas da cidade. Uma experiência única para corredores de todos os níveis.",
    start_date: "2026-04-15T08:00:00Z",
    end_date: "2026-04-15T14:00:00Z",
    registration_start: "2024-11-01T00:00:00Z",
    registration_end: "2026-04-01T23:59:59Z",
    location: "Lisboa",
    address: "Marquês de Pombal, 1069-010 Lisboa",
    category: "atletismo",
    subcategory: "estrada",
    event_type: "sports",
    max_participants: 5000,
    min_age: 18,
    requires_medical_certificate: true,
    organizer_notes: "Evento sujeito a condições meteorológicas. Obrigatório atestado médico para participação.",
    status: "published",
    featured: true,
    organizer_id: "org-1",
    participants: 3250,
    price: 25,
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "sport-football-tournament",
    title: "Torneio de Futebol Amador",
    description: "Campeonato regional aberto a todas as equipas amadoras da região. Sistema de eliminatórias com final no estádio municipal. Premiação para os três primeiros lugares.",
    start_date: "2026-05-25T14:00:00Z",
    end_date: "2026-05-25T18:00:00Z",
    registration_start: "2024-11-01T00:00:00Z",
    registration_end: "2026-05-15T23:59:59Z",
    location: "Cascais",
    address: "Estádio Municipal de Cascais, Av. Pedro Álvares Cabral, 2750 Cascais",
    category: "futebol",
    subcategory: "futebol-11",
    event_type: "sports",
    max_participants: 32,
    min_age: 16,
    max_age: 45,
    requires_medical_certificate: true,
    organizer_notes: "Cada equipa deve ter seguro desportivo válido. Arbitragem oficial garantida.",
    status: "published",
    featured: true,
    organizer_id: "org-2",
    participants: 16,
    price: 0,
    images: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "sport-cycling-tour",
    title: "Grande Volta de BTT Serra da Estrela",
    description: "Percurso desafiante pela maior cordilheira de Portugal Continental. 80km de pura adrenalina entre paisagens deslumbrantes e trilhos técnicos.",
    start_date: "2026-06-10T09:00:00Z",
    end_date: "2026-06-10T16:00:00Z",
    registration_start: "2024-11-01T00:00:00Z",
    registration_end: "2026-06-05T23:59:59Z",
    location: "Covilhã",
    address: "Centro da Cidade, 6200-151 Covilhã",
    category: "ciclismo",
    subcategory: "mountain-bike",
    event_type: "sports",
    max_participants: 200,
    min_age: 16,
    requires_medical_certificate: true,
    organizer_notes: "Equipamento de segurança obrigatório: capacete, luvas e proteções. Apoio mecânico disponível.",
    status: "published",
    featured: true,
    organizer_id: "org-3",
    participants: 145,
    price: 35,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5c?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "sport-swimming-masters",
    title: "Torneio Masters de Natação",
    description: "Competição de natação para veteranos. Provas em todas as técnicas e distâncias. Ambiente amigável e competitivo.",
    start_date: "2026-07-20T10:00:00Z",
    end_date: "2026-07-20T17:00:00Z",
    registration_start: "2026-05-15T00:00:00Z",
    registration_end: "2026-07-10T23:59:59Z",
    location: "Porto",
    address: "Piscinas Municipais do Porto, Rua do Campo Alegre 1021, 4150 Porto",
    category: "natacao",
    subcategory: "masters",
    event_type: "sports",
    max_participants: 150,
    min_age: 25,
    requires_medical_certificate: true,
    organizer_notes: "Cronometragem eletrónica. Todas as provas oficializadas pela FPN.",
    status: "published",
    featured: false,
    organizer_id: "org-4",
    participants: 89,
    price: 20,
    images: [
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop"
    ]
  }
];

// Eventos Culturais
export const mockCulturalEvents: MockEvent[] = [
  {
    id: "culture-fado-festival",
    title: "Festival de Fado no Bairro Alto",
    description: "Noite mágica de fado tradicional com artistas consagrados e novos talentos. Uma viagem pelas raízes musicais de Lisboa numa das suas zonas mais emblemáticas.",
    start_date: "2026-08-20T21:00:00Z",
    end_date: "2026-08-21T01:00:00Z",
    registration_start: "2024-11-01T00:00:00Z",
    registration_end: "2026-08-18T23:59:59Z",
    location: "Lisboa",
    address: "Casa de Fado, Rua do Norte 84, 1200-284 Lisboa",
    category: "musica",
    subcategory: "fado",
    event_type: "cultural",
    max_participants: 120,
    min_age: 16,
    requires_medical_certificate: false,
    organizer_notes: "Inclui jantar tradicional português. Consumo mínimo de 25€ por pessoa.",
    status: "published",
    featured: true,
    organizer_id: "org-5",
    participants: 89,
    price: 35,
    images: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "culture-theater-comedy",
    title: "Espetáculo de Comédia - 'Rir é o Melhor Remédio'",
    description: "Uma noite hilariante com os melhores comediantes nacionais. Stand-up comedy e sketches que garantem gargalhadas do início ao fim.",
    start_date: "2026-09-05T21:30:00Z",
    end_date: "2026-09-05T23:30:00Z",
    registration_start: "2024-11-01T00:00:00Z",
    registration_end: "2026-09-03T23:59:59Z",
    location: "Braga",
    address: "Teatro Circo, Av. da Liberdade 697, 4710-251 Braga",
    category: "teatro",
    subcategory: "stand-up",
    event_type: "cultural",
    max_participants: 300,
    min_age: 16,
    requires_medical_certificate: false,
    organizer_notes: "Espetáculo com classificação etária M/16. Não recomendado para pessoas sensíveis.",
    status: "published",
    featured: true,
    organizer_id: "org-6",
    participants: 245,
    price: 18,
    images: [
      "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "culture-art-exhibition",
    title: "Exposição 'Arte Contemporânea Portuguesa'",
    description: "Mostra coletiva dos mais promissores artistas contemporâneos portugueses. Pinturas, esculturas e instalações que refletem a sociedade atual.",
    start_date: "2026-10-15T10:00:00Z",
    end_date: "2026-12-15T18:00:00Z",
    registration_start: "2026-09-01T00:00:00Z",
    registration_end: "2026-12-10T23:59:59Z",
    location: "Aveiro",
    address: "Centro de Arte Contemporânea, Rua Batalhão Caçadores 10, 3810 Aveiro",
    category: "artes-visuais",
    subcategory: "exposicao-pintura",
    event_type: "cultural",
    max_participants: 50,
    requires_medical_certificate: false,
    organizer_notes: "Visitas guiadas aos sábados às 15h. Catálogo disponível na receção.",
    status: "published",
    featured: false,
    organizer_id: "org-7",
    participants: 32,
    price: 8,
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop"
    ]
  },
  {
    id: "culture-gastronomy-festival",
    title: "Festival Gastronómico do Bacalhau",
    description: "Celebração da gastronomia portuguesa com foco no prato nacional. Chefs reconhecidos preparam as suas versões únicas de receitas tradicionais.",
    start_date: "2026-11-12T12:00:00Z",
    end_date: "2026-11-14T22:00:00Z",
    registration_start: "2026-09-01T00:00:00Z",
    registration_end: "2026-11-10T23:59:59Z",
    location: "Viana do Castelo",
    address: "Praça da República, 4900-583 Viana do Castelo",
    category: "gastronomia",
    subcategory: "festival-gastronomico",
    event_type: "cultural",
    max_participants: 500,
    requires_medical_certificate: false,
    organizer_notes: "Festival ao ar livre. Degustações pagas à parte. Workshops de culinária incluídos.",
    status: "published",
    featured: true,
    organizer_id: "org-8",
    participants: 387,
    price: 12,
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop"
    ]
  }
];

// Todos os eventos mock
export const mockEvents: MockEvent[] = [...mockSportEvents, ...mockCulturalEvents];

// Tipos de bilhete mock
export const mockTicketTypes: MockTicketType[] = [
  // Maratona de Lisboa
  {
    id: "ticket-marathon-individual",
    event_id: "sport-marathon-2024",
    name: "Individual",
    description: "Inscrição individual para a maratona",
    price: 25,
    early_bird_price: 20,
    early_bird_end_date: "2026-02-28T23:59:59Z",
    currency: "EUR",
    max_quantity: 5000,
    includes_tshirt: true,
    includes_kit: true,
    includes_meal: false,
    includes_insurance: true,
    age_group: "seniores",
    gender_restriction: "MIXED",
    is_active: true,
    sort_order: 1
  },
  // Torneio de Futebol
  {
    id: "ticket-football-team",
    event_id: "sport-football-tournament",
    name: "Equipa",
    description: "Inscrição por equipa (11 jogadores + 5 suplentes)",
    price: 0,
    currency: "EUR",
    max_quantity: 32,
    includes_tshirt: false,
    includes_kit: false,
    includes_meal: false,
    includes_insurance: true,
    age_group: "seniores",
    gender_restriction: "MIXED",
    is_active: true,
    sort_order: 1
  },
  // BTT Serra da Estrela
  {
    id: "ticket-cycling-individual",
    event_id: "sport-cycling-tour",
    name: "Individual",
    description: "Inscrição individual para a volta de BTT",
    price: 35,
    early_bird_price: 30,
    early_bird_end_date: "2026-05-01T23:59:59Z",
    currency: "EUR",
    max_quantity: 200,
    includes_tshirt: true,
    includes_kit: true,
    includes_meal: true,
    includes_insurance: true,
    age_group: "seniores",
    gender_restriction: "MIXED",
    is_active: true,
    sort_order: 1
  },
  // Festival de Fado
  {
    id: "ticket-fado-standard",
    event_id: "culture-fado-festival",
    name: "Mesa Standard",
    description: "Mesa para 4 pessoas com jantar incluído",
    price: 35,
    currency: "EUR",
    max_quantity: 30,
    includes_tshirt: false,
    includes_kit: false,
    includes_meal: true,
    includes_insurance: false,
    age_group: "adultos",
    gender_restriction: "MIXED",
    is_active: true,
    sort_order: 1
  },
  {
    id: "ticket-fado-vip",
    event_id: "culture-fado-festival",
    name: "Mesa VIP",
    description: "Mesa premium com vista privilegiada e menu especial",
    price: 55,
    currency: "EUR",
    max_quantity: 10,
    includes_tshirt: false,
    includes_kit: true,
    includes_meal: true,
    includes_insurance: false,
    age_group: "adultos",
    gender_restriction: "MIXED",
    is_active: true,
    sort_order: 2
  },
  // Comédia
  {
    id: "ticket-comedy-standard",
    event_id: "culture-theater-comedy",
    name: "Entrada Geral",
    description: "Entrada para o espetáculo de comédia",
    price: 18,
    early_bird_price: 15,
    early_bird_end_date: "2026-08-20T23:59:59Z",
    currency: "EUR",
    max_quantity: 300,
    includes_tshirt: false,
    includes_kit: false,
    includes_meal: false,
    includes_insurance: false,
    age_group: "adultos",
    gender_restriction: "MIXED",
    is_active: true,
    sort_order: 1
  }
];

// Função para obter evento por ID
export const getMockEventById = (id: string): MockEvent | undefined => {
  return mockEvents.find(event => event.id === id);
};

// Função para obter bilhetes por evento
export const getMockTicketsByEventId = (eventId: string): MockTicketType[] => {
  return mockTicketTypes.filter(ticket => ticket.event_id === eventId);
};

// Função para obter eventos por categoria
export const getMockEventsByCategory = (categoryId: string): MockEvent[] => {
  return mockEvents.filter(event => event.category === categoryId);
};

// Função para obter eventos por tipo
export const getMockEventsByType = (type: 'sports' | 'cultural'): MockEvent[] => {
  return mockEvents.filter(event => event.event_type === type);
};

// Função para contar eventos por categoria
export const getEventCountByCategory = (): { [key: string]: number } => {
  const counts: { [key: string]: number } = {};
  
  // Obter todas as categorias
  const categories = getAllCategories();
  
  // Inicializar contadores
  categories.forEach(category => {
    counts[category.name] = 0;
  });
  
  // Contar eventos por categoria
  mockEvents.forEach(event => {
    const category = getCategoryById(event.category);
    if (category) {
      counts[category.name] = (counts[category.name] || 0) + 1;
    }
  });
  
  return counts;
};