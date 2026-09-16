import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'text', value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-[var(--border)] bg-[#1E1E1E] text-neutral-200 font-mono text-xs shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[#333333] text-neutral-300 select-none">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)] font-mono">
          {language || 'código'}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-sans hover:text-white hover:bg-white/10 transition-colors text-neutral-300"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-[var(--accent)]">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar código</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <pre className="font-mono text-[13px] leading-relaxed whitespace-pre font-normal text-[#E0E0E0]">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};
