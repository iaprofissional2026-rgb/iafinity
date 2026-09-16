import React from 'react';
import { X, Keyboard, Download, Trash2, Info, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { ChatSession } from '../types/index.ts';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatSession[];
  onClearChats: () => void;
  onOpenSettings: () => void;
}

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  onClose,
  chats,
  onClearChats,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(chats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lionfinity-chatgpt-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = () => {
    let md = `# Backup de Conversas - Lionfinity AI\n\n`;
    chats.forEach((c) => {
      md += `## ${c.title} (${new Date(c.createdAt).toLocaleDateString()})\n\n`;
      c.messages.forEach((m) => {
        md += `### ${m.role === 'user' ? 'Você' : 'Lionfinity AI'}:\n${m.content}\n\n`;
      });
      md += `---\n\n`;
    });
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `conversas-lionfinity-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center font-bold">
              •••
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-title)]">Opções & Recursos Avançados</h2>
              <p className="text-xs text-[var(--text-secondary)]">Atalhos, exportação de conversas e integridade.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Shortcuts */}
          <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="text-xs font-bold text-[var(--text-title)]">Atalhos de Teclado</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[var(--text-primary)]">
                <span>Ocultar/Expandir barra lateral</span>
                <kbd className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[10px] text-[var(--text-secondary)]">
                  Ctrl + B
                </kbd>
              </div>
              <div className="flex items-center justify-between text-[var(--text-primary)]">
                <span>Enviar mensagem</span>
                <kbd className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[10px] text-[var(--text-secondary)]">
                  Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between text-[var(--text-primary)]">
                <span>Nova linha</span>
                <kbd className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[10px] text-[var(--text-secondary)]">
                  Shift + Enter
                </kbd>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="text-xs font-bold text-[var(--text-title)]">Exportar Histórico de Chats</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              Baixe todas as suas {chats.length} conversas salvas em formato seguro.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-2 px-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs font-medium transition-colors text-center"
              >
                Exportar JSON
              </button>
              <button
                onClick={handleExportMarkdown}
                className="flex-1 py-2 px-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs font-medium transition-colors text-center"
              >
                Exportar Markdown (.md)
              </button>
            </div>
          </div>

          {/* Clear history */}
          <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4 text-red-500" />
              <div>
                <h3 className="text-xs font-bold text-[var(--text-title)]">Limpar conversas</h3>
                <p className="text-[11px] text-[var(--text-secondary)]">Remove o histórico salvo localmente.</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Tem certeza que deseja apagar todas as conversas?')) {
                  onClearChats();
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold transition-colors"
            >
              Apagar tudo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
