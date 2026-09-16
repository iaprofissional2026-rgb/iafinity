import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../types/index.ts';
import { LionLogo } from './LionLogo.tsx';
import { CodeBlock } from './CodeBlock.tsx';
import { AudioPlayer } from './AudioPlayer.tsx';
import { downloadMediaFile, textToSpeech } from '../services/mediaApi.ts';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Pencil,
  FileText,
  FileCode,
  File,
  Brain,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Sparkles,
  Download,
  Film,
  Image as ImageIcon,
  Volume2,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  isLast: boolean;
  isGenerating: boolean;
  onRegenerate?: () => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onTransformToVideo?: (imageUrl: string, prompt: string) => void;
  onEditImageAgain?: (imageUrl: string, prompt: string) => void;
  onRetryMedia?: (message: ChatMessage) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isLast,
  isGenerating,
  onRegenerate,
  onEditMessage,
  onTransformToVideo,
  onEditImageAgain,
  onRetryMedia,
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(
    message.liked === true ? 'liked' : message.liked === false ? 'disliked' : null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);
  const [imageTab, setImageTab] = useState<'current' | 'original'>('current');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechUrl, setSpeechUrl] = useState<string | null>(null);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContent.trim() && onEditMessage) {
      onEditMessage(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!message.imageResult?.url) return;
    await downloadMediaFile(message.imageResult.url, 'imagem');
  };

  const handleDownloadVideo = async () => {
    if (!message.videoJob?.videoUrl) return;
    await downloadMediaFile(message.videoJob.videoUrl, 'video');
  };

  // Text-to-speech reader for assistant text
  const handleReadAloud = async () => {
    if (speechUrl) {
      // Toggle or re-play
      return;
    }
    setIsSpeaking(true);
    try {
      const res = await textToSpeech({ text: message.content.slice(0, 800) });
      setSpeechUrl(res.audioUrl);
    } catch (err) {
      console.error('Falha ao ler áudio:', err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const getDomain = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`group w-full py-5 px-4 md:px-6 transition-colors border-b border-[var(--border-subtle)] ${
        isUser ? 'bg-[var(--chat-user-bg)] text-[var(--chat-user-text)]' : 'bg-[var(--chat-ai-bg)] text-[var(--chat-ai-text)]'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-[var(--surface-secondary)] text-[var(--text-primary)] flex items-center justify-center font-bold text-xs shadow-xs border border-[var(--border)]">
              SO
            </div>
          ) : (
            <LionLogo size="sm" />
          )}
        </div>

        {/* Message Content Body */}
        <div className="flex-1 min-w-0">
          {/* Header info (Name & mode) */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-title)]">
                {isUser ? 'Você' : 'Lionfinity AI'}
              </span>
              {!isUser && message.modelMode && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] font-semibold uppercase tracking-wider border border-[var(--border)]">
                  {message.modelMode === 'rapida'
                    ? 'Rápido'
                    : message.modelMode === 'media'
                    ? 'Equilibrado'
                    : 'Alta (Pensamento)'}
                </span>
              )}
              {!isUser && (message.imageResult || message.videoJob || message.audioResult) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/20">
                  100% GRÁTIS
                </span>
              )}
            </div>

            {/* User Edit Trigger */}
            {isUser && !isEditing && onEditMessage && (
              <button
                type="button"
                onClick={() => {
                  setEditContent(message.content);
                  setIsEditing(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-opacity"
                title="Editar mensagem"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Render User Attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-primary)] shadow-xs"
                >
                  {att.previewUrl ? (
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                  ) : att.type === 'pdf' ? (
                    <FileText className="w-5 h-5 text-red-500 shrink-0 ml-1" />
                  ) : att.type === 'text' ? (
                    <FileCode className="w-5 h-5 text-[var(--accent)] shrink-0 ml-1" />
                  ) : (
                    <File className="w-5 h-5 text-blue-500 shrink-0 ml-1" />
                  )}
                  <span className="truncate max-w-[160px] font-medium">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Thought Process (Deep Reasoning Accordion) */}
          {!isUser && message.thought && (
            <div className="mb-3.5 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] overflow-hidden">
              <button
                type="button"
                onClick={() => setIsThoughtOpen(!isThoughtOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-[var(--surface)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    {isGenerating && isLast ? 'Raciocinando passo a passo...' : 'Pensamento Concluído'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--accent-light)] text-[var(--accent)] font-mono">
                    Deep Reasoning
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[var(--text-secondary)] text-xs">
                  <span>{isThoughtOpen ? 'Ocultar' : 'Ver detalhes'}</span>
                  {isThoughtOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {isThoughtOpen && (
                <div className="px-4 py-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] leading-relaxed space-y-2 italic bg-[var(--card)]">
                  <div className="prose max-w-none text-xs text-[var(--text-secondary)]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.thought}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message Box */}
          {message.isError && (
            <div className="my-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold">Modelo gratuito temporariamente indisponível</h4>
                  <p className="text-xs opacity-90">{message.content}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => (onRetryMedia ? onRetryMedia(message) : onRegenerate?.())}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-amber-500 text-white font-medium text-xs hover:bg-amber-600 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tentar novamente</span>
              </button>
            </div>
          )}

          {/* Multimodal: IMAGE RESULT */}
          {message.imageResult && (
            <div className="my-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
              {/* Header with tabs if original image exists */}
              {message.imageResult.originalUrl && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-[var(--surface-secondary)] border-b border-[var(--border-subtle)]">
                  <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Comparação:
                  </span>
                  <button
                    type="button"
                    onClick={() => setImageTab('current')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      imageTab === 'current'
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Imagem Editada (Depois)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('original')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      imageTab === 'original'
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Original (Antes)
                  </button>
                </div>
              )}

              {/* Main Image Display */}
              <div className="relative bg-black/5 flex items-center justify-center overflow-hidden">
                <img
                  src={
                    imageTab === 'original' && message.imageResult.originalUrl
                      ? message.imageResult.originalUrl
                      : message.imageResult.url
                  }
                  alt={message.imageResult.prompt}
                  className="w-full max-h-[540px] object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Image Footer & Actions */}
              <div className="p-3.5 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-[11px] text-[var(--text-secondary)]">
                    <span className="font-mono">{message.imageResult.model.split('/').pop()}</span>
                    <span>•</span>
                    <span>{message.imageResult.aspectRatio || '1:1'}</span>
                    {message.imageResult.style && (
                      <>
                        <span>•</span>
                        <span>{message.imageResult.style}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={handleDownloadImage}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-medium transition-colors"
                      title="Baixar imagem em alta resolução"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar</span>
                    </button>

                    {onEditImageAgain && (
                      <button
                        type="button"
                        onClick={() =>
                          onEditImageAgain(message.imageResult!.url, message.imageResult!.prompt)
                        }
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-xs font-medium transition-colors"
                        title="Continuar editando esta imagem"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    )}

                    {onTransformToVideo && (
                      <button
                        type="button"
                        onClick={() =>
                          onTransformToVideo(message.imageResult!.url, message.imageResult!.prompt)
                        }
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[var(--accent)] text-white hover:brightness-110 text-xs font-medium transition-all shadow-xs"
                        title="Transformar esta imagem em vídeo animado com Kling"
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>Transformar em vídeo</span>
                      </button>
                    )}
                  </div>
                </div>

                {message.imageResult.enhancedPrompt && (
                  <p className="text-[11px] text-[var(--text-muted)] italic">
                    Prompt otimizado: {message.imageResult.enhancedPrompt}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Multimodal: VIDEO JOB RESULT */}
          {message.videoJob && (
            <div className="my-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
              {/* If Processing / Pending */}
              {(message.videoJob.status === 'pending' ||
                message.videoJob.status === 'processing') && (
                <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center animate-pulse">
                    <Film className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-main)] mb-1">
                      {message.videoJob.status === 'pending'
                        ? 'Preparando geração de vídeo...'
                        : 'Gerando vídeo cinematográfico com Kling Free...'}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] max-w-sm">
                      Processando vídeo em tempo real na nuvem sem custos. Isso pode levar alguns segundos.
                    </p>
                  </div>

                  {/* Real Status Steps (No Fake Percentages) */}
                  <div className="w-full max-w-xs space-y-2 pt-2">
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500" />
                        Prompt e modelo validados
                      </span>
                      <span className="font-mono text-emerald-500">100% GRÁTIS</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[var(--accent)] font-medium">
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Renderizando frames na GPU
                      </span>
                      <span>Em andamento</span>
                    </div>
                  </div>
                </div>
              )}

              {/* If Completed */}
              {message.videoJob.status === 'completed' && message.videoJob.videoUrl && (
                <div>
                  <div className="bg-black flex items-center justify-center">
                    <video
                      src={message.videoJob.videoUrl}
                      controls
                      playsInline
                      className="w-full max-h-[500px] object-contain"
                    />
                  </div>

                  <div className="p-3.5 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-[11px] text-[var(--text-secondary)] font-mono">
                      <span>{message.videoJob.model.split('/').pop()}</span>
                      <span>•</span>
                      <span>{message.videoJob.duration || 5}s</span>
                      <span>•</span>
                      <span>{message.videoJob.aspectRatio || '16:9'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleDownloadVideo}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:brightness-110 text-xs font-medium transition-all shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar vídeo</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* If Failed */}
              {message.videoJob.status === 'failed' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">
                      {message.videoJob.error || 'Modelo gratuito temporariamente indisponível.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRetryMedia?.(message)}
                    className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Multimodal: AUDIO RESULT */}
          {message.audioResult && (
            <AudioPlayer
              src={message.audioResult.audioUrl}
              title={message.audioResult.text.slice(0, 60)}
              subtitle={message.audioResult.model}
              autoPlay={false}
            />
          )}

          {/* Inline Speech Player if user requested "Ouvir" */}
          {speechUrl && (
            <AudioPlayer
              src={speechUrl}
              title="Leitura em voz da resposta"
              subtitle="Fish Audio S2.1 Free"
              autoPlay={true}
            />
          )}

          {/* Standard Text Markdown Content */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-[var(--card)] border border-[var(--accent)] text-[var(--text-primary)] text-sm outline-none resize-y"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-xs"
                >
                  Salvar e enviar
                </button>
              </div>
            </form>
          ) : (
            message.content &&
            !message.isError && (
              <div className="prose max-w-none text-[var(--text-primary)] text-[15px] leading-relaxed break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match && !String(children).includes('\n');

                      if (isInline) {
                        return (
                          <code
                            className="px-1.5 py-0.5 rounded-md bg-[var(--surface-secondary)] text-[var(--accent)] font-mono text-xs font-medium border border-[var(--border)]"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <CodeBlock
                          language={match ? match[1] : ''}
                          value={String(children).replace(/\n$/, '')}
                        />
                      );
                    },
                    table({ children }: any) {
                      return (
                        <div className="overflow-x-auto my-4 rounded-xl border border-[var(--border)]">
                          <table className="w-full text-left text-sm border-collapse">{children}</table>
                        </div>
                      );
                    },
                    th({ children }: any) {
                      return (
                        <th className="px-4 py-2.5 bg-[var(--surface-secondary)] font-semibold text-[var(--text-title)] border-b border-[var(--border)]">
                          {children}
                        </th>
                      );
                    },
                    td({ children }: any) {
                      return (
                        <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] text-[var(--text-primary)]">
                          {children}
                        </td>
                      );
                    },
                    blockquote({ children }: any) {
                      return (
                        <blockquote className="border-l-4 border-[var(--accent)] pl-4 py-1 italic text-[var(--text-secondary)] my-3">
                          {children}
                        </blockquote>
                      );
                    },
                    a({ href, children }: any) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accent-hover)]"
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>

                {/* Streaming Indicator */}
                {!isUser && isLast && isGenerating && (
                  <span className="inline-flex items-center gap-2 text-xs text-[var(--accent)] font-medium ml-1 mt-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
                    <span className="animate-pulse">Buscando informações e gerando resposta completa...</span>
                  </span>
                )}
              </div>
            )
          )}

          {/* Web Search Sources / Grounding Citations */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] mb-2">
                <Globe className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Fontes factuais verificadas na Web (Google Search Grounding):</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {message.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all group/src"
                  >
                    <span className="text-[11px] font-mono text-[var(--placeholder)]">[{idx + 1}]</span>
                    <span className="truncate max-w-[200px] font-medium">{src.title || getDomain(src.uri)}</span>
                    <ExternalLink className="w-3 h-3 text-[var(--text-secondary)] group-hover/src:text-[var(--accent)] shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* AI Action Buttons */}
          {!isUser && !isGenerating && !message.isError && (
            <div className="flex items-center gap-1 mt-3 pt-1 border-t border-[var(--border)] flex-wrap">
              {/* Copy text */}
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
                title="Copiar resposta"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span className="text-[var(--accent)] text-[11px]">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copiar</span>
                  </>
                )}
              </button>

              {/* Read Aloud (Ouvir) */}
              {message.content && !message.audioResult && (
                <button
                  type="button"
                  onClick={handleReadAloud}
                  disabled={isSpeaking}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
                  title="Ouvir resposta em voz"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-bounce text-[var(--accent)]' : ''}`} />
                  <span className="text-[11px]">{isSpeaking ? 'Gerando voz...' : 'Ouvir'}</span>
                </button>
              )}

              {/* Like */}
              <button
                type="button"
                onClick={() => setFeedback(feedback === 'liked' ? null : 'liked')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  feedback === 'liked'
                    ? 'text-[var(--accent)] bg-[var(--accent-light)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                }`}
                title="Boa resposta"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              {/* Dislike */}
              <button
                type="button"
                onClick={() => setFeedback(feedback === 'disliked' ? null : 'disliked')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  feedback === 'disliked'
                    ? 'text-red-500 bg-red-500/10'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                }`}
                title="Resposta ruim"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              {/* Regenerate */}
              {onRegenerate && isLast && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors ml-1"
                  title="Regenerar resposta"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Regenerar</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
