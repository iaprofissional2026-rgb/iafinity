import React, { useState } from 'react';
import { X, Sparkles, Download, ArrowUpRight, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (imageUrl: string, prompt: string) => void;
}

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{ id: string; url: string; prompt: string; createdAt: number }>>([
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      prompt: 'Leão cibernético dourado com circuitos holográficos em alta resolução 8K',
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'img-2',
      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      prompt: 'Pintura a óleo renascentista com iluminação dramática chiaroscuro',
      createdAt: Date.now() - 7200000,
    },
  ]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        const newImg = {
          id: `img-${Date.now()}`,
          url: data.imageUrl,
          prompt,
          createdAt: Date.now(),
        };
        setGeneratedImages((prev) => [newImg, ...prev]);
        setPrompt('');
      }
    } catch (err) {
      console.error('Falha gerando imagem:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center font-bold">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[var(--text-title)]">Estúdio de Imagens</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/30">
                  ATUALIZADO
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">Gere ilustrações, artes e fotos realistas em alta definição.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="p-6 border-b border-[var(--border)] bg-[var(--surface-secondary)]">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva a imagem que você deseja criar..."
              className="flex-1 px-4 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--placeholder)] text-sm focus:outline-none focus:border-[var(--accent)]"
            />
            <div className="flex items-center gap-2">
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="px-3 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs focus:outline-none"
              >
                <option value="1:1">1:1 Quadrado</option>
                <option value="16:9">16:9 Widescreen</option>
                <option value="9:16">9:16 Stories/Reels</option>
              </select>
              <button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="px-5 py-3 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 transition-all shrink-0 shadow-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Imagem</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Gallery */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {generatedImages.map((img) => (
              <div
                key={img.id}
                className="group relative rounded-2xl overflow-hidden bg-[var(--surface-secondary)] border border-[var(--border)] flex flex-col"
              >
                <div className="aspect-video w-full overflow-hidden bg-neutral-900 relative">
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                      title="Baixar imagem"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {onSendToChat && (
                      <button
                        onClick={() => {
                          onSendToChat(img.url, img.prompt);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-full bg-[var(--accent)] text-white text-xs font-medium flex items-center gap-1.5 hover:bg-[var(--accent-hover)] transition-colors shadow-xs"
                        title="Enviar para o chat"
                      >
                        <span>Usar no chat</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{img.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
