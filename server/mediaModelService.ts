/**
 * Lionfinity AI - Media Model Service
 * 
 * Strict Cost-Zero & Free-Only Engine:
 * - FREE_ONLY_MODE = true
 * - Validates dynamically whether models have zero cost
 * - Never converts or falls back silently to paid models
 * - Handles OpenRouter endpoints for Images, Videos, TTS, and Multimodal analysis
 */

export const FREE_ONLY_MODE = true;

// Designated free models list
export const FREE_MEDIA_MODELS = {
  image: {
    primary: 'recraft/recraft-v4.1-pro:free',
    secondary: 'recraft/recraft-v4.1-utility-pro:free',
    fallback: 'recraft/recraft-v3:free',
  },
  video: {
    primary: 'kwaivgi/kling-v3.0-std:free',
  },
  speech: {
    primary: 'fish-audio/s2.1-pro-free:free',
    secondary: 'deepgram/flux-tts:free',
  },
  multimodalVision: {
    primary: 'google/gemini-2.0-flash-exp:free',
    secondary: 'meta-llama/llama-3.2-11b-vision-instruct:free',
    fallback: 'qwen/qwen-2-vl-72b-instruct:free',
  },
};

// Cache for OpenRouter models list with pricing
interface OpenRouterModelInfo {
  id: string;
  name: string;
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
    request?: string | number;
    image?: string | number;
  };
  architecture?: {
    modality?: string;
    instruct_type?: string;
  };
  context_length?: number;
}

let cachedModels: Map<string, OpenRouterModelInfo> = new Map();
let lastModelsFetchTime = 0;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function getOpenRouterApiKey(): string | null {
  return process.env.OPENROUTER_API_KEY || null;
}

/**
 * Fetch and cache model information from OpenRouter to check dynamic pricing
 */
export async function fetchOpenRouterModels(apiKey?: string): Promise<Map<string, OpenRouterModelInfo>> {
  const now = Date.now();
  if (cachedModels.size > 0 && now - lastModelsFetchTime < CACHE_TTL_MS) {
    return cachedModels;
  }

  const key = apiKey || getOpenRouterApiKey();
  try {
    const headers: Record<string, string> = {
      'HTTP-Referer': 'https://lionfinity.ai',
      'X-Title': 'Lionfinity AI',
    };
    if (key) {
      headers['Authorization'] = `Bearer ${key}`;
    }

    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        const newMap = new Map<string, OpenRouterModelInfo>();
        for (const m of data.data) {
          if (m && m.id) {
            newMap.set(m.id, m);
          }
        }
        cachedModels = newMap;
        lastModelsFetchTime = now;
      }
    }
  } catch (err) {
    console.warn('[mediaModelService] Não foi possível atualizar catálogo dinâmico de modelos:', (err as any)?.message);
  }

  return cachedModels;
}

/**
 * Cost-Zero Guard:
 * Strictly checks if a model is 100% free.
 * If FREE_ONLY_MODE is true and price > 0, returns false with user-facing message.
 */
export async function verifyFreeModel(modelId: string): Promise<{ isFree: boolean; error?: string }> {
  if (!FREE_ONLY_MODE) {
    return { isFree: true };
  }

  // 1. Explicitly check if it has the standard ':free' identifier
  const hasFreeSuffix = modelId.endsWith(':free');

  // 2. Check cached dynamic pricing from OpenRouter
  const models = await fetchOpenRouterModels();
  const info = models.get(modelId);

  if (info && info.pricing) {
    const promptPrice = parseFloat(String(info.pricing.prompt || '0'));
    const completionPrice = parseFloat(String(info.pricing.completion || '0'));
    const requestPrice = parseFloat(String(info.pricing.request || '0'));
    const imagePrice = parseFloat(String(info.pricing.image || '0'));

    const totalCalculated = promptPrice + completionPrice + requestPrice + imagePrice;
    if (totalCalculated > 0) {
      return {
        isFree: false,
        error: 'Este modelo deixou de ser gratuito. Escolha outro modelo gratuito.',
      };
    }
  }

  // If model does not have :free suffix and was not confirmed 0 price
  if (!hasFreeSuffix && (!info || !info.pricing)) {
    // Check if it matches known free models
    const isKnownFree = Object.values(FREE_MEDIA_MODELS).some(group => 
      Object.values(group).includes(modelId)
    );
    if (!isKnownFree) {
      return {
        isFree: false,
        error: 'Este modelo não é gratuito. O Modo Gratuito do Lionfinity está ativo.',
      };
    }
  }

  return { isFree: true };
}

/**
 * Psychological & Aesthetic Prompt Enhancer
 * Enriches the prompt with descriptive lighting, photographic detail and composition
 * while strictly preserving original intent, people, requested text and avoiding contrary elements.
 */
export function enhanceImagePrompt(userPrompt: string, style?: string): string {
  const trimmed = userPrompt.trim();
  if (!trimmed) return trimmed;

  // If already very long and detailed, keep it
  if (trimmed.length > 250) return trimmed;

  let styleAdditions = '';
  switch (style?.toLowerCase()) {
    case 'fotográfico':
    case 'photographic':
      styleAdditions = 'fotografia de estúdio 8k, lente 85mm f/1.4, iluminação suave difusa, texturas reais e nítidas';
      break;
    case 'realista':
    case 'realistic':
      styleAdditions = 'ultra realista, render fotorrealista de altíssima fidelidade, sombreamento natural e profundidade de campo precisa';
      break;
    case 'cinematográfico':
    case 'cinematic':
      styleAdditions = 'tomada cinematográfica em widescreen, iluminação volumétrica, gradação de cor cinematográfica de blockbuster, enquadramento dinâmico';
      break;
    case 'ilustração':
    case 'illustration':
      styleAdditions = 'ilustração artística detalhada, traços elegantes, paleta de cores equilibrada, arte digital de alto impacto';
      break;
    case '3d':
      styleAdditions = 'render 3D Octane estilo high-end, reflexos hiper-detalhados, iluminação global Ray Traced';
      break;
    case 'produto':
    case 'product':
      styleAdditions = 'fotografia comercial de produto, fundo limpo de estúdio, iluminação comercial de alta precisão, ângulo de catálogo profissional';
      break;
    case 'logo':
      styleAdditions = 'design de logotipo vetorial profissional, limpo, geométrico, minimalista, alta legibilidade sobre fundo neutro';
      break;
    case 'social media':
      styleAdditions = 'composição de alto impacto visual para feed e redes sociais, cores vivas atraentes, estética moderna';
      break;
    default:
      styleAdditions = 'alta definição, iluminação profissional harmoniosa, composição equilibrada, texturas ricas e detalhes refinados';
      break;
  }

  return `${trimmed}, ${styleAdditions}, sem artefatos, máxima fidelidade.`;
}

/**
 * Handle OpenRouter errors gracefully, distinguishing between 429, 402, and auth
 */
export function formatOpenRouterError(status: number, rawMessage?: string): { error: string; code: number } {
  if (status === 429) {
    return {
      code: 429,
      error: 'Você atingiu temporariamente o limite do modelo gratuito. Por favor, aguarde alguns instantes e tente novamente.',
    };
  }

  if (status === 402) {
    return {
      code: 402,
      error: 'Esta operação exigiria créditos e foi bloqueada porque o Modo Gratuito está ativo.',
    };
  }

  if (status === 401 || status === 403) {
    return {
      code: status,
      error: 'Configure OPENROUTER_API_KEY para ativar o assistente multimodal.',
    };
  }

  if (status >= 500) {
    return {
      code: status,
      error: 'Modelo gratuito temporariamente indisponível no provedor. Tente novamente em instantes.',
    };
  }

  return {
    code: status,
    error: rawMessage || 'Erro ao processar mídia com modelo gratuito.',
  };
}
