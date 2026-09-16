import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Box, BookOpen, Video, Palette, ArrowRight, MessageSquare } from 'lucide-react';
import { storage } from '../services/storage.ts';
import { ChatSession } from '../types/index.ts';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatSession[];
  onOpenChat: (chatId: string) => void;
  onCreateChatInProject?: (projectTitle: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  chats,
  onOpenChat,
  onCreateChatInProject,
}) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProjects(storage.getProjects());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newProj = {
      id: `proj-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Projeto personalizado Lionfinity.',
      icon: 'cube',
      createdAt: Date.now(),
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    storage.saveProjects(updated);
    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'book':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-red-400" />;
      case 'palette':
        return <Palette className="w-4 h-4 text-pink-400" />;
      default:
        return <Box className="w-4 h-4 text-blue-400" />;
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const relatedChats = chats.filter((c) =>
    selectedProject ? c.title.toLowerCase().includes(selectedProject.title.toLowerCase().split(' ')[0]) : false
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-title)]">Projetos & Espaços de Trabalho</h2>
              <p className="text-xs text-[var(--text-secondary)]">Organize conversas, contextos e objetivos por projeto.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-6 py-3 border-b border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)] font-medium">{projects.length} projetos ativos</span>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-3 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </button>
        </div>

        {/* Create form */}
        {isCreating && (
          <form onSubmit={handleCreateProject} className="p-4 border-b border-[var(--border)] bg-[var(--surface)] flex flex-col gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nome do projeto (ex: Lançamento SaaS)..."
              className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--placeholder)] text-xs focus:outline-none focus:border-[var(--accent)]"
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Descrição breve dos objetivos..."
              className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--placeholder)] text-xs focus:outline-none focus:border-[var(--accent)]"
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold"
              >
                Salvar
              </button>
            </div>
          </form>
        )}

        {/* Projects Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 custom-scrollbar">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id === selectedProjectId ? null : proj.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedProjectId === proj.id
                  ? 'bg-[var(--accent-light)] border-[var(--accent)] shadow-md'
                  : 'bg-[var(--surface-secondary)] border-[var(--border)] hover:border-[var(--accent)]/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                    {getIcon(proj.icon)}
                  </div>
                  <span className="text-[10px] text-[var(--placeholder)] font-mono">
                    {new Date(proj.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--text-title)] mb-1">{proj.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{proj.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[var(--placeholder)] text-[11px]">Abrir detalhes</span>
                <div className="flex items-center gap-1 text-[var(--accent)] font-medium">
                  <span>Explorar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Related chats drawer if selected */}
        {selectedProject && (
          <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-secondary)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[var(--text-title)]">
                Conversas vinculadas a &ldquo;{selectedProject.title}&rdquo;:
              </span>
              {onCreateChatInProject && (
                <button
                  onClick={() => {
                    onCreateChatInProject(selectedProject.title);
                    onClose();
                  }}
                  className="text-xs text-[var(--accent)] hover:underline font-semibold"
                >
                  + Iniciar chat neste projeto
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {relatedChats.length === 0 ? (
                <span className="text-xs text-[var(--text-secondary)]">Nenhum chat ainda vinculado.</span>
              ) : (
                relatedChats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onOpenChat(c.id);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] hover:border-[var(--accent)] whitespace-nowrap"
                  >
                    <MessageSquare className="w-3 h-3 text-[var(--accent)]" />
                    <span>{c.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
