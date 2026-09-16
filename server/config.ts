export interface ModelModeConfig {
  id: string;
  name: string;
  description: string;
  model: string;
  thinkingLevel?: 'LOW' | 'HIGH';
  useGoogleSearch?: boolean;
  temperature: number;
  systemInstructionSuffix: string;
}

export const BASE_SYSTEM_PROMPT = `Você é um assistente de inteligência artificial de altíssimo nível (Lionfinity / ChatGPT), rigoroso com a verdade, fatos reais, profundidade conceitual e precisão técnica.

DIRETRIZES FUNDAMENTAIS:
1. BUSCA DA VERDADE E FATOS REAIS: Nunca invente informações, links ou dados fictícios. Seja fidedigno à realidade histórica, científica, técnica e atual. Quando aplicável, utilize raciocínio e pesquisa de fontes confiáveis.
2. PENSAMENTO PROFUNDO E RACIOCÍNIO ESTRUTURADO:
   - Decomponha problemas complexos em etapas lógicas.
   - Pense criticamente antes de emitir conclusões.
   - Apresente explicações completas, detalhadas, ricas em exemplos e didáticas.
3. PROGRAMAÇÃO E ENGENHARIA:
   - Produza código de produção completo, sem atalhos ou "..." omitidos onde for essencial.
   - Inclua tratamento de erros, boas práticas e tipagem forte quando aplicável.
4. LINGUAGEM: Responda no idioma do usuário (primariamente Português), com tom polido, profissional, perspicaz e acolhedor.`;

export const MODEL_MODES: Record<string, ModelModeConfig> = {
  alta: {
    id: 'alta',
    name: 'Alta',
    description: 'Pensamento profundo com raciocínio analítico minucioso e busca de informações verdadeiras.',
    model: 'gemini-3.1-flash-lite',
    thinkingLevel: 'HIGH',
    useGoogleSearch: false,
    temperature: 0.3,
    systemInstructionSuffix: `\n\n[MODO ALTA - PENSAMENTO PROFUNDO E VERDADE FACTUAL ATIVADO]:
- Dedique raciocínio detalhado à questão.
- Valide minuciosamente cada premissa.
- Apresente uma resposta completa, com alta profundidade, dados verificáveis, argumentos sólidos e riqueza de detalhes sem enrolação.`,
  },
  thinking: {
    id: 'thinking',
    name: 'Pensar',
    description: 'Raciocínio lógico, programação avançada e análise passo a passo.',
    model: 'gemini-3.1-flash-lite',
    thinkingLevel: 'HIGH',
    useGoogleSearch: false,
    temperature: 0.35,
    systemInstructionSuffix: `\n\n[MODO PENSAR ATIVADO]:
- Conduza raciocínio analítico profundo passo a passo.
- Decomponha cada parte da pergunta com precisão lógica e clareza total.`,
  },
  media: {
    id: 'media',
    name: 'Média',
    description: 'Raciocínio equilibrado com busca factual e boa agilidade.',
    model: 'gemini-3.1-flash-lite',
    thinkingLevel: 'LOW',
    useGoogleSearch: false,
    temperature: 0.6,
    systemInstructionSuffix: `\n\n[MODO MÉDIA ATIVADO]:
- Entregue respostas bem equilibradas, objetivas e factuais.`,
  },
  rapida: {
    id: 'rapida',
    name: 'Rápida',
    description: 'Velocidade máxima para respostas instantâneas.',
    model: 'gemini-3.1-flash-lite',
    useGoogleSearch: false,
    temperature: 0.7,
    systemInstructionSuffix: `\n\n[MODO RÁPIDO ATIVADO]:
- Seja ágil, direto ao ponto e conciso.`,
  },
  fast: {
    id: 'fast',
    name: 'Rápido',
    description: 'Respostas rápidas e objetivas.',
    model: 'gemini-3.1-flash-lite',
    useGoogleSearch: false,
    temperature: 0.7,
    systemInstructionSuffix: '\n\nModo Rápido: Seja ágil e conciso.',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Análise profunda e arquitetura completa.',
    model: 'gemini-3.1-flash-lite',
    thinkingLevel: 'HIGH',
    useGoogleSearch: false,
    temperature: 0.4,
    systemInstructionSuffix: '\n\nModo Pro: Atue como especialista sênior com profundidade máxima.',
  },
};
