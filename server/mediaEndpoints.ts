import { Request, Response } from 'express';
import {
  FREE_ONLY_MODE,
  FREE_MEDIA_MODELS,
  getOpenRouterApiKey,
  verifyFreeModel,
  enhanceImagePrompt,
  formatOpenRouterError,
  fetchOpenRouterModels,
} from './mediaModelService.ts';

// In-memory job cache for video generation jobs
interface VideoJobRecord {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  model: string;
  aspectRatio: string;
  duration: number;
  videoUrl?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

const videoJobs = new Map<string, VideoJobRecord>();

/**
 * Clean up older video jobs after 2 hours
 */
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of videoJobs.entries()) {
    if (now - job.createdAt > 2 * 3600 * 1000) {
      videoJobs.delete(id);
    }
  }
}, 15 * 60 * 1000);

/**
 * GET /api/media/models
 * Returns the verified free models configuration for Settings & UI
 */
export async function handleGetMediaModels(_req: Request, res: Response): Promise<void> {
  try {
    const apiKey = getOpenRouterApiKey();
    await fetchOpenRouterModels(apiKey || undefined);

    res.json({
      freeOnlyMode: FREE_ONLY_MODE,
      hasOpenRouterKey: !!apiKey,
      models: {
        assistant: {
          id: 'auto-free',
          name: 'Automático gratuito',
          isFree: true,
        },
        image: {
          id: FREE_MEDIA_MODELS.image.primary,
          name: 'Recraft V4.1 Pro Free',
          secondary: FREE_MEDIA_MODELS.image.secondary,
          fallback: FREE_MEDIA_MODELS.image.fallback,
          isFree: true,
          badge: 'GRÁTIS',
        },
        video: {
          id: FREE_MEDIA_MODELS.video.primary,
          name: 'Kling Video v3 Standard Free',
          isFree: true,
          badge: 'GRÁTIS',
          supportedRatios: ['16:9', '9:16', '1:1'],
          supportedDurations: [3, 5, 8, 10],
          supportsAudio: true,
        },
        speech: {
          id: FREE_MEDIA_MODELS.speech.primary,
          name: 'Fish Audio S2.1 Pro Free',
          secondary: FREE_MEDIA_MODELS.speech.secondary,
          isFree: true,
          badge: 'GRÁTIS',
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao consultar modelos: ' + (err.message || err) });
  }
}

/**
 * POST /api/media/enhance-prompt
 * Psychological and artistic prompt enhancer
 */
export async function handleEnhancePrompt(req: Request, res: Response): Promise<void> {
  try {
    const { prompt, style } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt é obrigatório.' });
      return;
    }

    const enhanced = enhanceImagePrompt(prompt, style);
    res.json({ original: prompt, enhanced });
  } catch (err: any) {
    res.status(500).json({ error: 'Falha ao aprimorar prompt.' });
  }
}

/**
 * POST /api/media/image
 * Image generation & Image-to-Image editing using free Recraft models
 */
export async function handleGenerateImage(req: Request, res: Response): Promise<void> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    res.status(401).json({
      error: 'Configure OPENROUTER_API_KEY para ativar a geração de imagens com modelos gratuitos.',
      code: 401,
    });
    return;
  }

  const {
    prompt,
    style = 'Automático',
    aspectRatio = '1:1',
    quality = 'Alta',
    sourceImage, // base64 or URL for image editing
    enhance = false,
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Descrição da imagem é obrigatória.' });
    return;
  }

  // Choose primary model, verify cost-zero
  const targetModel = FREE_MEDIA_MODELS.image.primary;
  const verification = await verifyFreeModel(targetModel);
  if (!verification.isFree) {
    res.status(402).json({
      error: verification.error || 'Este modelo deixou de ser gratuito. Escolha outro modelo gratuito.',
      code: 402,
    });
    return;
  }

  const finalPrompt = enhance ? enhanceImagePrompt(prompt, style) : prompt;

  // Map aspect ratio to standard resolutions
  let size = '1024x1024';
  if (aspectRatio === '16:9') size = '1344x768';
  else if (aspectRatio === '9:16') size = '768x1344';
  else if (aspectRatio === '4:3') size = '1152x864';
  else if (aspectRatio === '3:4') size = '864x1152';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': 'https://lionfinity.ai',
    'X-Title': 'Lionfinity AI',
  };

  // Try primary, then secondary, then fallback
  const modelsToTry = [
    FREE_MEDIA_MODELS.image.primary,
    FREE_MEDIA_MODELS.image.secondary,
    FREE_MEDIA_MODELS.image.fallback,
  ];

  let lastErrorData: { error: string; code: number } | null = null;

  for (const modelCandidate of modelsToTry) {
    // Strict zero-cost verification for each candidate
    const freeCheck = await verifyFreeModel(modelCandidate);
    if (!freeCheck.isFree) continue;

    try {
      // 1. Try dedicated OpenRouter images/generations endpoint
      const imagePayload: any = {
        model: modelCandidate,
        prompt: finalPrompt,
        n: 1,
        size,
      };

      if (sourceImage) {
        // Image-to-image editing
        imagePayload.image = sourceImage;
        imagePayload.source_image = sourceImage;
      }

      const openRouterRes = await fetch('https://openrouter.ai/api/v1/images/generations', {
        method: 'POST',
        headers,
        body: JSON.stringify(imagePayload),
        signal: AbortSignal.timeout(60000),
      });

      if (openRouterRes.ok) {
        const data = await openRouterRes.json();
        const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json;
        if (imageUrl) {
          const finalUrl = imageUrl.startsWith('http') ? imageUrl : `data:image/png;base64,${imageUrl}`;
          res.json({
            success: true,
            imageUrl: finalUrl,
            originalImageUrl: sourceImage || null,
            prompt,
            enhancedPrompt: finalPrompt,
            model: modelCandidate,
            aspectRatio,
            style,
            quality,
            isFree: true,
            createdAt: Date.now(),
          });
          return;
        }
      }

      // If images/generations returned 429 or 402, format directly
      if (openRouterRes.status === 429 || openRouterRes.status === 402) {
        lastErrorData = formatOpenRouterError(openRouterRes.status);
        break; // Don't burn through fallbacks on quota exhaustion
      }

      // 2. Alternative: OpenRouter chat completion with image model
      const chatPayload: any = {
        model: modelCandidate,
        messages: [
          {
            role: 'user',
            content: sourceImage
              ? [
                  { type: 'text', text: finalPrompt },
                  { type: 'image_url', image_url: { url: sourceImage } },
                ]
              : finalPrompt,
          },
        ],
      };

      const chatRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify(chatPayload),
        signal: AbortSignal.timeout(60000),
      });

      if (chatRes.ok) {
        const chatData = await chatRes.json();
        const choice = chatData.choices?.[0]?.message?.content;
        // Search for image markdown or URL in response
        const match = typeof choice === 'string' ? choice.match(/https?:\/\/[^\s)"]+/i) : null;
        if (match) {
          res.json({
            success: true,
            imageUrl: match[0],
            originalImageUrl: sourceImage || null,
            prompt,
            enhancedPrompt: finalPrompt,
            model: modelCandidate,
            aspectRatio,
            style,
            quality,
            isFree: true,
            createdAt: Date.now(),
          });
          return;
        }
      } else {
        lastErrorData = formatOpenRouterError(chatRes.status);
      }
    } catch (err: any) {
      console.warn(`[handleGenerateImage] Falha com modelo ${modelCandidate}:`, err.message || err);
      lastErrorData = { code: 500, error: err.message || 'Falha na conexão com o modelo de imagem.' };
    }
  }

  const responseError = lastErrorData || {
    code: 503,
    error: 'Modelo gratuito temporariamente indisponível. Tente novamente em instantes.',
  };

  res.status(responseError.code).json(responseError);
}

/**
 * POST /api/media/video
 * Asynchronous Video generation (Text-to-Video & Image-to-Video) using Kling Free
 */
export async function handleCreateVideo(req: Request, res: Response): Promise<void> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    res.status(401).json({
      error: 'Configure OPENROUTER_API_KEY para ativar a geração de vídeos com modelos gratuitos.',
      code: 401,
    });
    return;
  }

  const {
    prompt,
    sourceImage, // First frame for Image-to-Video
    aspectRatio = '16:9',
    duration = 5,
    generateAudio = false,
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Descrição do vídeo é obrigatória.' });
    return;
  }

  const targetModel = FREE_MEDIA_MODELS.video.primary; // kwaivgi/kling-v3.0-std:free
  const verification = await verifyFreeModel(targetModel);
  if (!verification.isFree) {
    res.status(402).json({
      error: verification.error || 'Este modelo deixou de ser gratuito. Escolha outro modelo gratuito.',
      code: 402,
    });
    return;
  }

  try {
    const videoPayload: any = {
      model: targetModel,
      prompt: prompt.trim(),
      aspect_ratio: aspectRatio,
      duration: Math.min(Math.max(duration, 3), 15),
      generate_audio: !!generateAudio,
    };

    if (sourceImage) {
      videoPayload.image_url = sourceImage;
    }

    const openRouterRes = await fetch('https://openrouter.ai/api/v1/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://lionfinity.ai',
        'X-Title': 'Lionfinity AI',
      },
      body: JSON.stringify(videoPayload),
      signal: AbortSignal.timeout(30000),
    });

    if (!openRouterRes.ok) {
      const errFormatted = formatOpenRouterError(openRouterRes.status);
      res.status(errFormatted.code).json(errFormatted);
      return;
    }

    const data = await openRouterRes.json();
    const jobId = data.id || data.job_id || `job-${Date.now()}`;

    // Register job locally
    const jobRecord: VideoJobRecord = {
      jobId,
      status: (data.status as any) || 'pending',
      prompt,
      model: targetModel,
      aspectRatio,
      duration,
      videoUrl: data.video_url || data.url || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    videoJobs.set(jobId, jobRecord);

    res.json({
      success: true,
      jobId,
      status: jobRecord.status,
      prompt,
      model: targetModel,
      aspectRatio,
      duration,
      createdAt: jobRecord.createdAt,
    });
  } catch (err: any) {
    console.error('[handleCreateVideo] Erro:', err);
    res.status(500).json({
      code: 500,
      error: 'Erro ao iniciar geração de vídeo com o modelo gratuito: ' + (err.message || err),
    });
  }
}

/**
 * GET /api/media/video/:jobId
 * Check asynchronous status of video job
 */
export async function handleGetVideoStatus(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;
  if (!jobId) {
    res.status(400).json({ error: 'Job ID obrigatório.' });
    return;
  }

  const apiKey = getOpenRouterApiKey();
  const cachedJob = videoJobs.get(jobId);

  // If already completed or failed in memory with URL, return directly
  if (cachedJob && (cachedJob.status === 'completed' || cachedJob.status === 'failed') && cachedJob.videoUrl) {
    res.json(cachedJob);
    return;
  }

  if (!apiKey) {
    // If no key configured, return current cached state or error
    if (cachedJob) {
      res.json(cachedJob);
    } else {
      res.status(401).json({ error: 'Configure OPENROUTER_API_KEY para verificar status.' });
    }
    return;
  }

  try {
    const statusRes = await fetch(`https://openrouter.ai/api/v1/videos/${encodeURIComponent(jobId)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://lionfinity.ai',
        'X-Title': 'Lionfinity AI',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!statusRes.ok) {
      if (cachedJob) {
        res.json(cachedJob);
        return;
      }
      const formatted = formatOpenRouterError(statusRes.status);
      res.status(formatted.code).json(formatted);
      return;
    }

    const data = await statusRes.json();
    const updatedStatus: VideoJobRecord['status'] = data.status || 'processing';
    const videoUrl = data.video_url || data.url || data.content_url || cachedJob?.videoUrl;

    const updatedJob: VideoJobRecord = {
      jobId,
      status: updatedStatus,
      prompt: cachedJob?.prompt || data.prompt || 'Vídeo gerado',
      model: cachedJob?.model || FREE_MEDIA_MODELS.video.primary,
      aspectRatio: cachedJob?.aspectRatio || '16:9',
      duration: cachedJob?.duration || 5,
      videoUrl,
      error: data.error,
      createdAt: cachedJob?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    videoJobs.set(jobId, updatedJob);
    res.json(updatedJob);
  } catch (err: any) {
    if (cachedJob) {
      res.json(cachedJob);
    } else {
      res.status(500).json({ error: 'Erro ao verificar status do vídeo: ' + err.message });
    }
  }
}

/**
 * GET /api/media/video/:jobId/content
 * Retrieve video content
 */
export async function handleGetVideoContent(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;
  const apiKey = getOpenRouterApiKey();
  const cachedJob = videoJobs.get(jobId);

  if (cachedJob?.videoUrl) {
    res.redirect(cachedJob.videoUrl);
    return;
  }

  if (!apiKey) {
    res.status(401).json({ error: 'Chave OPENROUTER_API_KEY não configurada.' });
    return;
  }

  try {
    const contentRes = await fetch(`https://openrouter.ai/api/v1/videos/${encodeURIComponent(jobId)}/content`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://lionfinity.ai',
        'X-Title': 'Lionfinity AI',
      },
    });

    if (contentRes.ok) {
      const contentType = contentRes.headers.get('content-type') || 'video/mp4';
      res.setHeader('Content-Type', contentType);
      const buffer = await contentRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    } else {
      res.status(contentRes.status).json({ error: 'Não foi possível recuperar o vídeo.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Falha ao recuperar vídeo: ' + err.message });
  }
}

/**
 * POST /api/media/speech
 * Text-to-Speech (TTS) using free Fish Audio or Deepgram models
 */
export async function handleTextToSpeech(req: Request, res: Response): Promise<void> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    res.status(401).json({
      error: 'Configure OPENROUTER_API_KEY para ativar a síntese de voz gratuita.',
      code: 401,
    });
    return;
  }

  const { text, voice, speed = 1.0 } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'Texto para fala é obrigatório.' });
    return;
  }

  // Sanitize text length for free TTS
  const sanitizedText = text.trim().slice(0, 3000);

  const modelsToTry = [
    FREE_MEDIA_MODELS.speech.primary,
    FREE_MEDIA_MODELS.speech.secondary,
  ];

  let lastError: any = null;

  for (const modelCandidate of modelsToTry) {
    const freeCheck = await verifyFreeModel(modelCandidate);
    if (!freeCheck.isFree) continue;

    try {
      const speechRes = await fetch('https://openrouter.ai/api/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://lionfinity.ai',
          'X-Title': 'Lionfinity AI',
        },
        body: JSON.stringify({
          model: modelCandidate,
          input: sanitizedText,
          voice: voice || 'alloy',
          speed: speed || 1.0,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (speechRes.ok) {
        const audioBuffer = await speechRes.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        const mimeType = speechRes.headers.get('content-type') || 'audio/mp3';
        const dataUrl = `data:${mimeType};base64,${base64Audio}`;

        res.json({
          success: true,
          audioUrl: dataUrl,
          model: modelCandidate,
          text: sanitizedText,
          createdAt: Date.now(),
        });
        return;
      }

      if (speechRes.status === 429 || speechRes.status === 402) {
        const formatted = formatOpenRouterError(speechRes.status);
        res.status(formatted.code).json(formatted);
        return;
      }

      lastError = formatOpenRouterError(speechRes.status);
    } catch (err: any) {
      console.warn(`[handleTextToSpeech] Falha com modelo ${modelCandidate}:`, err.message || err);
      lastError = { code: 500, error: err.message };
    }
  }

  res.status(lastError?.code || 503).json(lastError || {
    code: 503,
    error: 'Modelo gratuito de voz temporariamente indisponível. Tente novamente em instantes.',
  });
}
