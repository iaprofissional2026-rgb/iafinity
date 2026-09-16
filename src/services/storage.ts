import { ChatSession, UserSettings, GalleryItem } from '../types/index.ts';

const CHATS_STORAGE_KEY = 'lionfinity_chats_v1';
const CURRENT_CHAT_ID_KEY = 'lionfinity_current_chat_id_v1';
const SETTINGS_STORAGE_KEY = 'lionfinity_settings_v1';
const GALLERY_STORAGE_KEY = 'lionfinity_gallery_v1';

const ONE_HOUR = 3600 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'oled',
  accentColor: 'orange',
  responseStyle: 'detailed',
  language: 'pt-BR',
  memoryEnabled: true,
  memoryContent: 'Meu nome é Souturbo. Priorize respostas com pensamento analítico profundo, informações verdadeiras e código robusto.',
  deepThinkingEnabled: true,
  googleSearchGrounding: false,
  freeOnlyMode: true,
  preferredImageModel: 'recraft/recraft-v4.1-pro:free',
  preferredVideoModel: 'kwaivgi/kling-v3.0-std:free',
  preferredVoiceModel: 'fish-audio/s2.1-pro-free:free',
  userProfile: {
    name: 'Souturbo',
    email: 'souturbo149@gmail.com',
    plan: 'Plus',
    isLoggedIn: true,
  },
};

const INITIAL_CHATS: ChatSession[] = [
  {
    id: 'chat-imperio-digital',
    title: 'Império Digital',
    createdAt: Date.now() - 1 * ONE_HOUR,
    updatedAt: Date.now() - 1 * ONE_HOUR,
    modelMode: 'alta',
    isPinned: true,
    customIcon: 'cube',
    messages: [
      {
        id: 'msg-imp-1',
        role: 'user',
        content: 'Como estruturar o funil de aquisição e a esteira de produtos para o projeto Império Digital?',
        createdAt: Date.now() - 1 * ONE_HOUR,
      },
      {
        id: 'msg-imp-2',
        role: 'model',
        thought: '1. Analisar o modelo de negócios de infoprodutos e ecossistemas digitais.\n2. Mapear esteira de valor: Lead Magnet -> Front-end -> Core Offer -> High Ticket -> Comunidade Recorrente.\n3. Estruturar tráfego pago + orgânico com retenção de LTV e validação de CAC.\n4. Apresentar dados factuais e estratégias comprovadas.',
        groundingSources: [
          { title: 'Estratégias de Funil de Vendas e LTV', url: 'https://hbr.org/topic/marketing' },
          { title: 'Modelos de Negócios Digitais Escaláveis', url: 'https://forbes.com/entrepreneurs' },
        ],
        content: `Para construir um ecossistema sólido e lucrativo no **Império Digital**, recomendo estruturar uma **esteira de valor orientada a LTV (Lifetime Value)**:

### 1. Funil de Atração e Front-End
- **Entrada (Low-Ticket / Front-End)**: Produto de rápida absorção e alto valor percebido (R$ 47 - R$ 97) para converter leads frios em clientes pagantes e subsidiar o CAC (Custo de Aquisição).
- **Order Bump & One-Click Upsell**: Complemento imediato (ex: templates prontos, checklists práticos) aumentando o ticket médio na hora do checkout.

### 2. Core Offer & Back-End
- **Oferta Central**: Mentoria em grupo ou formação completa com acompanhamento prático.
- **High-Ticket / Mastermind**: Para o topo da pirâmide que deseja implementação individual ou consultoria direta.

### 3. Comunidade Recorrente
- Assinatura mensal com novos estudos de caso, networking e ferramentas exclusivas para receita previsível.`,
        createdAt: Date.now() - (1 * ONE_HOUR - 3000),
      },
    ],
  },
  {
    id: 'chat-gospel-mind',
    title: 'GospelMind Ultra',
    createdAt: Date.now() - 3 * ONE_HOUR,
    updatedAt: Date.now() - 3 * ONE_HOUR,
    modelMode: 'alta',
    isPinned: true,
    customIcon: 'avatar',
    messages: [
      {
        id: 'msg-gosp-1',
        role: 'user',
        content: 'Qual a visão e arquitetura para a plataforma de inteligência e estudos GospelMind Ultra?',
        createdAt: Date.now() - 3 * ONE_HOUR,
      },
      {
        id: 'msg-gosp-2',
        role: 'model',
        thought: 'Analisar referências exegéticas, bases bíblicas gregas e hebraicas (LXX, Texto Massorético), ontologia e sistema de teologia bíblica comparada.',
        content: `A **GospelMind Ultra** deve ser uma suíte de alta fidelidade acadêmica e espiritual:
- **Exegese com Dicionários Strong e Léxicos Originais** (Hebraico, Aramaico e Grego Koiné).
- **Mapeamento de Paralelos Bíblicos (Cross-References)** interconectando tipologias do Antigo ao Novo Testamento.
- **Estruturação Temática de Sermões e Estudos** com fidelidade teológica e hermenêutica contextual.`,
        createdAt: Date.now() - (3 * ONE_HOUR - 4000),
      },
    ],
  },
  {
    id: 'chat-saudacoes-iniciais',
    title: 'Saudações iniciais',
    createdAt: Date.now() - 5 * ONE_HOUR,
    updatedAt: Date.now() - 5 * ONE_HOUR,
    modelMode: 'rapida',
    isPinned: true,
    customIcon: 'chat',
    messages: [
      {
        id: 'msg-saud-1',
        role: 'user',
        content: 'Olá! Como você pode me auxiliar nas minhas tarefas diárias?',
        createdAt: Date.now() - 5 * ONE_HOUR,
      },
      {
        id: 'msg-saud-2',
        role: 'model',
        content: `Olá, Souturbo! Estou configurado para te entregar pensamento aprofundado, pesquisas com dados reais e execuções técnicas de alto padrão em programação, design, estratégias de negócios e estudos. Em que podemos avançar agora?`,
        createdAt: Date.now() - (5 * ONE_HOUR - 2000),
      },
    ],
  },
  {
    id: 'chat-criar-canal-youtube',
    title: 'Criar Canal YouTube',
    createdAt: Date.now() - 7 * ONE_HOUR,
    updatedAt: Date.now() - 7 * ONE_HOUR,
    modelMode: 'alta',
    isPinned: true,
    customIcon: 'chat',
    messages: [
      {
        id: 'msg-yt-1',
        role: 'user',
        content: 'Passo a passo para estruturar um canal no YouTube com retenção acima de 50% e CTR alto.',
        createdAt: Date.now() - 7 * ONE_HOUR,
      },
      {
        id: 'msg-yt-2',
        role: 'model',
        thought: 'Analisar métricas do algoritmo do YouTube: CTR (Miniatura + Título), AVD (Average View Duration) e Satisfação do Usuário.',
        content: `Para garantir métricas de excelência no YouTube:
1. **Os Primeiros 30 Segundos**: Não gaste tempo com vinhetas. Confirme imediatamente a promessa do título e estabeleça um loop narrativo com um conflito ou mistério a ser resolvido.
2. **Engenharia de Título e Thumbnail (CTR)**: O título cria a curiosidade; a miniatura adiciona a emoção e o contexto visual. Evite repetir o texto exato do título na imagem.
3. **Micro-ganchos a cada 90 segundos**: Mudança de enquadramento, sonoplastia, infográficos e ritmo dinâmico para reter a atenção e manter o AVD elevado.`,
        createdAt: Date.now() - (7 * ONE_HOUR - 3500),
      },
    ],
  },
  {
    id: 'chat-gpt-design-grafico',
    title: 'GPT para Design Gráfico',
    createdAt: Date.now() - 9 * ONE_HOUR,
    updatedAt: Date.now() - 9 * ONE_HOUR,
    modelMode: 'media',
    isPinned: true,
    customIcon: 'chat',
    messages: [
      {
        id: 'msg-dg-1',
        role: 'user',
        content: 'Como gerar paletas de cores harmônicas e tipografia profissional para identidade visual?',
        createdAt: Date.now() - 9 * ONE_HOUR,
      },
      {
        id: 'msg-dg-2',
        role: 'model',
        content: `Para identidade visual equilibrada:
- **Hierarquia Tipográfica**: Uma fonte display expressiva para títulos pareada com uma sans-serif neutra e de alta legibilidade (ex: Plus Jakarta Sans) para corpo de texto.
- **Regra 60-30-10 de Cores**: 60% tom neutro de fundo, 30% estrutura secundária e 10% cor vibrante de destaque (como laranja ou esmeralda) para pontos de ação.`,
        createdAt: Date.now() - (9 * ONE_HOUR - 2500),
      },
    ],
  },
  {
    id: 'chat-acessar-estudar-curso',
    title: 'Acessar e Estudar Curso',
    createdAt: Date.now() - 12 * ONE_HOUR,
    updatedAt: Date.now() - 12 * ONE_HOUR,
    modelMode: 'alta',
    isPinned: true,
    customIcon: 'chat',
    messages: [
      {
        id: 'msg-ec-1',
        role: 'user',
        content: 'Qual a metodologia mais eficaz para retenção e aplicação prática de cursos online?',
        createdAt: Date.now() - 12 * ONE_HOUR,
      },
      {
        id: 'msg-ec-2',
        role: 'model',
        content: `Adote a **Técnica de Feynman combinada com Aprendizado Baseado em Projetos (PBL)**: após cada aula, documente um resumo em suas próprias palavras e implemente imediatamente um mini-projeto real.`,
        createdAt: Date.now() - (12 * ONE_HOUR - 2000),
      },
    ],
  },
  {
    id: 'chat-estrutura-oracao',
    title: 'Estrutura de oração',
    createdAt: Date.now() - 15 * ONE_HOUR,
    updatedAt: Date.now() - 15 * ONE_HOUR,
    modelMode: 'alta',
    isPinned: true,
    customIcon: 'chat',
    messages: [
      {
        id: 'msg-or-1',
        role: 'user',
        content: 'Qual a estrutura bíblica recomendada para uma vida devocional consistente?',
        createdAt: Date.now() - 15 * ONE_HOUR,
      },
      {
        id: 'msg-or-2',
        role: 'model',
        content: `O acrônimo **A.C.A.S.** baseado no modelo da Oração do Pai Nosso:
1. **Adoração**: Louvar o caráter e a santidade de Deus.
2. **Confissão**: Arrependimento e busca de purificação sincera.
3. **Ações de Graça**: Gratidão deliberada pelas bênçãos recebidas.
4. **Súplica**: Apresentar intercessões pelo próximo e petições pessoais.`,
        createdAt: Date.now() - (15 * ONE_HOUR - 2000),
      },
    ],
  },
  {
    id: 'chat-jogo-biblico-multiplayer',
    title: 'Criar jogo bíblico multiplayer',
    createdAt: Date.now() - 18 * ONE_HOUR,
    updatedAt: Date.now() - 18 * ONE_HOUR,
    modelMode: 'alta',
    isPinned: true,
    customIcon: 'chat',
    messages: [
      {
        id: 'msg-jb-1',
        role: 'user',
        content: 'Como desenvolver a arquitetura de salas multiplayer em tempo real para um jogo bíblico de perguntas e respostas?',
        createdAt: Date.now() - 18 * ONE_HOUR,
      },
      {
        id: 'msg-jb-2',
        role: 'model',
        thought: 'Definir arquitetura com WebSockets / SSE, sincronização autoritativa de pontuação e timer sincronizado no servidor.',
        content: `Para um quiz multiplayer em tempo real:
- **Servidor Autoritativo**: O backend gerencia o relógio da rodada e valida as respostas para evitar trapaças no cliente.
- **Protocolo de Comunicação**: WebSockets com salas por código de 6 dígitos.
- **Gamificação**: Pontuação multiplicada por velocidade de resposta e sequências de acertos corretos.`,
        createdAt: Date.now() - (18 * ONE_HOUR - 3000),
      },
    ],
  },
  {
    id: 'chat-melhore-remova-fundo',
    title: 'Melhore Remova Fundo Robo',
    createdAt: Date.now() - 24 * ONE_HOUR,
    updatedAt: Date.now() - 24 * ONE_HOUR,
    modelMode: 'media',
    isPinned: true,
    customIcon: 'chat',
    messages: [
      {
        id: 'msg-rf-1',
        role: 'user',
        content: 'Quais as melhores bibliotecas e abordagens para remoção de fundo com IA em imagens de robôs e produtos?',
        createdAt: Date.now() - 24 * ONE_HOUR,
      },
      {
        id: 'msg-rf-2',
        role: 'model',
        content: `As soluções de estado da arte incluem:
- **RMBG-1.4 (BRIA AI)**: Excelente precisão para bordas complexas e detalhes de iluminação metálica.
- **BiRefNet**: Modelo de alta resolução ideal para recortes finos em 2K e 4K.
- **Segment Anything (SAM 2)**: Para segmentação interativa guiada por pontos ou caixas de seleção.`,
        createdAt: Date.now() - (24 * ONE_HOUR - 2000),
      },
    ],
  },
];

const PROJECTS_STORAGE_KEY = 'lionfinity_projects_v1';
const SCHEDULED_STORAGE_KEY = 'lionfinity_scheduled_v1';
const LIBRARY_STORAGE_KEY = 'lionfinity_library_v1';

const INITIAL_PROJECTS: any[] = [
  { id: 'proj-1', title: 'Império Digital', description: 'Ecossistema de produtos, funis de conversão e marketing.', icon: 'cube', createdAt: Date.now() - 3 * ONE_DAY },
  { id: 'proj-2', title: 'GospelMind Ultra', description: 'Plataforma de teologia, estudos exegéticos e devocionais.', icon: 'book', createdAt: Date.now() - 5 * ONE_DAY },
  { id: 'proj-3', title: 'Canal do YouTube', description: 'Roteiros, títulos virais, miniaturas e estratégias de retenção.', icon: 'video', createdAt: Date.now() - 7 * ONE_DAY },
  { id: 'proj-4', title: 'Design & UI/UX', description: 'Identidade visual, paletas de cores e componentes gráficos.', icon: 'palette', createdAt: Date.now() - 10 * ONE_DAY },
];

const INITIAL_SCHEDULED: any[] = [
  { id: 'sch-1', title: 'Briefing Matinal & Notícias', frequency: 'Diário', time: '08:00', prompt: 'Forneça um resumo executivo com os 5 principais destaques de tecnologia, mercado e negócios hoje.', enabled: true },
  { id: 'sch-2', title: 'Revisão de Código & Boas Práticas', frequency: 'Semanal (Segunda)', time: '10:00', prompt: 'Elabore uma lista de verificação de qualidade de código, segurança e escalabilidade para o sprint atual.', enabled: true },
  { id: 'sch-3', title: 'Estudo Exegético Noturno', frequency: 'Diário', time: '21:30', prompt: 'Apresente uma reflexão profunda e fundamentada em um capítulo bíblico com análise histórica.', enabled: false },
];

const INITIAL_LIBRARY: any[] = [
  { id: 'lib-1', title: 'Arquiteto de Software Sênior', category: 'Programação', prompt: 'Atue como um arquiteto de software sênior. Avalie o código a seguir, identifique gargalos de desempenho e refatore com boas práticas de SOLID, Clean Architecture e TypeScript.' },
  { id: 'lib-2', title: 'Validador de Hipóteses e Verdades', category: 'Pesquisa', prompt: 'Analise a seguinte afirmação com rigor científico, buscando evidências empíricas, dados estatísticos e fontes verificáveis, identificando eventuais vieses ou mitos.' },
  { id: 'lib-3', title: 'Copywriter de Alta Conversão', category: 'Marketing', prompt: 'Crie uma copy envolvente e persuasiva para um anúncio no Instagram, focando na dor do cliente, na solução única e em uma chamada para ação irresistível.' },
  { id: 'lib-4', title: 'Gerador de Roteiros para YouTube', category: 'Vídeo', prompt: 'Estruture um roteiro completo de 10 minutos para vídeo do YouTube, com gancho inicial magnético nos primeiros 30 segundos, micro-tópicos dinâmicos e CTA final.' },
];

export const storage = {
  getChats(): ChatSession[] {
    try {
      const data = localStorage.getItem(CHATS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(INITIAL_CHATS));
        return INITIAL_CHATS;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Falha ao ler conversas do localStorage:', err);
      return INITIAL_CHATS;
    }
  },

  saveChats(chats: ChatSession[]): void {
    try {
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
    } catch (err) {
      console.error('Falha ao salvar conversas no localStorage:', err);
    }
  },

  getCurrentChatId(): string | null {
    return localStorage.getItem(CURRENT_CHAT_ID_KEY);
  },

  setCurrentChatId(id: string | null): void {
    if (id) {
      localStorage.setItem(CURRENT_CHAT_ID_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_CHAT_ID_KEY);
    }
  },

  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      const parsed = JSON.parse(data);
      // Migrate old defaults to Souturbo & OLED if not customized
      if (parsed.userProfile?.name === 'Mizael') {
        parsed.userProfile.name = 'Souturbo';
        parsed.userProfile.email = 'souturbo149@gmail.com';
        parsed.userProfile.plan = 'Plus';
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (err) {
      console.error('Falha ao ler configurações:', err);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('Falha ao salvar configurações:', err);
    }
  },

  getProjects(): any[] {
    try {
      const data = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
        return INITIAL_PROJECTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PROJECTS;
    }
  },

  saveProjects(projects: any[]): void {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  },

  getScheduled(): any[] {
    try {
      const data = localStorage.getItem(SCHEDULED_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(SCHEDULED_STORAGE_KEY, JSON.stringify(INITIAL_SCHEDULED));
        return INITIAL_SCHEDULED;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SCHEDULED;
    }
  },

  saveScheduled(scheduled: any[]): void {
    try {
      localStorage.setItem(SCHEDULED_STORAGE_KEY, JSON.stringify(scheduled));
    } catch (e) {
      console.error(e);
    }
  },

  getLibrary(): any[] {
    try {
      const data = localStorage.getItem(LIBRARY_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(INITIAL_LIBRARY));
        return INITIAL_LIBRARY;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_LIBRARY;
    }
  },

  saveLibrary(library: any[]): void {
    try {
      localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
    } catch (e) {
      console.error(e);
    }
  },

  getGallery(): GalleryItem[] {
    try {
      const data = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (err) {
      console.error('Falha ao ler galeria:', err);
      return [];
    }
  },

  saveGalleryItem(item: GalleryItem): void {
    try {
      const current = storage.getGallery();
      const existingIdx = current.findIndex((g) => g.id === item.id);
      let updated: GalleryItem[];
      if (existingIdx >= 0) {
        updated = current.map((g) => (g.id === item.id ? item : g));
      } else {
        updated = [item, ...current];
      }
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Falha ao salvar item na galeria:', err);
    }
  },

  deleteGalleryItem(id: string): void {
    try {
      const current = storage.getGallery();
      const filtered = current.filter((g) => g.id !== id);
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.error('Falha ao excluir item da galeria:', err);
    }
  },
};
