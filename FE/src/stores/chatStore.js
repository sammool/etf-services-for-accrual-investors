import { create } from 'zustand';
import apiService from '../services/api';

const useChatStore = create((set, get) => ({
  // 상태
  messages: [],
  isLoading: false,
  isStreaming: false,
  
  // 액션
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },
  
  updateLastMessage: (content) => {
    set((state) => {
      const newMessages = [...state.messages];
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          content: content
        };
      }
      return { messages: newMessages };
    });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  setStreaming: (streaming) => {
    set({ isStreaming: streaming });
  },
  
  clearMessages: () => {
    set({ messages: [] });
  },
  
  // 대화 히스토리 로드
  loadHistory: async () => {
    set({ isLoading: true });
    try {
      const history = await apiService.loadChatHistory();
      if (history.messages && history.messages.length > 0) {
        // DB에서 가져온 메시지를 프론트엔드 형식으로 변환
        const formattedMessages = history.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at
        }));
        set({ messages: formattedMessages, isLoading: false });
      } else {
        // 대화 히스토리가 없으면 초기 메시지 설정
        get().initializeChat();
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('대화 히스토리 로드 실패:', error);
      // 에러 시 초기 메시지 설정
      get().initializeChat();
      set({ isLoading: false });
    }
  },
  
  // 초기 메시지 설정
  initializeChat: () => {
    const initialMessage = {
      id: Date.now(),
      role: 'assistant',
      content: '안녕하세요! ETF 알림 챗봇입니다. 궁금한 점이나 투자 관련 질문을 입력해 주세요.',
      timestamp: new Date().toISOString()
    };
    set({ messages: [initialMessage] });
  }
}));

export default useChatStore; 