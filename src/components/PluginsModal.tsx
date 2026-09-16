import React from 'react';
import { X, Blocks, Search, Brain, Code2, Database, FileText, Check } from 'lucide-react';
import { UserSettings } from '../types/index.ts';

interface PluginsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
}

export const PluginsModal: React.FC<PluginsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const plugins = [
    {
      id: 'googleSearchGrounding',
      title: 'Busca Web Verdadeira (Google Search Grounding)',
      description: 'Valida informações na internet em tempo real, trazendo dados verídicos, links e fatos recentes.',
      icon: Search,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      enabled: settings.googleSearchGrounding,
    },
    {
      id: 'deepThinkingEnabled',
      title: 'Pensamento Profundo (Deep Reasoning Engine)',
      description: 'Executa raciocínio minucioso, decomposição de problemas e cadeia de pensamentos antes de responder.',
      icon: Brain,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      enabled: settings.deepThinkingEnabled,
    },
    {
      id: 'codeInterpreter',
      title: 'Intérprete de Código & Engenharia',
      description: 'Estruturação avançada de algoritmos, TypeScript, Python e arquitetura de software.',
      icon: Code2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      enabled: true,
      locked: true,
    },
    {
      id: 'memoryEnabled',
      title: 'Memória Contínua do Usuário',
      description: 'Lembra suas preferências, projetos e perfil de resposta ao longo de múltiplos chats.',
      icon: Database,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      enabled: settings.memoryEnabled,
    },
    {
      id: 'multimodalReader',
      title: 'Leitor Multimodal de Imagens e PDFs',
      description: 'Extrai texto, analisa diagramas e interpreta dados de arquivos anexados com precisão.',
      icon: FileText,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      enabled: true,
      locked: true,
    },
  ];

  const handleToggle = (id: string) => {
    if (id === 'googleSearchGrounding') {
      onUpdateSettings({ ...settings, googleSearchGrounding: !settings.googleSearchGrounding });
    } else if (id === 'deepThinkingEnabled') {
      onUpdateSettings({ ...settings, deepThinkingEnabled: !settings.deepThinkingEnabled });
    } else if (id === 'memoryEnabled') {
      onUpdateSettings({ ...settings, memoryEnabled: !settings.memoryEnabled });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
              <Blocks className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-title)]">Plugins & Extensões de IA</h2>
              <p className="text-xs text-[var(--text-secondary)]">Controle os recursos avançados de busca, raciocínio e execução.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of plugins */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5 custom-scrollbar">
          {plugins.map((plug) => {
            const Icon = plug.icon;
            return (
              <div
                key={plug.id}
                className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl ${plug.bgColor} ${plug.color} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[var(--text-title)]">{plug.title}</h4>
                      {plug.locked && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] font-mono">
                          NATIVO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed max-w-md">
                      {plug.description}
                    </p>
                  </div>
                </div>

                <div>
                  {plug.locked ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggle(plug.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        plug.enabled ? 'bg-[var(--accent)]' : 'bg-neutral-400 dark:bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          plug.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
