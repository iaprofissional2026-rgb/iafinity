import { ImageMediaResult, VideoMediaJob, AudioMediaResult } from '../types/index.ts';

export interface GenerateImageOptions {
  prompt: string;
  style?: string;
  aspectRatio?: string;
  quality?: string;
  sourceImage?: string;
  enhance?: boolean;
}

export interface CreateVideoOptions {
  prompt: string;
  sourceImage?: string;
  aspectRatio?: string;
  duration?: number;
  generateAudio?: boolean;
}

export interface TextToSpeechOptions {
  text: string;
  voice?: string;
  speed?: number;
}

/**
 * Call backend to generate or edit image using free Recraft models
 */
export async function generateImage(options: GenerateImageOptions): Promise<ImageMediaResult> {
  const res = await fetch('/api/media/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Você atingiu temporariamente o limite do modelo gratuito.');
    }
    if (res.status === 402) {
      throw new Error('Esta operação exigiria créditos e foi bloqueada porque o Modo Gratuito está ativo.');
    }
    throw new Error(data.error || 'Modelo gratuito temporariamente indisponível.');
  }

  return {
    url: data.imageUrl,
    originalUrl: data.originalImageUrl,
    prompt: data.prompt,
    enhancedPrompt: data.enhancedPrompt,
    model: data.model,
    style: data.style,
    aspectRatio: data.aspectRatio,
    quality: data.quality,
  };
}

/**
 * Call backend psychological prompt enhancer
 */
export async function enhancePrompt(prompt: string, style?: string): Promise<string> {
  try {
    const res = await fetch('/api/media/enhance-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style }),
    });
    if (!res.ok) return prompt;
    const data = await res.json();
    return data.enhanced || prompt;
  } catch {
    return prompt;
  }
}

/**
 * Call backend to initiate asynchronous video generation with Kling Free
 */
export async function createVideo(options: CreateVideoOptions): Promise<VideoMediaJob> {
  const res = await fetch('/api/media/video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Você atingiu temporariamente o limite do modelo gratuito.');
    }
    if (res.status === 402) {
      throw new Error('Esta operação exigiria créditos e foi bloqueada porque o Modo Gratuito está ativo.');
    }
    throw new Error(data.error || 'Modelo gratuito temporariamente indisponível.');
  }

  return {
    jobId: data.jobId,
    status: data.status || 'pending',
    prompt: data.prompt,
    model: data.model,
    aspectRatio: data.aspectRatio,
    duration: data.duration,
  };
}

/**
 * Poll video status
 */
export async function getVideoStatus(jobId: string): Promise<VideoMediaJob> {
  const res = await fetch(`/api/media/video/${encodeURIComponent(jobId)}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Você atingiu temporariamente o limite do modelo gratuito.');
    }
    if (res.status === 402) {
      throw new Error('Esta operação exigiria créditos e foi bloqueada porque o Modo Gratuito está ativo.');
    }
    throw new Error(data.error || 'Erro ao consultar status do vídeo.');
  }

  return {
    jobId: data.jobId,
    status: data.status,
    videoUrl: data.videoUrl,
    prompt: data.prompt,
    model: data.model,
    aspectRatio: data.aspectRatio,
    duration: data.duration,
    error: data.error,
  };
}

/**
 * Call backend to convert text to speech using Fish Audio or Deepgram free models
 */
export async function textToSpeech(options: TextToSpeechOptions): Promise<AudioMediaResult> {
  const res = await fetch('/api/media/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Você atingiu temporariamente o limite do modelo gratuito.');
    }
    if (res.status === 402) {
      throw new Error('Esta operação exigiria créditos e foi bloqueada porque o Modo Gratuito está ativo.');
    }
    throw new Error(data.error || 'Modelo gratuito de voz temporariamente indisponível.');
  }

  return {
    audioUrl: data.audioUrl,
    text: data.text,
    voiceName: options.voice || 'Fish Audio S2.1',
    model: data.model,
  };
}

/**
 * Query dynamic model list and zero-cost confirmation
 */
export async function fetchMediaModels(): Promise<any> {
  const res = await fetch('/api/media/models');
  if (!res.ok) throw new Error('Falha ao consultar modelos');
  return res.json();
}

/**
 * Clean and friendly download helper for generated media
 * Format: lionfinity-imagem-2026..., lionfinity-video-2026..., lionfinity-audio-2026...
 */
export async function downloadMediaFile(url: string, type: 'imagem' | 'video' | 'audio', ext?: string): Promise<void> {
  const dateStr = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const extension = ext || (type === 'video' ? 'mp4' : type === 'audio' ? 'mp3' : 'png');
  const filename = `lionfinity-${type}-${dateStr}.${extension}`;

  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    // Fallback direct link download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
