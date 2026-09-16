import React, { useState, useMemo } from 'react';
import { ChatSession, UserProfile } from '../types/index.ts';
import { LionLogo } from './LionLogo.tsx';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pin,
  Pencil,
  Trash2,
  Settings,
  MessageSquare,
  X,
  Image as ImageIcon,
  Bookmark,
  Box,
  Clock,
  Blocks,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  chats: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onDeleteChat: (id: string) => void;
  onTogglePinChat: (id: string) => void;
  userProfile: UserProfile;
  onOpenSettings: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenGallery?: () => void;
  onOpenImages: () => void;
  onOpenLibrary: () => void;
  onOpenProjects: () => void;
  onOpenScheduled: () => void;
  onOpenPlugins: () => void;
  onOpenMore: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  onTogglePinChat,
  userProfile,
  onOpenSettings,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  onOpenGallery,
  onOpenImages,
  onOpenLibrary,
  onOpenProjects,
  onOpenScheduled,
  onOpenPlugins,
  onOpenMore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  // Group chats chronologically & by pinned status
  const groupedChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = chats.filter((c) =>
      c.title.toLowerCase().includes(query)
    );

    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const startOfYesterday = startOfToday - ONE_DAY;
    const sevenDaysAgo = startOfToday - 6 * ONE_DAY;

    const pinned: ChatSession[] = [];
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const last7Days: ChatSession[] = [];
    const older: ChatSession[] = [];

    const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);

    for (const chat of sorted) {
      if (chat.isPinned && !query) {
        pinned.push(chat);
        continue;
      }
      const time = chat.updatedAt;
      if (time >= startOfToday) {
        today.push(chat);
      } else if (time >= startOfYesterday) {
        yesterday.push(chat);
      } else if (time >= sevenDaysAgo) {
        last7Days.push(chat);
      } else {
        older.push(chat);
      }
    }

    return {
      pinned,
      today,
      yesterday,
      last7Days,
      older,
    };
  }, [chats, searchQuery]);

  const handleStartRename = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(chat.id);
    setRenameTitle(chat.title);
    setActiveMenuId(null);
  };

  const handleConfirmRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (renameTitle.trim()) {
      onRenameChat(id, renameTitle.trim());
    }
    setRenamingId(null);
  };

  const renderGroup = (label: string, list: ChatSession[]) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </div>
        <div className="space-y-0.5 mt-1">
          {list.map((chat) => {
            const isSelected = chat.id === currentChatId;
            const isMenuOpen = activeMenuId === chat.id;

            return (
              <div
                key={chat.id}
                id={`chat-item-${chat.id}`}
                onClick={() => {
                  onSelectChat(chat.id);
                  onCloseMobile();
                }}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold border border-[var(--accent-border)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                  {renamingId === chat.id ? (
                    <form
                      onSubmit={(e) => handleConfirmRename(chat.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={renameTitle}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        onBlur={() => handleConfirmRename(chat.id)}
                        className="w-full bg-[var(--input-bg)] text-xs px-2 py-0.5 rounded border border-[var(--accent)] outline-none text-[var(--text-primary)]"
                      />
                    </form>
                  ) : (
                    <span className="truncate text-xs leading-normal">{chat.title}</span>
                  )}
                </div>

                {/* Context Action Menu Trigger */}
                <div className="relative shrink-0 flex items-center">
                  <button
                    id={`btn-menu-${chat.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(isMenuOpen ? null : chat.id);
                    }}
                    className={`p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-opacity ${
                      isMenuOpen || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    title="Opções da conversa"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>

                  {/* Context Menu Dropdown */}
                  {isMenuOpen && (
                    <div
                      id={`menu-dropdown-${chat.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-6 w-36 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePinChat(chat.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-lg"
                      >
                        <Pin className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        <span>{chat.isPinned ? 'Desafixar' : 'Fixar'}</span>
                      </button>

                      <button
                        onClick={(e) => handleStartRename(chat, e)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-lg"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        <span>Renomear</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 shrink-0 bg-[var(--surface)] text-[var(--text-primary)] border-r border-[var(--border)] transition-all duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 w-[260px]' : '-translate-x-full md:translate-x-0'
        } ${
          isCollapsed
            ? 'md:w-0 md:min-w-0 md:max-w-0 md:border-r-0 md:p-0 md:overflow-hidden md:opacity-0 pointer-events-none'
            : 'md:w-[260px] md:min-w-[260px] md:max-[260px] md:opacity-100'
        }`}
      >
        <div className="w-[260px] min-w-[260px] flex flex-col h-full justify-between overflow-hidden">
          {/* Top Section */}
          <div className="p-3 border-b border-[var(--border)] flex flex-col gap-2.5">
            {/* Header row: Brand title */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <LionLogo size="sm" showText={false} />
                <span className="text-sm font-bold text-[var(--text-title)] tracking-tight">Lionfinity AI</span>
              </div>
              {/* Mobile button to close drawer */}
              <button
                id="btn-close-sidebar-mobile"
                type="button"
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
                title="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Permanent, Clean Search Bar: [ 🔍 Pesquisar conversas ] */}
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--placeholder)] pointer-events-none" />
              <input
                id="sidebar-search-input"
                type="text"
                placeholder="Pesquisar conversas"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--surface-secondary)] border border-transparent focus:border-[var(--accent)] text-xs text-[var(--text-primary)] placeholder-[var(--placeholder)] focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  title="Limpar pesquisa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Novo chat */}
            <button
              id="btn-sidebar-new-chat"
              onClick={() => {
                onNewChat();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-xs transition-all active:scale-[0.99] mt-0.5"
              title="Iniciar nova conversa"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo chat</span>
            </button>

            {/* Navigation & Tool Shortcuts */}
            <div className="space-y-0.5 pt-1">
              {/* Galeria Multimídia */}
              {onOpenGallery && (
                <button
                  id="btn-sidebar-gallery"
                  onClick={onOpenGallery}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                    <span className="font-semibold text-[var(--text-primary)]">Galeria</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                    NOVO
                  </span>
                </button>
              )}

              {/* Imagens (with ATUALIZADO badge) */}
              <button
                onClick={onOpenImages}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>Imagens</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[var(--accent-light)] text-[var(--accent)]">
                  ATUALIZADO
                </span>
              </button>

              {/* Biblioteca */}
              <button
                onClick={onOpenLibrary}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Bookmark className="w-4 h-4 text-[var(--text-secondary)]" />
                <span>Biblioteca</span>
              </button>

              {/* Projetos */}
              <button
                onClick={onOpenProjects}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Box className="w-4 h-4 text-[var(--text-secondary)]" />
                <span>Projetos</span>
              </button>

              {/* Agendados */}
              <button
                onClick={onOpenScheduled}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
                <span>Agendados</span>
              </button>

              {/* Plugins */}
              <button
                onClick={onOpenPlugins}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Blocks className="w-4 h-4 text-[var(--text-secondary)]" />
                <span>Plugins</span>
              </button>

              {/* Mais */}
              <button
                onClick={onOpenMore}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <div className="w-4 h-4 flex items-center justify-center font-bold text-[var(--text-secondary)] text-xs">
                  •••
                </div>
                <span>Mais</span>
              </button>
            </div>
          </div>

          {/* Middle Section: Pinned & History List */}
          <div className="flex-1 overflow-y-auto px-2 py-2.5 custom-scrollbar">
            {groupedChats.pinned.length > 0 && renderGroup('Fixada', groupedChats.pinned)}
            {groupedChats.today.length > 0 && renderGroup('Hoje', groupedChats.today)}
            {groupedChats.yesterday.length > 0 && renderGroup('Ontem', groupedChats.yesterday)}
            {groupedChats.last7Days.length > 0 && renderGroup('Últimos 7 dias', groupedChats.last7Days)}
            {groupedChats.older.length > 0 && renderGroup('Mais antigos', groupedChats.older)}

            {chats.length === 0 && (
              <div className="text-center py-8 px-4 text-xs text-[var(--placeholder)]">
                Nenhuma conversa salva ainda.
              </div>
            )}
          </div>

          {/* Bottom Section: User Profile (Souturbo / Plus) */}
          <div className="p-2 border-t border-[var(--border)] bg-[var(--surface)]">
            <div
              onClick={onOpenSettings}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  {userProfile.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[var(--text-title)] truncate">
                    {userProfile.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] truncate flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-[var(--accent)]" />
                    <span className="text-[var(--accent)] font-medium">Plano Plus</span>
                  </div>
                </div>
              </div>

              <button
                id="btn-open-settings"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSettings();
                }}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
                title="Configurações"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
