import React, { useState, useRef, useEffect } from 'react';
import { ModelMode } from '../types/index.ts';
import {
  ChevronDown,
  Zap,
  Brain,
  Sparkles,
  SquarePen,
  Check,
  PanelLeft,
  PanelLeftClose,
  Search,
} from 'lucide-react';

interface HeaderProps {
  currentMode: ModelMode;
  onSelectMode: (mode: ModelMode) => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  onNewChat: () => void;
}

const MODES: {
  id: ModelMode;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'alta',
    name: 'Alta (Pensamento + Busca Real)',
    badge: 'Profundo',
    description: 'Raciocínio minucioso passo a passo e busca factual no Google Search.',
    icon: Brain,
  },
  {
    id: 'media',
    name: 'Média (Equilibrado)',
    badge: 'Padrão',
    description: 'Respostas detalhadas com tempo de resposta ideal para o dia a dia.',
    icon: Sparkles,
  },
  {
    id: 'rapida',
    name: 'Rápida (Instantâneo)',
    badge: 'Velocidade',
    description: 'Respostas rápidas e diretas ao ponto com alta fluidez.',
    icon: Zap,
  },
];

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onToggleSidebar,
  isSidebarCollapsed,
  onNewChat,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize legacy mode keys to alta/media/rapida
  const normalizedMode =
    currentMode === 'fast'
      ? 'rapida'
      : currentMode === 'thinking' || currentMode === 'pro'
      ? 'alta'
      : currentMode;

  const activeModeObj = MODES.find((m) => m.id === normalizedMode) || MODES[0];
  const ActiveIcon = activeModeObj.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-3 md:px-5">
      <div className="flex items-center gap-2">
        {/* Toggle sidebar button (works on notebooks, desktops, tablets and phones) */}
        <button
          id="btn-sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          title={isSidebarCollapsed ? 'Mostrar barra lateral (Ctrl+B)' : 'Esconder barra lateral (Ctrl+B)'}
          className={`p-2 rounded-xl transition-all flex items-center justify-center ${
            isSidebarCollapsed
              ? 'text-[var(--accent)] bg-[var(--accent-light)] hover:opacity-90'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
          }`}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        {/* Model Mode Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="btn-model-selector"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-all text-sm group border border-transparent hover:border-[var(--border)]"
          >
            <div className="w-6 h-6 rounded-lg bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
              <ActiveIcon className="w-3.5 h-3.5" />
            </div>
            <span className="tracking-tight font-bold text-[var(--text-title)]">Lionfinity AI</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] font-medium border border-[var(--border)]">
              {activeModeObj.name.split(' ')[0]}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {dropdownOpen && (
            <div
              id="model-dropdown-menu"
              className="absolute left-0 mt-2 w-80 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Modo de Inteligência & Raciocínio
              </div>
              <div className="space-y-1">
                {MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = mode.id === normalizedMode;
                  return (
                    <button
                      key={mode.id}
                      id={`mode-option-${mode.id}`}
                      onClick={() => {
                        onSelectMode(mode.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 group ${
                        isSelected
                          ? 'bg-[var(--accent-light)] border border-[var(--accent-border)]'
                          : 'hover:bg-[var(--surface-secondary)] border border-transparent'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[var(--accent)] text-white'
                            : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-semibold ${
                              isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                            }`}
                          >
                            {mode.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[var(--accent)]" />}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                          {mode.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="btn-header-new-chat"
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors border border-[var(--border)]"
          title="Iniciar novo chat"
        >
          <SquarePen className="w-4 h-4 text-[var(--accent)]" />
          <span className="hidden sm:inline">Novo chat</span>
        </button>
      </div>
    </header>
  );
};
