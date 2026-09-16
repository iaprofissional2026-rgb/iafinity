import React, { useState, useRef, useEffect } from 'react';
import { Attachment, ComposerToolMode } from '../types/index.ts';
import { enhancePrompt } from '../services/mediaApi.ts';
import {
  Plus,
  ArrowUp,
  Square,
  Mic,
  MicOff,
  Image as ImageIcon,
  Film,
  Volume2,
  Paperclip,
  FileText,
  FileCode,
  File,
  X,
  Sparkles,
  Wrench,
  Search,
  Check,
  Ratio,
  Clock,
  Music,
  Palette,
} from 'lucide-react';

interface ToolOptions {
  style?: string;
  aspectRatio?: string;
  quality?: string;
  duration?: number;
  generateAudio?: boolean;
  voice?: string;
  sourceImage?: string;
}

interface MessageInputProps {
  onSendMessage: (
    content: string,
    attachments: Attachment[],
    toolMode?: ComposerToolMode,
    toolOptions?: ToolOptions
  ) => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  memoryActive?: boolean;
  activeToolMode?: ComposerToolMode;
  onToolModeChange?: (mode: ComposerToolMode) => void;
  initialContent?: string;
  initialSourceImage?: string;
}

const IMAGE_STYLES = [
  'Automático',
  'Fotográfico',
  'Realista',
  'Cinematográfico',
  'Ilustração',
  '3D',
  'Produto',
  'Logo',
  'Social Media',
];

const IMAGE_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];

const VIDEO_RATIOS = [
  { id: '16:9', label: '16:9 YouTube' },
  { id: '9:16', label: '9:16 Shorts/TikTok' },
  { id: '1:1', label: '1:1 Social' },
];

const VIDEO_DURATIONS = [3, 5, 8, 10];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isGenerating,
  onStopGeneration,
  memoryActive = false,
  activeToolMode: controlledToolMode,
  onToolModeChange,
  initialContent = '',
  initialSourceImage,
}) => {
  const [content, setContent] = useState(initialContent);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [toolMode, setToolMode] = useState<ComposerToolMode>(controlledToolMode || 'chat');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Tool specific options
  const [imageStyle, setImageStyle] = useState('Automático');
  const [imageRatio, setImageRatio] = useState('1:1');
  const [imageQuality, setImageQuality] = useState('Alta');
  const [videoRatio, setVideoRatio] = useState('16:9');
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoWithAudio, setVideoWithAudio] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | undefined>(initialSourceImage);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync controlled tool mode if passed
  useEffect(() => {
    if (controlledToolMode) {
      setToolMode(controlledToolMode);
    }
  }, [controlledToolMode]);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  useEffect(() => {
    if (initialSourceImage) {
      setSourceImage(initialSourceImage);
    }
  }, [initialSourceImage]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [content]);

  // Click outside to close menus
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectMode = (mode: ComposerToolMode) => {
    setToolMode(mode);
    onToolModeChange?.(mode);
    setIsMenuOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSend = () => {
    if (isGenerating) {
      onStopGeneration();
      return;
    }

    if (!content.trim() && attachments.length === 0 && !sourceImage) return;

    const options: ToolOptions = {};
    if (toolMode === 'image') {
      options.style = imageStyle;
      options.aspectRatio = imageRatio;
      options.quality = imageQuality;
      options.sourceImage = sourceImage || (attachments.find((a) => a.type === 'image')?.data);
    } else if (toolMode === 'video') {
      options.aspectRatio = videoRatio;
      options.duration = videoDuration;
      options.generateAudio = videoWithAudio;
      options.sourceImage = sourceImage || (attachments.find((a) => a.type === 'image')?.data);
    } else if (toolMode === 'audio') {
      options.voice = 'Fish Audio S2.1 Free';
    }

    onSendMessage(content.trim(), attachments, toolMode, options);

    setContent('');
    setAttachments([]);
    setSourceImage(undefined);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Reset tool mode back to chat after send
    setToolMode('chat');
    onToolModeChange?.('chat');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Psychological prompt enhancement
  const handleEnhance = async () => {
    if (!content.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(content, imageStyle);
      setContent(enhanced);
    } catch (err) {
      console.warn('Falha ao aprimorar prompt:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (file.size > 25 * 1024 * 1024) {
        alert(`O arquivo ${file.name} ultrapassa o limite de 25MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        let type: Attachment['type'] = 'document';

        if (file.type.startsWith('image/')) {
          type = 'image';
          if (toolMode === 'video' || toolMode === 'image') {
            setSourceImage(base64Data);
          }
        } else if (file.type === 'application/pdf') {
          type = 'pdf';
        } else if (
          file.type.startsWith('text/') ||
          file.name.endsWith('.md') ||
          file.name.endsWith('.txt') ||
          file.name.endsWith('.ts') ||
          file.name.endsWith('.js') ||
          file.name.endsWith('.json')
        ) {
          type = 'text';
        }

        const newAttachment: Attachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          type,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          data: base64Data,
          previewUrl: type === 'image' ? base64Data : undefined,
        };

        setAttachments((prev) => [...prev, newAttachment]);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
    setIsMenuOpen(false);
  };

  const triggerFileSelect = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Speech to Text (Microphone)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz direto. Utilize Chrome ou Edge.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event: any) => {
        console.error('Erro no microfone:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Falha ao iniciar microfone:', err);
      setIsRecording(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Dynamic placeholder based on active mode
  const getPlaceholder = () => {
    switch (toolMode) {
      case 'image':
        return sourceImage
          ? 'Descreva as alterações que deseja na imagem (ex: remova o fundo, iluminação profissional...)'
          : 'Descreva a imagem que deseja criar';
      case 'video':
        return sourceImage
          ? 'Descreva a animação a partir deste primeiro frame...'
          : 'Descreva o vídeo que deseja criar';
      case 'audio':
        return 'Digite o texto que deseja transformar em voz';
      default:
        return 'Pergunte qualquer coisa';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 select-none">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-3xl bg-[var(--input-bg)] border transition-all duration-200 shadow-xs ${
          isDragging
            ? 'border-[var(--accent)] ring-2 ring-[var(--accent-light)]'
            : 'border-[var(--border)] focus-within:border-[var(--accent)] focus-within:shadow-md'
        }`}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Active Tool Mode Header Bar */}
        {toolMode !== 'chat' && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 pt-2.5 pb-1 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/50 rounded-t-3xl">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent)] text-white shadow-xs">
                {toolMode === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
                {toolMode === 'video' && <Film className="w-3.5 h-3.5" />}
                {toolMode === 'audio' && <Volume2 className="w-3.5 h-3.5" />}
                <span>
                  {toolMode === 'image' && 'Criar Imagem (Recraft Free)'}
                  {toolMode === 'video' && 'Criar Vídeo (Kling Free)'}
                  {toolMode === 'audio' && 'Criar Voz (Fish Audio Free)'}
                </span>
              </span>

              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                100% GRÁTIS
              </span>
            </div>

            {/* Tool Specific Quick Selectors */}
            <div className="flex items-center space-x-2 text-xs">
              {toolMode === 'image' && (
                <>
                  {/* Style selector */}
                  <select
                    value={imageStyle}
                    onChange={(e) => setImageStyle(e.target.value)}
                    className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                  >
                    {IMAGE_STYLES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  {/* Ratio selector */}
                  <select
                    value={imageRatio}
                    onChange={(e) => setImageRatio(e.target.value)}
                    className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                  >
                    {IMAGE_RATIOS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  {/* Prompt Enhance button */}
                  <button
                    type="button"
                    onClick={handleEnhance}
                    disabled={!content.trim() || isEnhancing}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 text-[var(--accent)] font-medium text-xs disabled:opacity-40 transition-colors"
                    title="Aprimorar prompt psicologicamente sem alterar a intenção original"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isEnhancing ? 'Aprimorando...' : 'Melhorar prompt'}</span>
                  </button>
                </>
              )}

              {toolMode === 'video' && (
                <>
                  {/* Video ratio */}
                  <select
                    value={videoRatio}
                    onChange={(e) => setVideoRatio(e.target.value)}
                    className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                  >
                    {VIDEO_RATIOS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>

                  {/* Duration */}
                  <select
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    className="bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                  >
                    {VIDEO_DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} s
                      </option>
                    ))}
                  </select>

                  {/* Audio checkbox */}
                  <label className="flex items-center space-x-1.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={videoWithAudio}
                      onChange={(e) => setVideoWithAudio(e.target.checked)}
                      className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-0 cursor-pointer"
                    />
                    <span>Com áudio</span>
                  </label>
                </>
              )}

              {/* Close / Return to Chat Button */}
              <button
                type="button"
                onClick={() => selectMode('chat')}
                className="p-1 rounded-lg hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Voltar para chat normal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Source image preview (for Image editing or Image-to-Video) */}
        {sourceImage && (
          <div className="flex items-center gap-2 p-3 pb-0">
            <div className="relative group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-primary)]">
              <img
                src={sourceImage}
                alt="Referência"
                className="w-8 h-8 object-cover rounded-lg"
              />
              <div className="flex flex-col">
                <span className="font-medium text-xs">
                  {toolMode === 'video' ? 'Primeiro frame do vídeo' : 'Imagem de referência para edição'}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">Pronto para processar</span>
              </div>
              <button
                type="button"
                onClick={() => setSourceImage(undefined)}
                className="p-1 rounded-full hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)]"
                title="Remover imagem de referência"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex items-center gap-2 p-3 pb-0 flex-wrap overflow-x-auto">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative group flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
              >
                {att.previewUrl ? (
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="w-6 h-6 object-cover rounded-md"
                  />
                ) : att.type === 'pdf' ? (
                  <FileText className="w-4 h-4 text-red-500" />
                ) : att.type === 'text' ? (
                  <FileCode className="w-4 h-4 text-[var(--accent)]" />
                ) : (
                  <File className="w-4 h-4 text-blue-500" />
                )}

                <div className="flex flex-col min-w-0 max-w-[130px]">
                  <span className="truncate font-medium">{att.name}</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {formatFileSize(att.size)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea Input Area */}
        <div className="flex items-start px-3.5 pt-3">
          {/* Plus Button with Clean Modern Dropdown */}
          <div className="relative shrink-0 mt-0.5" ref={menuRef}>
            <button
              id="btn-composer-attach"
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
              title="Central Multimídia (+)"
            >
              <Plus className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <div
                id="composer-attach-dropdown"
                className="absolute left-0 bottom-10 w-64 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-2.5 py-1 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Central Multimídia
                </div>

                {/* 1. Arquivo */}
                <button
                  type="button"
                  onClick={() => triggerFileSelect('*/*')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Paperclip className="w-4 h-4 text-blue-500" />
                    <span>Arquivo</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)]">Doc/PDF</span>
                </button>

                {/* 2. Criar imagem */}
                <button
                  type="button"
                  onClick={() => selectMode('image')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-4 h-4 text-[var(--accent)]" />
                    <span>Criar imagem</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-500">GRÁTIS</span>
                </button>

                {/* 3. Criar vídeo */}
                <button
                  type="button"
                  onClick={() => selectMode('video')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Film className="w-4 h-4 text-purple-500" />
                    <span>Criar vídeo</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-500">GRÁTIS</span>
                </button>

                {/* 4. Criar áudio */}
                <button
                  type="button"
                  onClick={() => selectMode('audio')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-amber-500" />
                    <span>Criar áudio</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-500">GRÁTIS</span>
                </button>
              </div>
            )}
          </div>

          {/* Core Text Input */}
          <textarea
            id="composer-textarea"
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className="flex-1 min-w-0 mx-2 py-1.5 bg-transparent border-0 outline-none text-[var(--text-primary)] placeholder-[var(--placeholder)] text-sm md:text-base resize-none custom-scrollbar leading-relaxed"
          />
        </div>

        {/* Bottom Toolbar & Action Controls */}
        <div className="flex items-center justify-between px-3.5 pb-2.5 pt-1">
          <div className="flex items-center gap-1.5">
            {/* Tools Menu Trigger */}
            <div className="relative" ref={toolsRef}>
              <button
                id="btn-composer-tools"
                type="button"
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors border border-[var(--border)]"
              >
                <Wrench className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Ferramentas</span>
                {webSearchEnabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                )}
              </button>

              {isToolsOpen && (
                <div
                  id="composer-tools-dropdown"
                  className="absolute left-0 bottom-9 w-64 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Recursos Ativos
                  </div>

                  <button
                    type="button"
                    onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs hover:bg-[var(--surface-secondary)] text-[var(--text-primary)]"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-[var(--accent)]" />
                      <span>Pesquisa Grounding</span>
                    </div>
                    {webSearchEnabled && <Check className="w-4 h-4 text-[var(--accent)]" />}
                  </button>

                  <div className="px-2.5 py-2 text-xs text-[var(--text-secondary)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Modo Gratuito Ativo</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500">CUSTO ZERO</span>
                  </div>

                  {memoryActive && (
                    <div className="px-2.5 py-1 text-[11px] text-[var(--accent)] font-medium">
                      ✓ Memória do assistente conectada
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Voice Input (Microphone) - Reviews speech before sending */}
            <button
              id="btn-composer-mic"
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-1.5 rounded-full transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
              title={isRecording ? 'Parar gravação' : 'Falar mensagem (voz vira texto para revisão)'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Send / Stop Generation Button */}
          <div>
            {isGenerating ? (
              <button
                id="btn-composer-stop"
                type="button"
                onClick={onStopGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--danger)] hover:bg-[var(--danger-hover)] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                title="Parar geração"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Parar geração</span>
              </button>
            ) : (
              <button
                id="btn-composer-send"
                type="button"
                disabled={!content.trim() && attachments.length === 0 && !sourceImage}
                onClick={handleSend}
                className="w-8 h-8 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:hover:bg-[var(--accent)] text-white flex items-center justify-center shadow-xs transition-all active:scale-95"
                title="Enviar mensagem (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-2 text-[11px] text-[var(--placeholder)]">
        Lionfinity AI Assistente Multimodal Gratuito. Verifique informações importantes.
      </div>
    </div>
  );
};
