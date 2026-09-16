import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types/index.ts';
import { storage } from '../services/storage.ts';
import { downloadMediaFile } from '../services/mediaApi.ts';
import { X, Image as ImageIcon, Film, Volume2, Download, Trash2, ArrowUpRight, Check, Sparkles } from 'lucide-react';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReuseInChat: (item: GalleryItem) => void;
}

type FilterTab = 'all' | 'image' | 'video' | 'audio';

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  onReuseInChat,
}) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setItems(storage.getGallery());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storage.deleteGalleryItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleDownload = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const typeMap = {
      image: 'imagem',
      video: 'video',
      audio: 'audio',
    } as const;
    await downloadMediaFile(item.url, typeMap[item.type]);
  };

  const handleCopyPrompt = (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-5xl max-h-[88vh] flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-sidebar)]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Galeria Multimídia</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Seus conteúdos gerados com modelos gratuitos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]">
          {(
            [
              { id: 'all', label: 'Tudo' },
              { id: 'image', label: 'Imagens', icon: ImageIcon },
              { id: 'video', label: 'Vídeos', icon: Film },
              { id: 'audio', label: 'Áudios', icon: Volume2 },
            ] as const
          ).map((tab) => {
            const Icon = (tab as any).icon;
            const count = items.filter((i) => tab.id === 'all' || i.type === tab.id).length;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
                <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20' : 'bg-[var(--border-subtle)] text-[var(--text-muted)]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[360px]">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 border border-dashed border-[var(--border-subtle)] rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-muted)] mb-3">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[var(--text-main)] mb-1">
                Nenhuma mídia gerada ainda
              </p>
              <p className="text-xs text-[var(--text-muted)] max-w-sm">
                Use o botão "+" na caixa de mensagem para criar imagens com Recraft, vídeos com Kling ou áudios com Fish Audio 100% gratuitos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group relative flex flex-col bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all overflow-hidden cursor-pointer shadow-xs"
                >
                  {/* Media Preview Box */}
                  <div className="relative aspect-video bg-black/10 flex items-center justify-center overflow-hidden">
                    {item.type === 'image' && (
                      <img
                        src={item.url}
                        alt={item.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {item.type === 'video' && (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                      />
                    )}

                    {item.type === 'audio' && (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-sidebar)] p-4 text-[var(--accent-primary)]">
                        <Volume2 className="w-10 h-10 mb-2" />
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">Áudio Gerado</span>
                      </div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-2 left-2 flex items-center space-x-1">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-xs text-white">
                        {item.type}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/90 text-white">
                        GRÁTIS
                      </span>
                    </div>

                    {/* Hover Action Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        onClick={(e) => handleDownload(item, e)}
                        title="Baixar arquivo"
                        className="p-2 rounded-lg bg-white/20 hover:bg-white text-white hover:text-black transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReuseInChat(item);
                          onClose();
                        }}
                        title="Usar no chat"
                        className="p-2 rounded-lg bg-[var(--accent-primary)] text-white hover:brightness-110 transition-all"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        title="Excluir da galeria"
                        className="p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata & Prompt */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-[var(--text-main)] line-clamp-2 leading-relaxed font-normal mb-2">
                      {item.prompt}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-2">
                      <span className="truncate max-w-[130px] font-mono">{item.model.split('/').pop()}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Detail Lightbox */}
        {selectedItem && (
          <div
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-[var(--bg-main)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-black/30 text-white hover:bg-black/50 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4 rounded-xl overflow-hidden bg-black/10 flex items-center justify-center max-h-[50vh]">
                {selectedItem.type === 'image' && (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.prompt}
                    className="max-h-[50vh] object-contain w-auto mx-auto"
                    referrerPolicy="no-referrer"
                  />
                )}
                {selectedItem.type === 'video' && (
                  <video
                    src={selectedItem.url}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[50vh] w-full"
                  />
                )}
                {selectedItem.type === 'audio' && (
                  <div className="p-8 w-full">
                    <audio src={selectedItem.url} controls className="w-full" autoPlay />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                      {selectedItem.type.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-500">
                      100% GRÁTIS
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      {selectedItem.model}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleCopyPrompt(selectedItem, e)}
                      className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-xs font-medium flex items-center space-x-1"
                    >
                      {copiedId === selectedItem.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <span>Copiar Prompt</span>
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDownload(selectedItem, e)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white hover:brightness-110 text-xs font-medium flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar</span>
                    </button>
                  </div>
                </div>

                <div className="bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Prompt utilizado:</p>
                  <p className="text-sm text-[var(--text-main)]">{selectedItem.prompt}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
