import React from 'react';
import { LionLogo } from './LionLogo.tsx';
import { SuggestionPrompt, ModelMode } from '../types/index.ts';
import { Sparkles, Brain, Search, Code2, Globe } from 'lucide-react';

interface WelcomeScreenProps {
  userName: string;
  onSelectSuggestion: (prompt: string, mode?: ModelMode) => void;
}

const SUGGESTIONS: (SuggestionPrompt & { icon: React.ComponentType<{ className?: string }> })[] = [
  {
    tag: 'Pensamento Profundo',
    title: 'Análise de mercado com fatos verificados',
    prompt: 'Faça uma análise aprofundada das principais tendências de tecnologia e IA em 2026, com fatos reais e fontes confiáveis.',
    mode: 'alta',
    icon: Brain,
  },
  {
    tag: 'Busca na Web',
    title: 'Pesquisar informações verdadeiras',
    prompt: 'Busque e valide na internet as últimas atualizações sobre modelos de inteligência artificial de raciocínio lógico.',
    mode: 'alta',
    icon: Search,
  },
  {
    tag: 'Arquitetura',
    title: 'Engenharia de Software e TypeScript',
    prompt: 'Atue como arquiteto de software sênior: proponha a arquitetura ideal e escalável para uma aplicação full-stack moderna.',
    mode: 'alta',
    icon: Code2,
  },
  {
    tag: 'Projetos',
    title: 'Estratégia para Império Digital',
    prompt: 'Elabore um plano de ação tático de 90 dias para consolidar um ecossistema digital lucrativo com automação e IA.',
    mode: 'media',
    icon: Sparkles,
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userName,
  onSelectSuggestion,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4 text-center my-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Emblem */}
      <div className="mb-4">
        <LionLogo size="xl" />
      </div>

      {/* Main Greeting */}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-title)] mb-8">
        Como posso ajudar, {userName || 'Souturbo'}?
      </h1>

      {/* Quick Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
        {SUGGESTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.tag}
              id={`suggestion-card-${item.tag.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectSuggestion(item.prompt, item.mode)}
              className="group relative p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-md transition-all text-left flex items-start gap-3 active:scale-[0.99]"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--surface-secondary)] group-hover:bg-[var(--accent-light)] group-hover:text-[var(--accent)] text-[var(--text-secondary)] flex items-center justify-center shrink-0 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold text-[var(--accent)] tracking-wide uppercase">
                  [{item.tag}]
                </div>
                <div className="text-xs font-medium text-[var(--text-primary)] mt-0.5 leading-snug group-hover:text-[var(--text-title)] transition-colors">
                  {item.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
