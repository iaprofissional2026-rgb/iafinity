import React, { useState, useEffect } from 'react';
import { X, Search, Bookmark, Copy, Check, ArrowUpRight, Plus, FolderHeart } from 'lucide-react';
import { storage } from '../services/storage.ts';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [prompts, setPrompts] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPrompts(storage.getLibrary());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['Todos', 'Programação', 'Pesquisa', 'Marketing', 'Vídeo'];

  const filtered = prompts.filter((p) => {
    const matchesCat = activeCategory === 'Todos' || p.category === activeCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.prompt.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-title)]">Biblioteca de Prompts & Conhecimento</h2>
              <p className="text-xs text-[var(--text-secondary)]">Coleção de instruções prontas de alto impacto.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-secondary)] flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--placeholder)] absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar prompt por título ou conteúdo..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--placeholder)] text-xs focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Prompts list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-secondary)] text-xs">
              Nenhum prompt encontrado para esta categoria ou busca.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-title)]">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--accent-light)] text-[var(--accent)] font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item.id, item.prompt)}
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors"
                      title="Copiar prompt"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onSelectPrompt(item.prompt);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Usar no chat</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {item.prompt}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
