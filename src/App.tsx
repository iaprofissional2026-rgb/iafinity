import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChatSession,
  ChatMessage,
  ModelMode,
  UserSettings,
  Attachment,
  GroundingSource,
  ComposerToolMode,
  GalleryItem,
} from './types/index.ts';
import { storage } from './services/storage.ts';
import { streamChat, generateChatTitle } from './services/api.ts';
import {
  generateImage,
  createVideo,
  getVideoStatus,
  textToSpeech,
} from './services/mediaApi.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { WelcomeScreen } from './components/WelcomeScreen.tsx';
import { ChatMessageItem } from './components/ChatMessageItem.tsx';
import { MessageInput } from './components/MessageInput.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { ImageStudioModal } from './components/ImageStudioModal.tsx';
import { LibraryModal } from './components/LibraryModal.tsx';
import { ProjectsModal } from './components/ProjectsModal.tsx';
import { ScheduledModal } from './components/ScheduledModal.tsx';
import { PluginsModal } from './components/PluginsModal.tsx';
import { MoreMenuModal } from './components/MoreMenuModal.tsx';
import { GalleryModal } from './components/GalleryModal.tsx';
import { ArrowDown, WifiOff, AlertTriangle } from 'lucide-react';

export default function App() {
  const [chats, setChats] = useState<ChatSession[]>(() => storage.getChats());
  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    const savedId = storage.getCurrentChatId();
    const chatsList = storage.getChats();
    if (savedId && chatsList.some((c) => c.id === savedId)) {
      return savedId;
    }
    return chatsList[0]?.id || null;
  });

  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [currentMode, setCurrentMode] = useState<ModelMode>('alta');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('lionfinity_sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch (_) {
      return false;
    }
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImagesOpen, setIsImagesOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isScheduledOpen, setIsScheduledOpen] = useState(false);
  const [isPluginsOpen, setIsPluginsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Composer tools state
  const [composerToolMode, setComposerToolMode] = useState<ComposerToolMode>('chat');
  const [composerContent, setComposerContent] = useState('');
  const [composerSourceImage, setComposerSourceImage] = useState<string | undefined>(undefined);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  // Toggle sidebar for both Notebook/Desktop and Mobile
  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpenMobile((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('lionfinity_sidebar_collapsed', JSON.stringify(next));
        } catch (_) {}
        return next;
      });
    }
  };

  // Keyboard shortcut: Ctrl + B (or Cmd + B) to toggle sidebar on notebook / desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active chat session
  const currentChat = useMemo(() => {
    return chats.find((c) => c.id === currentChatId) || null;
  }, [chats, currentChatId]);

  // Sync mode with current chat or fallback
  useEffect(() => {
    if (currentChat && currentChat.modelMode) {
      setCurrentMode(currentChat.modelMode);
    }
  }, [currentChatId]);

  // Persist chats whenever modified
  useEffect(() => {
    storage.saveChats(chats);
  }, [chats]);

  // Persist current chat ID
  useEffect(() => {
    storage.setCurrentChatId(currentChatId);
  }, [currentChatId]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme and accent application (OLED vs dark vs light and accent color)
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'oled' ||
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
      if (settings.theme === 'oled') {
        root.classList.add('oled-theme');
        root.setAttribute('data-theme', 'oled');
      } else {
        root.classList.remove('oled-theme');
        root.setAttribute('data-theme', 'dark');
      }
    } else {
      root.classList.remove('dark');
      root.classList.remove('oled-theme');
      root.setAttribute('data-theme', 'light');
    }

    // Accent attribute sync
    root.setAttribute('data-accent', settings.accentColor || 'emerald');
  }, [settings.theme, settings.accentColor]);

  // Scroll handler to show / hide "Ir para o final" button
  const handleScroll = () => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 160);
  };

  const scrollToBottom = (smooth = true) => {
    if (bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  // Auto-scroll when messages update or during streaming
  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom(false);
    }
  }, [currentChat?.messages, isGenerating]);

  // Start a new chat
  const handleNewChat = () => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    setCurrentChatId(null);
    setApiError(null);
  };

  const handleSelectChat = (id: string) => {
    if (id === currentChatId) return;
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    setCurrentChatId(id);
    setApiError(null);
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (currentChatId === id) {
        setCurrentChatId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  const handleTogglePinChat = (id: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isPinned: !c.isPinned, updatedAt: Date.now() } : c
      )
    );
  };

  const handleClearAllChats = () => {
    setChats([]);
    setCurrentChatId(null);
    storage.saveChats([]);
  };

  const handleSelectMode = (mode: ModelMode) => {
    setCurrentMode(mode);
    if (currentChatId) {
      setChats((prev) =>
        prev.map((c) => (c.id === currentChatId ? { ...c, modelMode: mode } : c))
      );
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Core Send and Stream Handler with Multimodal & Thought Chain
  const handleSendMessage = async (
    content: string,
    attachments: Attachment[] = [],
    toolMode: ComposerToolMode = 'chat',
    toolOptions: any = {}
  ) => {
    if (isGenerating) return;
    setApiError(null);

    // Reset composer state if preloaded
    setComposerContent('');
    setComposerSourceImage(undefined);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'user',
      content,
      attachments,
      createdAt: Date.now(),
    };

    const modelMessageId = `model-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const initialModelMessage: ChatMessage = {
      id: modelMessageId,
      role: 'model',
      content: '',
      thought: '',
      sources: [],
      createdAt: Date.now(),
      modelMode: currentMode,
    };

    let targetChatId = currentChatId;
    let isNewChat = false;

    // Create session if starting from Welcome Screen
    if (!targetChatId) {
      isNewChat = true;
      targetChatId = `chat-${Date.now()}`;
      const newSession: ChatSession = {
        id: targetChatId,
        title: content.trim() ? content.slice(0, 32) : 'Nova conversa',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMessage, initialModelMessage],
        modelMode: currentMode,
      };

      setChats((prev) => [newSession, ...prev]);
      setCurrentChatId(targetChatId);
    } else {
      // Append to active chat
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === targetChatId) {
            return {
              ...c,
              updatedAt: Date.now(),
              messages: [...c.messages, userMessage, initialModelMessage],
            };
          }
          return c;
        })
      );
    }

    // Smart title generation on first turn
    if (isNewChat && content.trim()) {
      generateChatTitle(content).then((smartTitle) => {
        setChats((prev) =>
          prev.map((c) => (c.id === targetChatId ? { ...c, title: smartTitle } : c))
        );
      });
    }

    // MULTIMODAL: IMAGE (Recraft V4.1 Free)
    if (toolMode === 'image') {
      setIsGenerating(true);
      setChats((prev) =>
        prev.map((c) =>
          c.id === targetChatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === modelMessageId
                    ? { ...m, content: 'Gerando imagem com Recraft V4.1 Free...' }
                    : m
                ),
              }
            : c
        )
      );

      try {
        const imageResult = await generateImage({
          prompt: content,
          style: toolOptions.style,
          aspectRatio: toolOptions.aspectRatio,
          quality: toolOptions.quality,
          sourceImage: toolOptions.sourceImage,
        });

        // Save to gallery
        storage.saveGalleryItem({
          id: `img-${Date.now()}`,
          type: 'image',
          url: imageResult.url,
          originalUrl: imageResult.originalUrl,
          prompt: content,
          model: imageResult.model,
          createdAt: Date.now(),
          conversationId: targetChatId,
          aspectRatio: imageResult.aspectRatio,
        });

        setChats((prev) =>
          prev.map((c) =>
            c.id === targetChatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === modelMessageId
                      ? {
                          ...m,
                          content: imageResult.originalUrl
                            ? 'Sua imagem foi editada com sucesso.'
                            : 'Aqui está sua imagem criada com o modelo Recraft V4.1 Free.',
                          imageResult,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      } catch (err: any) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === targetChatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === modelMessageId
                      ? {
                          ...m,
                          content: err.message || 'Modelo gratuito temporariamente indisponível.',
                          isError: true,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // MULTIMODAL: VIDEO (Kling V3 Free)
    if (toolMode === 'video') {
      setIsGenerating(true);
      try {
        const job = await createVideo({
          prompt: content,
          sourceImage: toolOptions.sourceImage,
          aspectRatio: toolOptions.aspectRatio,
          duration: toolOptions.duration,
          generateAudio: toolOptions.generateAudio,
        });

        setChats((prev) =>
          prev.map((c) =>
            c.id === targetChatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === modelMessageId
                      ? {
                          ...m,
                          content: '',
                          videoJob: job,
                        }
                      : m
                  ),
                }
              : c
          )
        );

        // Poll video job status every 3s
        const pollInterval = setInterval(async () => {
          try {
            const status = await getVideoStatus(job.jobId);
            setChats((prev) =>
              prev.map((c) =>
                c.id === targetChatId
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === modelMessageId
                          ? {
                              ...m,
                              videoJob: status,
                              content:
                                status.status === 'completed'
                                  ? 'Seu vídeo foi gerado com sucesso pelo modelo Kling Free.'
                                  : m.content,
                            }
                          : m
                      ),
                    }
                  : c
              )
            );

            if (status.status === 'completed') {
              clearInterval(pollInterval);
              setIsGenerating(false);
              if (status.videoUrl) {
                storage.saveGalleryItem({
                  id: `vid-${Date.now()}`,
                  type: 'video',
                  url: status.videoUrl,
                  prompt: content,
                  model: status.model,
                  createdAt: Date.now(),
                  conversationId: targetChatId,
                  aspectRatio: status.aspectRatio,
                  duration: status.duration,
                });
              }
            } else if (status.status === 'failed') {
              clearInterval(pollInterval);
              setIsGenerating(false);
            }
          } catch {
            // Keep polling
          }
        }, 3000);
      } catch (err: any) {
        setIsGenerating(false);
        setChats((prev) =>
          prev.map((c) =>
            c.id === targetChatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === modelMessageId
                      ? {
                          ...m,
                          content: err.message || 'Modelo gratuito temporariamente indisponível.',
                          isError: true,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      }
      return;
    }

    // MULTIMODAL: AUDIO (Fish Audio Free)
    if (toolMode === 'audio') {
      setIsGenerating(true);
      setChats((prev) =>
        prev.map((c) =>
          c.id === targetChatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === modelMessageId
                    ? { ...m, content: 'Sintetizando voz com Fish Audio Free...' }
                    : m
                ),
              }
            : c
        )
      );

      try {
        const audioResult = await textToSpeech({
          text: content,
          voice: toolOptions.voice,
        });

        storage.saveGalleryItem({
          id: `aud-${Date.now()}`,
          type: 'audio',
          url: audioResult.audioUrl,
          prompt: content,
          model: audioResult.model,
          createdAt: Date.now(),
          conversationId: targetChatId,
        });

        setChats((prev) =>
          prev.map((c) =>
            c.id === targetChatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === modelMessageId
                      ? {
                          ...m,
                          content: 'Áudio sintetizado com sucesso.',
                          audioResult,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      } catch (err: any) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === targetChatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === modelMessageId
                      ? {
                          ...m,
                          content: err.message || 'Modelo gratuito temporariamente indisponível.',
                          isError: true,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // STANDARD CHAT STREAMING
    const existingMessages = currentChat?.messages || [];
    const conversationHistory: ChatMessage[] = [...existingMessages, userMessage];

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);

    let accumulatedContent = '';
    let accumulatedThought = '';

    await streamChat({
      messages: conversationHistory,
      modelMode: currentMode,
      deepThinking: settings.deepThinkingEnabled || currentMode === 'alta',
      useGoogleSearch: settings.googleSearchGrounding,
      memory: settings.memoryEnabled ? settings.memoryContent : undefined,
      responseStyle: settings.responseStyle,
      signal: controller.signal,
      onChunk: (chunk) => {
        accumulatedContent += chunk;
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === targetChatId) {
              const updatedMessages = c.messages.map((m) =>
                m.id === modelMessageId ? { ...m, content: accumulatedContent } : m
              );
              return { ...c, messages: updatedMessages };
            }
            return c;
          })
        );
      },
      onThought: (thoughtChunk) => {
        accumulatedThought += thoughtChunk;
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === targetChatId) {
              const updatedMessages = c.messages.map((m) =>
                m.id === modelMessageId ? { ...m, thought: accumulatedThought } : m
              );
              return { ...c, messages: updatedMessages };
            }
            return c;
          })
        );
      },
      onSources: (sources: GroundingSource[]) => {
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === targetChatId) {
              const updatedMessages = c.messages.map((m) =>
                m.id === modelMessageId ? { ...m, sources } : m
              );
              return { ...c, messages: updatedMessages };
            }
            return c;
          })
        );
      },
      onError: (err) => {
        setIsGenerating(false);
        setApiError(err);
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === targetChatId) {
              const updatedMessages = c.messages.map((m) =>
                m.id === modelMessageId
                  ? {
                      ...m,
                      content:
                        accumulatedContent ||
                        'Modelo gratuito temporariamente indisponível.',
                      isError: true,
                    }
                  : m
              );
              return { ...c, messages: updatedMessages };
            }
            return c;
          })
        );
      },
      onDone: () => {
        setIsGenerating(false);
        abortControllerRef.current = null;
      },
    });
  };

  // Regenerate last AI response
  const handleRegenerate = async () => {
    if (!currentChat || currentChat.messages.length < 2 || isGenerating) return;

    const messages = currentChat.messages;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'model') return;

    const historyWithoutLast = messages.slice(0, -1);
    const modelMessageId = `model-${Date.now()}`;
    const newModelMsg: ChatMessage = {
      id: modelMessageId,
      role: 'model',
      content: '',
      thought: '',
      sources: [],
      createdAt: Date.now(),
      modelMode: currentMode,
    };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === currentChat.id) {
          return {
            ...c,
            updatedAt: Date.now(),
            messages: [...historyWithoutLast, newModelMsg],
          };
        }
        return c;
      })
    );

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);
    let accumulatedContent = '';
    let accumulatedThought = '';

    await streamChat({
      messages: historyWithoutLast,
      modelMode: currentMode,
      deepThinking: settings.deepThinkingEnabled || currentMode === 'alta',
      useGoogleSearch: settings.googleSearchGrounding,
      memory: settings.memoryEnabled ? settings.memoryContent : undefined,
      responseStyle: settings.responseStyle,
      signal: controller.signal,
      onChunk: (chunk) => {
        accumulatedContent += chunk;
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === currentChat.id) {
              const updated = c.messages.map((m) =>
                m.id === modelMessageId ? { ...m, content: accumulatedContent } : m
              );
              return { ...c, messages: updated };
            }
            return c;
          })
        );
      },
      onThought: (thoughtChunk) => {
        accumulatedThought += thoughtChunk;
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === currentChat.id) {
              const updated = c.messages.map((m) =>
                m.id === modelMessageId ? { ...m, thought: accumulatedThought } : m
              );
              return { ...c, messages: updated };
            }
            return c;
          })
        );
      },
      onSources: (sources) => {
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === currentChat.id) {
              const updated = c.messages.map((m) =>
                m.id === modelMessageId ? { ...m, sources } : m
              );
              return { ...c, messages: updated };
            }
            return c;
          })
        );
      },
      onError: (err) => {
        setIsGenerating(false);
        setApiError(err);
      },
      onDone: () => {
        setIsGenerating(false);
        abortControllerRef.current = null;
      },
    });
  };

  // Edit an earlier user message and re-generate
  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!currentChat || isGenerating) return;

    const messageIndex = currentChat.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    const priorMessages = currentChat.messages.slice(0, messageIndex);
    const editedUserMsg: ChatMessage = {
      ...currentChat.messages[messageIndex],
      content: newContent,
    };

    const modelMessageId = `model-${Date.now()}`;
    const newModelMsg: ChatMessage = {
      id: modelMessageId,
      role: 'model',
      content: '',
      thought: '',
      sources: [],
      createdAt: Date.now(),
      modelMode: currentMode,
    };

    const newHistory = [...priorMessages, editedUserMsg];

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === currentChat.id) {
          return {
            ...c,
            updatedAt: Date.now(),
            messages: [...newHistory, newModelMsg],
          };
        }
        return c;
      })
    );

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);
    let accumulatedContent = '';
    let accumulatedThought = '';

    await streamChat({
      messages: newHistory,
      modelMode: currentMode,
      deepThinking: settings.deepThinkingEnabled || currentMode === 'alta',
      useGoogleSearch: settings.googleSearchGrounding,
      memory: settings.memoryEnabled ? settings.memoryContent : undefined,
      responseStyle: settings.responseStyle,
      signal: controller.signal,
      onChunk: (chunk) => {
        accumulatedContent += chunk;
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === currentChat.id) {
              const updated = c.messages.map((m) =>
                m.id === modelMessageId ? { ...m, content: accumulatedContent } : m
              );
              return { ...c, messages: updated };
            }
            return c;
          })
        );
      },
      onThought: (thoughtChunk) => {
        accumulatedThought += thoughtChunk;
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === currentChat.id) {
              const updated = c.messages.map((m) =>
                m.id === modelMessageId ? { ...m, thought: accumulatedThought } : m
              );
              return { ...c, messages: updated };
            }
            return c;
          })
        );
      },
      onSources: (sources) => {
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === currentChat.id) {
              const updated = c.messages.map((m) =>
                m.id === modelMessageId ? { ...m, sources } : m
              );
              return { ...c, messages: updated };
            }
            return c;
          })
        );
      },
      onError: (err) => {
        setIsGenerating(false);
        setApiError(err);
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === currentChat.id) {
              const updated = c.messages.map((m) =>
                m.id === modelMessageId
                  ? {
                      ...m,
                      isError: true,
                      content:
                        m.content.trim().length > 0
                          ? m.content
                          : err || 'Modelo gratuito temporariamente indisponível. Por favor, tente novamente.',
                    }
                  : m
              );
              return { ...c, messages: updated };
            }
            return c;
          })
        );
      },
      onDone: () => {
        setIsGenerating(false);
        abortControllerRef.current = null;
      },
    });
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const handleTransformToVideo = (imageUrl: string, _prompt: string) => {
    setComposerToolMode('video');
    setComposerSourceImage(imageUrl);
    setComposerContent('Crie uma animação fluida e realista em alta definição a partir desta imagem');
  };

  const handleEditImageAgain = (imageUrl: string, prompt: string) => {
    setComposerToolMode('image');
    setComposerSourceImage(imageUrl);
    setComposerContent(prompt);
  };

  const handleReuseFromGallery = (item: GalleryItem) => {
    setComposerToolMode(item.type);
    if (item.type === 'image') {
      setComposerSourceImage(item.url);
    }
    setComposerContent(item.prompt);
  };

  const handleRetryMedia = (message: ChatMessage) => {
    if (message.imageResult) {
      handleSendMessage(message.imageResult.prompt, [], 'image', {
        style: message.imageResult.style,
        aspectRatio: message.imageResult.aspectRatio,
        sourceImage: message.imageResult.originalUrl,
      });
    } else if (message.videoJob) {
      handleSendMessage(message.videoJob.prompt, [], 'video', {
        aspectRatio: message.videoJob.aspectRatio,
        duration: message.videoJob.duration,
      });
    } else if (message.audioResult) {
      handleSendMessage(message.audioResult.text, [], 'audio');
    } else {
      handleRegenerate();
    }
  };

  const hasMessages = currentChat && currentChat.messages.length > 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors select-text">
      {/* Offline Warning Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-neutral-950 font-semibold px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-4 h-4" />
          <span>Você está offline. As mensagens poderão falhar até a conexão ser restabelecida.</span>
        </div>
      )}

      {/* Sidebar Desktop, Notebook & Mobile Drawer */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        onTogglePinChat={handleTogglePinChat}
        userProfile={settings.userProfile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenImages={() => setIsImagesOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onOpenScheduled={() => setIsScheduledOpen(true)}
        onOpenPlugins={() => setIsPluginsOpen(true)}
        onOpenMore={() => setIsMoreOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-transparent">
        {/* Header Bar */}
        <Header
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
          onNewChat={handleNewChat}
        />

        {/* API Error Toast if present */}
        {apiError && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-xs font-bold hover:underline ml-3"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Chat Stream / Messages or Welcome Screen */}
        <div
          ref={chatScrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between relative"
        >
          {!hasMessages ? (
            <WelcomeScreen
              userName={settings.userProfile.name}
              onSelectSuggestion={(prompt, mode) => {
                if (mode) handleSelectMode(mode);
                handleSendMessage(prompt, []);
              }}
            />
          ) : (
            <div className="w-full pb-8">
              {currentChat.messages.map((msg, index) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  isLast={index === currentChat.messages.length - 1}
                  isGenerating={isGenerating}
                  onRegenerate={handleRegenerate}
                  onEditMessage={handleEditMessage}
                  onTransformToVideo={handleTransformToVideo}
                  onEditImageAgain={handleEditImageAgain}
                  onRetryMedia={handleRetryMedia}
                />
              ))}
              <div ref={bottomAnchorRef} />
            </div>
          )}
        </div>

        {/* Scroll To Bottom Floating Button */}
        {showScrollBottom && hasMessages && (
          <button
            id="btn-scroll-bottom"
            onClick={() => scrollToBottom(true)}
            className="absolute right-6 bottom-32 z-20 p-2.5 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all active:scale-95"
            title="Ir para o final"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {/* Input Composer Box */}
        <MessageInput
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onStopGeneration={handleStopGeneration}
          memoryActive={settings.memoryEnabled}
          activeToolMode={composerToolMode}
          onToolModeChange={setComposerToolMode}
          initialContent={composerContent}
          initialSourceImage={composerSourceImage}
        />
      </div>

      {/* Modals */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onReuseInChat={handleReuseFromGallery}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <ImageStudioModal
        isOpen={isImagesOpen}
        onClose={() => setIsImagesOpen(false)}
        onSendToChat={(url, prompt) => {
          handleSendMessage(`[Imagem Gerada: ${prompt}]\n\n![${prompt}](${url})`);
        }}
      />

      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectPrompt={(prompt) => {
          handleSendMessage(prompt);
        }}
      />

      <ProjectsModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        chats={chats}
        onOpenChat={handleSelectChat}
        onCreateChatInProject={(projectTitle) => {
          handleSendMessage(`Iniciando trabalho focado no projeto: ${projectTitle}. Vamos estruturar os primeiros passos?`);
        }}
      />

      <ScheduledModal
        isOpen={isScheduledOpen}
        onClose={() => setIsScheduledOpen(false)}
        onRunPromptNow={(prompt) => {
          handleSendMessage(prompt);
        }}
      />

      <PluginsModal
        isOpen={isPluginsOpen}
        onClose={() => setIsPluginsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <MoreMenuModal
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        chats={chats}
        onClearChats={handleClearAllChats}
        onOpenSettings={() => {
          setIsMoreOpen(false);
          setIsSettingsOpen(true);
        }}
      />
    </div>
  );
}
