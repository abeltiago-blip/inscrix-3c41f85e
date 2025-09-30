import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

// Cache to store translations with expiration
interface CacheEntry {
  text: string;
  timestamp: number;
}

const translationCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const TRANSLATION_DELAY = 500; // Delay before translating to avoid too many calls

// Comprehensive automatic translations - no external API needed
const automaticTranslations: Record<string, Record<string, string>> = {
  'pt-en': {
    // Navigation & UI
    'Eventos': 'Events',
    'Desporto': 'Sports',
    'Cultural': 'Cultural',
    'Recreativo': 'Recreational',
    'Educacional': 'Educational',
    'Detalhes': 'Details',
    'Esgotado': 'Sold Out',
    'Grátis': 'Free',
    'Inscrever': 'Register',
    'Comprar': 'Buy',
    'Ver mais': 'See more',
    'Contactos': 'Contacts',
    'Sobre': 'About',
    'Manual': 'Manual',
    'FAQ': 'FAQ',
    'Registo': 'Sign up',
    'Login': 'Login',
    'Logout': 'Logout',
    'Procurar': 'Search',
    'Filtrar': 'Filter',
    'Categoria': 'Category',
    'Localização': 'Location',
    'Data': 'Date',
    'Preço': 'Price',
    'Participantes': 'Participants',
    'Organizar evento': 'Organize event',
    'Dashboard': 'Dashboard',
    'Perfil': 'Profile',
    'Definições': 'Settings',
    'Carrinho': 'Cart',
    'Checkout': 'Checkout',
    'Pagamento': 'Payment',
    'Confirmação': 'Confirmation',
    
    // Event types & categories
    'atletismo': 'athletics',
    'ciclismo': 'cycling',
    'futebol': 'football',
    'natacao': 'swimming',
    'ténis': 'tennis',
    'basquetebol': 'basketball',
    'voleibol': 'volleyball',
    'corrida': 'running',
    'caminhada': 'hiking',
    'escalada': 'climbing',
    'yoga': 'yoga',
    'fitness': 'fitness',
    'dança': 'dance',
    'musica': 'music',
    'teatro': 'theater',
    'cinema': 'cinema',
    'arte': 'art',
    'fotografia': 'photography',
    'literatura': 'literature',
    'gastronomia': 'gastronomy',
    'vinhos': 'wines',
    'cerveja': 'beer',
    'culinária': 'culinary',
    'workshop': 'workshop',
    'seminário': 'seminar',
    'conferência': 'conference',
    'formação': 'training',
    'curso': 'course',
    
    // Specific events
    'Curso de Permacultura e Agricultura Biológica': 'Permaculture and Organic Agriculture Course',
    'Gran Fondo do Douro 2025': 'Gran Fondo do Douro 2025',
    'Dia da Família no Jardim Botânico': 'Family Day at Botanical Garden',
    'BTT Challenge Serra da Estrela 2025': 'MTB Challenge Serra da Estrela 2025',
    'Festival de Teatro de Aveiro 2025': 'Aveiro Theater Festival 2025',
    'Concerto de Fado no Jardim da Sereia': 'Fado Concert at Sereia Garden',
    'Workshop de Danças Tradicionais Portuguesas': 'Portuguese Traditional Dances Workshop',
    'Festival de Vinhos do Douro': 'Douro Wine Festival',
    'Workshop de Desenvolvimento Web Moderno': 'Modern Web Development Workshop',
    'Volta ao Algarve Cicloturismo 2025': 'Algarve Cycling Tour 2025',
    'Seminário sobre Alimentação Saudável': 'Healthy Eating Seminar',
    'Exposição "Arte Contemporânea Portuguesa"': 'Portuguese Contemporary Art Exhibition',
    
    // Common descriptions parts
    'Uma experiência única': 'A unique experience',
    'Percurso desafiante': 'Challenging route',
    'Para toda a família': 'For the whole family',
    'Inclui': 'Includes',
    'Não inclui': 'Does not include',
    'Obrigatório': 'Mandatory',
    'Recomendado': 'Recommended',
    'Principiantes': 'Beginners',
    'Avançados': 'Advanced',
    'Todos os níveis': 'All levels',
    'Certificado': 'Certificate',
    'Diploma': 'Diploma',
    'Medalha': 'Medal',
    'T-shirt': 'T-shirt',
    'Kit': 'Kit',
    'Refeição': 'Meal',
    'Lanche': 'Snack',
    'Bebidas': 'Drinks',
    'Transporte': 'Transport',
    'Alojamento': 'Accommodation',
    'Seguro': 'Insurance',
    'Equipamento': 'Equipment',
    'Material': 'Materials',
    'Apoio técnico': 'Technical support',
    'Assistência médica': 'Medical assistance',
    'Pontos de avitualamento': 'Refreshment points',
  },
  
  'pt-es': {
    // Navigation & UI
    'Eventos': 'Eventos',
    'Desporto': 'Deportes',
    'Cultural': 'Cultural',
    'Recreativo': 'Recreativo',
    'Educacional': 'Educacional',
    'Detalhes': 'Detalles',
    'Esgotado': 'Agotado',
    'Grátis': 'Gratis',
    'Inscrever': 'Inscribirse',
    'Comprar': 'Comprar',
    'Ver mais': 'Ver más',
    'Contactos': 'Contactos',
    'Sobre': 'Acerca de',
    'Manual': 'Manual',
    'FAQ': 'FAQ',
    'Registo': 'Registro',
    'Login': 'Iniciar sesión',
    'Logout': 'Cerrar sesión',
    'Procurar': 'Buscar',
    'Filtrar': 'Filtrar',
    'Categoria': 'Categoría',
    'Localização': 'Ubicación',
    'Data': 'Fecha',
    'Preço': 'Precio',
    'Participantes': 'Participantes',
    'Organizar evento': 'Organizar evento',
    'Dashboard': 'Panel',
    'Perfil': 'Perfil',
    'Definições': 'Configuración',
    'Carrinho': 'Carrito',
    'Checkout': 'Pagar',
    'Pagamento': 'Pago',
    'Confirmação': 'Confirmación',
    
    // Event types
    'atletismo': 'atletismo',
    'ciclismo': 'ciclismo',
    'futebol': 'fútbol',
    'natacao': 'natación',
    'ténis': 'tenis',
    'basquetebol': 'baloncesto',
    'voleibol': 'voleibol',
    'corrida': 'carrera',
    'caminhada': 'senderismo',
    'escalada': 'escalada',
    'yoga': 'yoga',
    'fitness': 'fitness',
    'dança': 'danza',
    'musica': 'música',
    'teatro': 'teatro',
    'cinema': 'cine',
    'arte': 'arte',
    'fotografia': 'fotografía',
    'literatura': 'literatura',
    'gastronomia': 'gastronomía',
    'vinhos': 'vinos',
    'cerveja': 'cerveza',
    'culinária': 'culinaria',
    'workshop': 'taller',
    'seminário': 'seminario',
    'conferência': 'conferencia',
    'formação': 'formación',
    'curso': 'curso',
    
    // Descriptions
    'Uma experiência única': 'Una experiencia única',
    'Percurso desafiante': 'Recorrido desafiante',
    'Para toda a família': 'Para toda la familia',
    'Inclui': 'Incluye',
    'Não inclui': 'No incluye',
    'Obrigatório': 'Obligatorio',
    'Recomendado': 'Recomendado',
    'Principiantes': 'Principiantes',
    'Avançados': 'Avanzados',
    'Todos os níveis': 'Todos los niveles',
    'Certificado': 'Certificado',
    'Diploma': 'Diploma',
    'Medalha': 'Medalla',
    'T-shirt': 'Camiseta',
    'Kit': 'Kit',
    'Refeição': 'Comida',
    'Lanche': 'Merienda',
    'Bebidas': 'Bebidas',
    'Transporte': 'Transporte',
    'Alojamento': 'Alojamiento',
    'Seguro': 'Seguro',
    'Equipamento': 'Equipamiento',
    'Material': 'Material',
    'Apoio técnico': 'Apoyo técnico',
    'Assistência médica': 'Asistencia médica',
    'Pontos de avitualamento': 'Puntos de avituallamiento',
  },
  
  'pt-fr': {
    // Navigation & UI
    'Eventos': 'Événements',
    'Desporto': 'Sports',
    'Cultural': 'Culturel',
    'Recreativo': 'Récréatif',
    'Educacional': 'Éducatif',
    'Detalhes': 'Détails',
    'Esgotado': 'Complet',
    'Grátis': 'Gratuit',
    'Inscrever': "S'inscrire",
    'Comprar': 'Acheter',
    'Ver mais': 'Voir plus',
    'Contactos': 'Contacts',
    'Sobre': 'À propos',
    'Manual': 'Manuel',
    'FAQ': 'FAQ',
    'Registo': 'Inscription',
    'Login': 'Connexion',
    'Logout': 'Déconnexion',
    'Procurar': 'Rechercher',
    'Filtrar': 'Filtrer',
    'Categoria': 'Catégorie',
    'Localização': 'Localisation',
    'Data': 'Date',
    'Preço': 'Prix',
    'Participantes': 'Participants',
    'Organizar evento': 'Organiser un événement',
    'Dashboard': 'Tableau de bord',
    'Perfil': 'Profil',
    'Definições': 'Paramètres',
    'Carrinho': 'Panier',
    'Checkout': 'Commander',
    'Pagamento': 'Paiement',
    'Confirmação': 'Confirmation',
    
    // Event types
    'atletismo': 'athlétisme',
    'ciclismo': 'cyclisme',
    'futebol': 'football',
    'natacao': 'natation',
    'ténis': 'tennis',
    'basquetebol': 'basketball',
    'voleibol': 'volleyball',
    'corrida': 'course',
    'caminhada': 'randonnée',
    'escalada': 'escalade',
    'yoga': 'yoga',
    'fitness': 'fitness',
    'dança': 'danse',
    'musica': 'musique',
    'teatro': 'théâtre',
    'cinema': 'cinéma',
    'arte': 'art',
    'fotografia': 'photographie',
    'literatura': 'littérature',
    'gastronomia': 'gastronomie',
    'vinhos': 'vins',
    'cerveja': 'bière',
    'culinária': 'culinaire',
    'workshop': 'atelier',
    'seminário': 'séminaire',
    'conferência': 'conférence',
    'formação': 'formation',
    'curso': 'cours',
    
    // Descriptions
    'Uma experiência única': 'Une expérience unique',
    'Percurso desafiante': 'Parcours défiant',
    'Para toda a família': 'Pour toute la famille',
    'Inclui': 'Inclut',
    'Não inclui': "N'inclut pas",
    'Obrigatório': 'Obligatoire',
    'Recomendado': 'Recommandé',
    'Principiantes': 'Débutants',
    'Avançados': 'Avancés',
    'Todos os níveis': 'Tous niveaux',
    'Certificado': 'Certificat',
    'Diploma': 'Diplôme',
    'Medalha': 'Médaille',
    'T-shirt': 'T-shirt',
    'Kit': 'Kit',
    'Refeição': 'Repas',
    'Lanche': 'Collation',
    'Bebidas': 'Boissons',
    'Transporte': 'Transport',
    'Alojamento': 'Hébergement',
    'Seguro': 'Assurance',
    'Equipamento': 'Équipement',
    'Material': 'Matériel',
    'Apoio técnico': 'Support technique',
    'Assistência médica': 'Assistance médicale',
    'Pontos de avitualamento': 'Points de ravitaillement',
  },
};

// Smart translation function with fuzzy matching
function getAutomaticTranslation(text: string, sourceLanguage: string, targetLanguage: string): string | null {
  const key = `${sourceLanguage}-${targetLanguage}`;
  const translations = automaticTranslations[key];
  
  if (!translations) return null;
  
  // Exact match first
  if (translations[text]) {
    return translations[text];
  }
  
  // Try trimmed version
  const trimmedText = text.trim();
  if (translations[trimmedText]) {
    return translations[trimmedText];
  }
  
  // Try case-insensitive match
  const lowerText = trimmedText.toLowerCase();
  const exactMatch = Object.keys(translations).find(key => key.toLowerCase() === lowerText);
  if (exactMatch) {
    return translations[exactMatch];
  }
  
  // Try partial matching for common words
  for (const [originalText, translatedText] of Object.entries(translations)) {
    if (trimmedText.includes(originalText) || originalText.includes(trimmedText)) {
      // For partial matches, we could do more sophisticated replacement
      if (trimmedText.length > 50) {
        // For longer texts, try word-by-word replacement
        let result = trimmedText;
        for (const [orig, trans] of Object.entries(translations)) {
          if (orig.length > 3) { // Only replace significant words
            result = result.replace(new RegExp(`\\b${orig}\\b`, 'gi'), trans);
          }
        }
        if (result !== trimmedText) {
          return result;
        }
      } else {
        return translatedText;
      }
    }
  }
  
  return null;
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

export function useTranslateContent(text: string, sourceLanguage: string = 'pt') {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const translateText = async () => {
      const currentLanguage = i18n.language;
      
      // If current language is the same as source, no translation needed
      if (currentLanguage === sourceLanguage) {
        setTranslatedText(text);
        return;
      }

      // If text is empty or very short, don't translate
      if (!text || text.trim().length < 2) {
        setTranslatedText(text);
        return;
      }

      // Check automatic translations first (no API needed!)
      const automaticResult = getAutomaticTranslation(text.trim(), sourceLanguage, currentLanguage);
      if (automaticResult) {
        setTranslatedText(automaticResult);
        return;
      }

      // Check cache for any previous translations
      const cacheKey = `${text.trim()}-${sourceLanguage}-${currentLanguage}`;
      const cached = translationCache.get(cacheKey);
      if (cached && isCacheValid(cached)) {
        setTranslatedText(cached.text);
        return;
      }

      // If no automatic translation available, keep original text
      // This eliminates the need for external API calls
      console.log(`No automatic translation available for: "${text}" from ${sourceLanguage} to ${currentLanguage}`);
      setTranslatedText(text);
    };

    // Delay translation to avoid too many calls
    timeoutId = setTimeout(translateText, TRANSLATION_DELAY);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [text, sourceLanguage, i18n.language]);

  return { translatedText, isTranslating };
}

// Hook for translating multiple texts at once
export function useTranslateObject<T extends Record<string, string>>(
  textObject: T,
  sourceLanguage: string = 'pt'
): { translatedObject: T; isTranslating: boolean } {
  const { i18n } = useTranslation();
  const [translatedObject, setTranslatedObject] = useState<T>(textObject);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateObject = async () => {
      const currentLanguage = i18n.language;
      
      // If current language is the same as source, no translation needed
      if (currentLanguage === sourceLanguage) {
        setTranslatedObject(textObject);
        return;
      }

      setIsTranslating(true);
      const translated = { ...textObject };

      try {
        // Translate all text values using automatic translations
        const translationPromises = Object.entries(textObject).map(async ([key, value]) => {
          if (typeof value !== 'string' || !value || value.length < 2) {
            return [key, value];
          }

          // Check cache first
          const cacheKey = `${value}-${sourceLanguage}-${currentLanguage}`;
          const cached = translationCache.get(cacheKey);
          if (cached && isCacheValid(cached)) {
            return [key, cached.text];
          }

          // Try automatic translation
          const automaticResult = getAutomaticTranslation(value, sourceLanguage, currentLanguage);
          if (automaticResult) {
            // Cache the result
            translationCache.set(cacheKey, {
              text: automaticResult,
              timestamp: Date.now(),
            });
            return [key, automaticResult];
          }

          // Fallback to original if no translation available
          return [key, value];
        });

        const results = await Promise.all(translationPromises);
        
        results.forEach(([key, translatedValue]) => {
          translated[key as keyof T] = translatedValue as T[keyof T];
        });

        setTranslatedObject(translated);
      } catch (error) {
        console.error('Batch translation failed:', error);
        setTranslatedObject(textObject); // Fallback to original
      } finally {
        setIsTranslating(false);
      }
    };

    translateObject();
  }, [textObject, sourceLanguage, i18n.language]);

  return { translatedObject, isTranslating };
}