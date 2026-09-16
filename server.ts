import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getGeminiClient, ThinkingLevel } from './server/gemini.ts';
import { BASE_SYSTEM_PROMPT, MODEL_MODES } from './server/config.ts';
import {
  handleGetMediaModels,
  handleGenerateImage,
  handleEnhancePrompt,
  handleCreateVideo,
  handleGetVideoStatus,
  handleGetVideoContent,
  handleTextToSpeech,
} from './server/mediaEndpoints.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing for JSON and base64 attachments
  app.use(express.json({ limit: '35mb' }));
  app.use(express.urlencoded({ extended: true, limit: '35mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Lionfinity AI',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
      freeOnlyMode: true,
      timestamp: new Date().toISOString(),
    });
  });

  // Media Endpoints (Cost-Zero / Free-Only OpenRouter integration)
  app.get('/api/media/models', handleGetMediaModels);
  app.post('/api/media/enhance-prompt', handleEnhancePrompt);
  app.post('/api/media/image', handleGenerateImage);
  app.post('/api/media/video', handleCreateVideo);
  app.get('/api/media/video/:jobId', handleGetVideoStatus);
  app.get('/api/media/video/:jobId/content', handleGetVideoContent);
  app.post('/api/media/speech', handleTextToSpeech);

  // Streaming chat endpoint with Server-Sent Events (SSE)
  app.post('/api/chat/stream', async (req: Request, res: Response) => {
    const {
      messages,
      modelMode = 'alta',
      deepThinking,
      useGoogleSearch,
      memory,
      responseStyle = 'detailed',
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Nenhuma mensagem foi fornecida.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: 'Chave de API Gemini não configurada. Configure o secret GEMINI_API_KEY nas configurações do projeto.',
      });
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    try {
      const modeConfig = MODEL_MODES[modelMode] || MODEL_MODES.fast;
      const ai = getGeminiClient();

      // Assemble system instruction
      let systemInstruction = BASE_SYSTEM_PROMPT;
      systemInstruction += modeConfig.systemInstructionSuffix;

      if (responseStyle === 'concise') {
        systemInstruction += '\n\nEstilo de resposta: Seja extremamente conciso, direto ao ponto e evite preâmbulos.';
      } else if (responseStyle === 'detailed') {
        systemInstruction += '\n\nEstilo de resposta: Seja detalhado, abrangente e aprofunde em explicações e exemplos práticos.';
      }

      if (memory && memory.trim()) {
        systemInstruction += `\n\n[MEMÓRIA E PREFERÊNCIAS DO USUÁRIO]:\n${memory.trim()}`;
      }

      // Convert messages to Gemini API contents format
      // Note: role in Gemini must be 'user' or 'model'
      const contents = messages.map((msg: any) => {
        const parts: any[] = [];

        // Handle attachments (images, PDFs, text files)
        if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
          for (const att of msg.attachments) {
            if (att.data) {
              // If base64 data contains prefix data:image/...;base64, strip it
              let base64Data = att.data;
              let mimeType = att.mimeType || 'application/octet-stream';

              if (typeof base64Data === 'string' && base64Data.includes(';base64,')) {
                const partsData = base64Data.split(';base64,');
                mimeType = partsData[0].replace('data:', '');
                base64Data = partsData[1];
              }

              // Text/Code files can be sent as text parts or inlineData
              if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'application/javascript') {
                try {
                  const decodedText = Buffer.from(base64Data, 'base64').toString('utf-8');
                  parts.push({
                    text: `[Arquivo anexado: ${att.name || 'documento'}]\n\`\`\`\n${decodedText}\n\`\`\``,
                  });
                  continue;
                } catch {
                  // Fall back to inlineData if decode fails
                }
              }

              parts.push({
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              });
            }
          }
        }

        if (msg.content && msg.content.trim()) {
          parts.push({ text: msg.content });
        } else if (parts.length === 0) {
          parts.push({ text: ' ' });
        }

        return {
          role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
          parts,
        };
      });

      // Configure thinking level according to mode or deepThinking setting
      let thinkingConfig: any = undefined;
      const shouldDeepThink = deepThinking ?? (modeConfig.thinkingLevel === 'HIGH');
      if (shouldDeepThink) {
        thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      } else if (modeConfig.thinkingLevel === 'LOW') {
        thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      }

      // Configure tools (Google Search Grounding for true, up-to-date facts)
      const tools: any[] = [];
      const shouldSearchWeb = useGoogleSearch ?? modeConfig.useGoogleSearch;
      if (shouldSearchWeb) {
        tools.push({ googleSearch: {} });
      }

      // Stream generation helper
      async function createStream(modelName: string, withTools: boolean) {
        return await ai.models.generateContentStream({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: modeConfig.temperature,
            ...(thinkingConfig ? { thinkingConfig } : {}),
            ...(withTools && tools.length > 0 ? { tools } : {}),
          },
        });
      }

      // Helper for OpenRouter free chat streaming fallback
      async function tryOpenRouterFreeChat(): Promise<boolean> {
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        if (!openRouterKey) return false;

        try {
          const openRouterMessages = [
            { role: 'system', content: systemInstruction },
            ...messages.map((m: any) => ({
              role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
              content: typeof m.content === 'string' ? m.content : '',
            })),
          ];

          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://lionfinity.ai',
              'X-Title': 'Lionfinity AI',
            },
            body: JSON.stringify({
              model: 'meta-llama/llama-3.3-70b-instruct:free',
              messages: openRouterMessages,
              stream: true,
            }),
          });

          if (!response.ok || !response.body) return false;

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const jsonStr = trimmed.slice(6).trim();
                if (jsonStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
                  }
                } catch {}
              }
            }
          }

          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
          return true;
        } catch {
          return false;
        }
      }

      let responseStream;
      const primaryModel = 'gemini-3.1-flash-lite';

      try {
        if (shouldSearchWeb) {
          try {
            responseStream = await createStream(primaryModel, true);
          } catch {
            // Search tools not supported or quota limit; retry immediately without tools
            responseStream = await createStream(primaryModel, false);
          }
        } else {
          responseStream = await createStream(primaryModel, false);
        }
      } catch (err: any) {
        const errMsg = String(err?.message || err || '');
        const isQuotaOrRateLimit = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');

        if (isQuotaOrRateLimit) {
          // Attempt short delay backoff retry on the primary model
          await new Promise((r) => setTimeout(r, 1200));
          try {
            responseStream = await createStream(primaryModel, false);
          } catch (retryErr) {
            // If still rate limited and OpenRouter free model is available, fall back to OpenRouter free tier
            const didFallback = await tryOpenRouterFreeChat();
            if (didFallback) return;
            throw retryErr;
          }
        } else {
          throw err;
        }
      }

      for await (const chunk of responseStream) {
        const candidate = chunk.candidates?.[0];

        // Check if there are parts with thought or text
        if (candidate?.content?.parts && Array.isArray(candidate.content.parts)) {
          for (const part of candidate.content.parts) {
            if ((part as any).thought) {
              res.write(`data: ${JSON.stringify({ thought: part.text || '' })}\n\n`);
            } else if (part.text) {
              res.write(`data: ${JSON.stringify({ text: part.text })}\n\n`);
            }
          }
        } else if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }

        // Extract Google Search Grounding metadata
        const grounding = candidate?.groundingMetadata;
        if (grounding) {
          const webSources: Array<{ title: string; url: string }> = [];
          if (Array.isArray(grounding.groundingChunks)) {
            for (const g of grounding.groundingChunks) {
              if (g.web?.uri) {
                webSources.push({
                  title: g.web.title || new URL(g.web.uri).hostname,
                  url: g.web.uri,
                });
              }
            }
          }
          if (webSources.length > 0) {
            res.write(`data: ${JSON.stringify({ sources: webSources })}\n\n`);
          }
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: any) {
      const raw = err?.message || String(err || '');
      let userFriendlyMessage = 'Ocorreu um erro ao processar sua solicitação com a inteligência artificial.';

      if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota')) {
        userFriendlyMessage = 'Limite temporário de requisições do modelo gratuito atingido. Por favor, aguarde alguns instantes e tente novamente.';
      } else if (raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand')) {
        userFriendlyMessage = 'Servidores de IA sob alta demanda temporária. Por favor, tente novamente em instantes.';
      } else if (raw.includes('API_KEY') || raw.includes('API key')) {
        userFriendlyMessage = 'Chave de API do Gemini não configurada ou inválida.';
      } else {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.error?.message) {
            try {
              const inner = JSON.parse(parsed.error.message);
              userFriendlyMessage = inner?.error?.message || parsed.error.message;
            } catch {
              userFriendlyMessage = parsed.error.message;
            }
          }
        } catch {}
      }

      console.warn('Chat stream notice:', userFriendlyMessage);
      res.write(`data: ${JSON.stringify({ error: userFriendlyMessage, done: true })}\n\n`);
      res.end();
    }
  });

  // Helper function for instant, clean conversational titles without extra API calls/quota
  function extractCleanTitle(message: string): string {
    if (!message || !message.trim()) return 'Nova conversa';
    let text = message.trim();
    // Remove markdown symbols or bullet points
    text = text.replace(/^#+\s*|^[-*•]\s*/, '');
    const firstLine = text.split('\n')[0].trim();
    const cleaned = firstLine
      .replace(/^(olá|oi|por favor|me ajude a|ajude-me a|como posso|como fazer|queria saber|gostaria de|crie um|faça um|descreva|explique)\s+/i, '')
      .trim();
    const chosen = cleaned.length >= 3 ? cleaned : firstLine;
    const capitalized = chosen.charAt(0).toUpperCase() + chosen.slice(1);
    if (capitalized.length <= 38) {
      return capitalized.replace(/[.?!,:;]+$/, '');
    }
    return capitalized.slice(0, 36).trim() + '...';
  }

  // Smart title generation endpoint (instant, zero network cost, zero 429 quota)
  app.post('/api/chat/title', (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        res.json({ title: 'Nova conversa' });
        return;
      }
      const title = extractCleanTitle(message);
      res.json({ title });
    } catch {
      res.json({ title: 'Nova conversa' });
    }
  });

  // Image generation endpoint for Imagens Studio
  app.post('/api/image/generate', async (req: Request, res: Response) => {
    try {
      const { prompt, style = 'photorealistic' } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt de imagem é obrigatório.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      let enhancedPrompt = prompt;
      if (apiKey) {
        try {
          const ai = getGeminiClient();
          const pResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Aprimore este prompt para geração de imagem artística realista em alta definição (retorne apenas o prompt em inglês, sem comentários):\n"${prompt}"`,
          });
          if (pResponse.text) {
            enhancedPrompt = pResponse.text.trim();
          }
        } catch {
          // ignore prompt enhancement error
        }
      }

      // Return generated image metadata with high-res curated placeholder seed or direct render
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`;

      res.json({
        success: true,
        prompt,
        enhancedPrompt,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 15))}/1024/768`,
        createdAt: Date.now(),
      });
    } catch (err: any) {
      console.error('Erro gerando imagem:', err);
      res.status(500).json({ error: 'Não foi possível gerar a imagem no momento.' });
    }
  });

  // Vite middleware in development vs static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🦁 Lionfinity AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Falha crítica ao iniciar servidor:', err);
  process.exit(1);
});
