import { create } from 'zustand';
import { Message } from '../types';
import { MessageModel } from '../types/models';

interface MessageStore {
  messages: Message[];
  
  // CRUD operations
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  clearHistory: () => void;
  
  // Query operations
  getMessageById: (id: string) => Message | undefined;
  getMessagesByRole: (role: 'user' | 'assistant') => Message[];
  getRecentMessages: (count: number) => Message[];
  
  // Utility operations
  getMessageCount: () => number;
  getLastMessage: () => Message | undefined;
  hasMessages: () => boolean;
  
  // Streaming operations for real-time responses
  startStreamingMessage: (role: 'user' | 'assistant', initialText?: string) => string;
  updateStreamingMessage: (id: string, token: string) => void;
  completeStreamingMessage: (id: string) => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: [],
  
  // CRUD operations
  addMessage: (messageData) => {
    const message = MessageModel.create(
      messageData.role,
      messageData.text,
      messageData.metadata
    );
    
    if (messageData.status) {
      message.status = messageData.status;
    }
    
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },
  
  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      )
    }));
  },
  
  deleteMessage: (id) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id)
    }));
  },
  
  clearHistory: () => set({ messages: [] }),
  
  // Query operations
  getMessageById: (id) => {
    return get().messages.find((msg) => msg.id === id);
  },
  
  getMessagesByRole: (role) => {
    return get().messages.filter((msg) => msg.role === role);
  },
  
  getRecentMessages: (count) => {
    const messages = get().messages;
    return messages.slice(-count);
  },
  
  // Utility operations
  getMessageCount: () => get().messages.length,
  
  getLastMessage: () => {
    const messages = get().messages;
    return messages[messages.length - 1];
  },
  
  hasMessages: () => get().messages.length > 0,
  
  // Streaming operations
  startStreamingMessage: (role, initialText = '') => {
    const message = MessageModel.create(role, initialText);
    message.status = 'sending';
    
    set((state) => ({
      messages: [...state.messages, message]
    }));
    
    return message.id;
  },
  
  updateStreamingMessage: (id, token) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id 
          ? { ...msg, text: msg.text + token }
          : msg
      )
    }));
  },
  
  completeStreamingMessage: (id) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id 
          ? { ...msg, status: 'sent' as const }
          : msg
      )
    }));
  },
}));