import React, { useState } from 'react';
import { UserSettings } from '../types/index.ts';
import {
  X,
  Palette,
  Brain,
  User,
  Check,
  Sun,
  Moon,
  Laptop,
  Sparkles,
  Search,
  Zap,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
}

type TabType = 'appearance' | 'reasoning' | 'memory' | 'account';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const accentColors = [
    { id: 'emerald', name: 'Verde', hex: '#10A37F', bg: 'bg-[#10A37F]' },
    { id: 'blue', name: 'Azul', hex: '#2563EB', bg: 'bg-[#2563EB]' },
    { id: 'purple', name: 'Roxo', hex: '#7C3AED', bg: 'bg-[#7C3AED]' },
    { id: 'orange', name: 'Laranja', hex: '#F97316', bg: 'bg-[#F97316]' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="settings-modal"
        className="w-full max-w-xl rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-title)]">Configurações do Sistema</h2>
              <p className="text-xs text-[var(--text-secondary)]">Personalize aparência, cores de destaque e preferências.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[var(--border)] px-6 pt-2 bg-[var(--surface-secondary)] overflow-x-auto">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Aparência</span>
          </button>

          <button
            onClick={() => setActiveTab('reasoning')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'reasoning'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Pensamento & Busca</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'memory'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Memória</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'account'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Conta & Plus</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-sm text-[var(--text-primary)]">
          {/* Tab 1: Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Theme Mode */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Tema da Interface
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', name: 'Claro (#FFFFFF)', icon: Sun },
                    { id: 'dark', name: 'Escuro (#171717)', icon: Laptop },
                    { id: 'oled', name: 'Preto OLED (#000000)', icon: Moon },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = localSettings.theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          setLocalSettings((prev) => ({ ...prev, theme: t.id as any }))
                        }
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]'
                            : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-center">{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Cor de Destaque (Accent Color)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {accentColors.map((color) => {
                    const isSelected = localSettings.accentColor === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            accentColor: color.id as any,
                          }))
                        }
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] ring-1 ring-[var(--accent)]'
                            : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${color.bg} shadow-xs shrink-0`} />
                        <div className="flex flex-col text-left">
                          <span className="font-semibold">{color.name}</span>
                          <span className="text-[10px] text-[var(--placeholder)]">{color.hex}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Response Style */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Profundidade de Resposta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'detailed', label: 'Detalhada', desc: 'Pensamento analítico e completo' },
                    { id: 'balanced', label: 'Equilibrada', desc: 'Dia a dia rápido e claro' },
                    { id: 'concise', label: 'Concisa', desc: 'Ultra direta ao ponto' },
                  ].map((style) => {
                    const isSelected = localSettings.responseStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            responseStyle: style.id as any,
                          }))
                        }
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]'
                            : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <div className={`text-xs font-bold ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                          {style.label}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{style.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Reasoning & Truth Grounding */}
          {activeTab === 'reasoning' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Brain className="w-5 h-5 text-[var(--accent)]" />
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-title)]">Pensamento Profundo Ativado</h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">Raciocínio reflexivo passo a passo antes de responder.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        deepThinkingEnabled: !prev.deepThinkingEnabled,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.deepThinkingEnabled ? 'bg-[var(--accent)]' : 'bg-neutral-400 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.deepThinkingEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Search className="w-5 h-5 text-[var(--accent)]" />
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-title)]">Busca de Informações Verdadeiras (Google Search)</h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">Consulta fontes factuais e links reais para evitar alucinações.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        googleSearchGrounding: !prev.googleSearchGrounding,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.googleSearchGrounding ? 'bg-[var(--accent)]' : 'bg-neutral-400 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.googleSearchGrounding ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <span>
                  O modo <strong>Alta</strong> aplica tanto raciocínio analítico quanto verificação de fatos reais na web, garantindo respostas completas e confiáveis.
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: Memory */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-title)]">Memória Contínua</h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">Permite que a IA lembre seu nome, instruções e preferências de resposta.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      memoryEnabled: !prev.memoryEnabled,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.memoryEnabled ? 'bg-[var(--accent)]' : 'bg-neutral-400 dark:bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.memoryEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-title)] mb-1.5">
                  O que a IA deve saber sobre você:
                </label>
                <textarea
                  rows={4}
                  disabled={!localSettings.memoryEnabled}
                  value={localSettings.memoryContent}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, memoryContent: e.target.value }))
                  }
                  placeholder="Ex: Meu nome é Souturbo. Prefiro respostas profundas, código bem estruturado em TypeScript e explicações com fontes verdadeiras."
                  className="w-full p-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border)] disabled:opacity-40 text-xs text-[var(--text-primary)] placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)] resize-none"
                />
              </div>
            </div>
          )}

          {/* Tab 4: Account & Plus */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-base shadow-xs">
                    {localSettings.userProfile.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--text-title)]">{localSettings.userProfile.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/30">
                        {localSettings.userProfile.plan || 'Plus'}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">{localSettings.userProfile.email}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--text-title)]">Nome de Exibição</label>
                <input
                  type="text"
                  value={localSettings.userProfile.name}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      userProfile: { ...prev.userProfile, name: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--text-title)]">E-mail</label>
                <input
                  type="email"
                  value={localSettings.userProfile.email}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      userProfile: { ...prev.userProfile, email: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
                Plano <strong>Plus</strong> ativo com acesso ilimitado ao modo de raciocínio profundo, estúdio de imagens, projetos e pesquisa de informações factuais.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-secondary)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Salvar preferências</span>
          </button>
        </div>
      </div>
    </div>
  );
};
