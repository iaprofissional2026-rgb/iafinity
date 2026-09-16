import React, { useState, useEffect } from 'react';
import { X, Clock, Play, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { storage } from '../services/storage.ts';

interface ScheduledModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunPromptNow: (prompt: string) => void;
}

export const ScheduledModal: React.FC<ScheduledModalProps> = ({
  isOpen,
  onClose,
  onRunPromptNow,
}) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState('Diário');
  const [time, setTime] = useState('09:00');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTasks(storage.getScheduled());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t));
    setTasks(updated);
    storage.saveScheduled(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) return;
    const newTask = {
      id: `sch-${Date.now()}`,
      title: title.trim(),
      frequency,
      time,
      prompt: prompt.trim(),
      enabled: true,
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    storage.saveScheduled(updated);
    setTitle('');
    setPrompt('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-title)]">Tarefas & Prompts Agendados</h2>
              <p className="text-xs text-[var(--text-secondary)]">Automatize rotinas diárias e análises periódicas.</p>
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
          <span className="text-xs text-[var(--text-secondary)] font-medium">Rotinas ativas em segundo plano</span>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Rotina</span>
          </button>
        </div>

        {/* Add form */}
        {isAdding && (
          <form onSubmit={handleAddTask} className="p-4 border-b border-[var(--border)] bg-[var(--surface)] flex flex-col gap-2.5">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da rotina (ex: Resumo diário de notícias)..."
              className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs placeholder-[var(--placeholder)] focus:outline-none focus:border-[var(--accent)]"
            />
            <div className="flex gap-2">
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs focus:outline-none flex-1"
              >
                <option value="Diário">Diário</option>
                <option value="Semanal (Segunda)">Semanal (Segunda)</option>
                <option value="Mensal">Mensal</option>
              </select>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs focus:outline-none"
              />
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Prompt a ser executado automaticamente..."
              rows={2}
              className="px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--placeholder)] text-xs focus:outline-none focus:border-[var(--accent)] resize-none"
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold"
              >
                Agendar
              </button>
            </div>
          </form>
        )}

        {/* Task list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[var(--text-title)]">{task.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] font-mono">
                    {task.frequency} às {task.time}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{task.prompt}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(task.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    task.enabled
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]'
                  }`}
                >
                  {task.enabled ? 'Ativo' : 'Pausado'}
                </button>

                <button
                  onClick={() => {
                    onRunPromptNow(task.prompt);
                    onClose();
                  }}
                  className="p-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-colors shadow-xs"
                  title="Executar agora no chat"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
