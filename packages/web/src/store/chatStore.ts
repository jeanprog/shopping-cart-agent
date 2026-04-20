import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatProductPreview } from '../types/chat';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  /** Sugestões da IA (carrossel), só em mensagens do assistente */
  products?: ChatProductPreview[];
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  /** Se ausente, tratamos como true (contas antigas / mock). */
  onboardingCompleted?: boolean;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  token: string | null;
  user: User | null;
  
  // Actions
  addMessage: (
    content: string,
    role: 'user' | 'assistant',
    products?: ChatProductPreview[],
  ) => void;
  setLoading: (loading: boolean) => void;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      token: null,
      user: null,

      addMessage: (content, role, products) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              role,
              content,
              timestamp: new Date().toISOString(),
              ...(role === 'assistant' && products?.length
                ? { products }
                : {}),
            },
          ],
        })),

      setLoading: (isLoading) => set({ isLoading }),
      
      setAuth: (token, user) => set({ token, user }),

      setUser: (user) => set({ user }),
      
      logout: () => set({ token: null, user: null, messages: [] }),
      
      clearChat: () => set({ messages: [] }),
    }),
    {
      name: 'shopping-chat-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);