import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage, sourceLanguage = 'pt' }: TranslateRequest = await req.json();
    
    console.log(`[TRANSLATE] Request: "${text}" from ${sourceLanguage} to ${targetLanguage}`);
    
    // If target language is the same as source, return original text
    if (targetLanguage === sourceLanguage) {
      console.log('[TRANSLATE] Same language, returning original text');
      return new Response(JSON.stringify({ translatedText: text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate input
    if (!text || text.trim().length === 0) {
      console.log('[TRANSLATE] Empty text, returning as is');
      return new Response(JSON.stringify({ translatedText: text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const googleTranslateApiKey = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
    
    if (!googleTranslateApiKey) {
      console.error('[TRANSLATE] Google Translate API key not found');
      return new Response(JSON.stringify({ 
        translatedText: text,
        error: 'API key not configured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[TRANSLATE] API Key found, making request to Google Translate...');

    // Simple translations for common text that doesn't need API calls
    const commonTranslations: Record<string, Record<string, string>> = {
      'en': {
        'Curso de Permacultura e Agricultura Biológica': 'Permaculture and Organic Agriculture Course',
        'Gran Fondo do Douro 2025': 'Gran Fondo do Douro 2025',
        'Dia da Família no Jardim Botânico': 'Family Day at the Botanical Garden',
        'BTT Challenge Serra da Estrela 2025': 'MTB Challenge Serra da Estrela 2025',
        'Festival de Teatro de Aveiro 2025': 'Aveiro Theater Festival 2025',
        'Concerto de Fado no Jardim da Sereia': 'Fado Concert at Sereia Garden',
        'Workshop de Danças Tradicionais Portuguesas': 'Portuguese Traditional Dances Workshop'
      },
      'fr': {
        'Curso de Permacultura e Agricultura Biológica': 'Cours de Permaculture et Agriculture Biologique',
        'Gran Fondo do Douro 2025': 'Gran Fondo du Douro 2025',
        'Dia da Família no Jardim Botânico': 'Journée Famille au Jardin Botanique',
        'BTT Challenge Serra da Estrela 2025': 'Défi VTT Serra da Estrela 2025',
        'Festival de Teatro de Aveiro 2025': 'Festival de Théâtre d\'Aveiro 2025',
        'Concerto de Fado no Jardim da Sereia': 'Concert de Fado au Jardin da Sereia',
        'Workshop de Danças Tradicionais Portuguesas': 'Atelier de Danses Traditionnelles Portugaises'
      },
      'es': {
        'Curso de Permacultura e Agricultura Biológica': 'Curso de Permacultura y Agricultura Biológica',
        'Gran Fondo do Douro 2025': 'Gran Fondo del Duero 2025',
        'Dia da Família no Jardim Botânico': 'Día de la Familia en el Jardín Botánico',
        'BTT Challenge Serra da Estrela 2025': 'Desafío BTT Serra da Estrela 2025',
        'Festival de Teatro de Aveiro 2025': 'Festival de Teatro de Aveiro 2025',
        'Concerto de Fado no Jardim da Sereia': 'Concierto de Fado en el Jardín da Sereia',
        'Workshop de Danças Tradicionais Portuguesas': 'Taller de Danzas Tradicionales Portuguesas'
      }
    };

    // Check if we have a simple translation
    if (commonTranslations[targetLanguage]?.[text.trim()]) {
      const translation = commonTranslations[targetLanguage][text.trim()];
      console.log(`[TRANSLATE] Using cached translation: ${translation}`);
      return new Response(JSON.stringify({ translatedText: translation }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${googleTranslateApiKey}`;
    
    const requestBody = {
      q: text.trim(),
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text'
    };

    console.log('[TRANSLATE] Request body:', JSON.stringify(requestBody));
    console.log(`[TRANSLATE] Calling Google API: ${translateUrl}`);

    const response = await fetch(translateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[TRANSLATE] Google API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TRANSLATE] Google Translate API error:', response.status, response.statusText, errorText);
      
      // Return original text with error info
      return new Response(JSON.stringify({ 
        translatedText: text,
        error: `Google API error: ${response.status} - ${errorText}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('[TRANSLATE] Google API response data:', JSON.stringify(data, null, 2));

    if (!data.data?.translations?.[0]?.translatedText) {
      console.error('[TRANSLATE] Invalid response structure from Google Translate');
      return new Response(JSON.stringify({ 
        translatedText: text,
        error: 'Invalid response from translation service'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const translatedText = data.data.translations[0].translatedText;
    console.log(`[TRANSLATE] Translation successful: "${translatedText}"`);

    return new Response(JSON.stringify({ translatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[TRANSLATE] Function error:', error);
    
    // Try to get original text from request
    let originalText = 'Translation error';
    try {
      const body = await req.json();
      originalText = body.text || 'Translation error';
    } catch {
      // Ignore json parsing errors
    }
    
    return new Response(JSON.stringify({ 
      translatedText: originalText,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 to avoid breaking the UI
    });
  }
});