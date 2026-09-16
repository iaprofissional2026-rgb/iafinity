export type ModelMode = 'alta' | 'media' | 'rapida' | 'fast' | 'thinking' | 'pro';

export interface GroundingSource {
  title: string;
  url?: string;
  uri?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document' | 'text';
  mimeType: string;
  size: number;
  data: string; // base64 data string
  previewUrl?: string;
}

export interface ImageMediaResult {
  url: string;
  originalUrl?: string;
  prompt: string;
  enhancedPrompt?: string;
  model: string;
  style?: string;
  aspectRatio?: string;
  quality?: string;
}

export interface VideoMediaJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  prompt: string;
  model: string;
  aspectRatio?: string;
  duration?: number;
  error?: string;
}

export interface AudioMediaResult {
  audioUrl: string;
  text: string;
  voiceName?: string;
  model: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  originalUrl?: string;
  prompt: string;
  model: string;
  createdAt: number;
  conversationId?: string;
  aspectRatio?: string;
  duration?: number;
}

export type ComposerToolMode = 'chat' | 'image' | 'video' | 'audio';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  thought?: string; // Deep reasoning thought chain
  groundingSources?: GroundingSource[];
  sources?: GroundingSource[];
  attachments?: Attachment[];
  createdAt: number;
  modelMode?: ModelMode;
  isError?: boolean;
  liked?: boolean | null;
  // Multimodal outputs
  imageResult?: ImageMediaResult;
  videoJob?: VideoMediaJob;
  audioResult?: AudioMediaResult;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  modelMode: ModelMode;
  isPinned?: boolean;
  projectId?: string;
  customIcon?: 'cube' | 'avatar' | 'chat';
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'Plus' | 'Pro' | 'Free';
  isLoggedIn: boolean;
}

export interface UserSettings {
  theme: 'system' | 'dark' | 'light' | 'oled';
  accentColor: 'emerald' | 'blue' | 'purple' | 'orange';
  responseStyle: 'concise' | 'balanced' | 'detailed';
  language: string;
  memoryEnabled: boolean;
  memoryContent: string;
  deepThinkingEnabled: boolean;
  googleSearchGrounding: boolean;
  userProfile: UserProfile;
  freeOnlyMode: boolean;
  preferredImageModel?: string;
  preferredVideoModel?: string;
  preferredVoiceModel?: string;
}

export interface SuggestionPrompt {
  tag: string;
  title: string;
  prompt: string;
  mode?: ModelMode;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  createdAt: number;
}

export interface ScheduledTask {
  id: string;
  title: string;
  frequency: string;
  time: string;
  prompt: string;
  enabled: boolean;
}

export interface LibraryPrompt {
  id: string;
  title: string;
  category: string;
  prompt: string;
}
