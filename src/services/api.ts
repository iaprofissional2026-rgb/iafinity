import { ChatMessage, ModelMode, GroundingSource } from '../types/index.ts';

export interface StreamChatParams {
  messages: ChatMessage[];
  modelMode: ModelMode;
  deepThinking?: boolean;
  useGoogleSearch?: boolean;
  memory?: string;
  responseStyle?: 'concise' | 'balanced' | 'detailed';
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
  onThought?: (thoughtChunk: string) => void;
  onSources?: (sources: GroundingSource[]) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

export async function streamChat({
  messages,
  modelMode,
  deepThinking,
  useGoogleSearch,
  memory,
  responseStyle,
  signal,
  onChunk,
  onThought,
  onSources,
  onError,
  onDone,
}: StreamChatParams): Promise<void> {
  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        modelMode,
        deepThinking,
        useGoogleSearch,
        memory,
        responseStyle,
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Nenhum fluxo de resposta recebido do servidor.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const jsonStr = trimmed.replace(/^data:\s*/, '');
        try {
          const parsed = JSON.parse(jsonStr);

          if (parsed.error) {
            onError(parsed.error);
            return;
          }

          if (parsed.thought && onThought) {
            onThought(parsed.thought);
          }

          if (parsed.sources && onSources && Array.isArray(parsed.sources)) {
            onSources(parsed.sources);
          }

          if (parsed.text) {
            onChunk(parsed.text);
          }

          if (parsed.done) {
            onDone();
            return;
          }
        } catch {
          // Incomplete JSON or chunk boundary, continue
        }
      }
    }

    onDone();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      // User aborted stream cleanly
      onDone();
      return;
    }
    console.error('Falha no streaming do chat:', err);
    onError(err.message || 'Erro inesperado ao se conectar com o servidor.');
  }
}

export async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const res = await fetch('/api/chat/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: firstMessage }),
    });

    if (!res.ok) throw new Error('Falha ao gerar título');
    const data = await res.json();
    return data.title || 'Nova conversa';
  } catch (err) {
    console.warn('Erro ao gerar título inteligente, usando fallback:', err);
    return firstMessage.slice(0, 24).trim() || 'Nova conversa';
  }
}
