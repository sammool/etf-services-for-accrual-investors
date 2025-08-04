import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiService from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // 상태
      user: null,
      token: null,
      isAuthenticated: false,
      
      // 액션
      login: (userData, token) => {
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
        });
      },
      
      logout: async () => {
        try {
          // 서버에 로그아웃 요청
          await apiService.logout();
        } catch (error) {
          console.error('로그아웃 API 호출 실패:', error);
          // API 호출이 실패해도 로컬 상태는 초기화
        }
        
        // 로컬 상태 초기화
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },
      
      // 토큰 헤더 생성
      getAuthHeaders: () => {
        const { token } = get();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    {
      name: 'auth-storage', // localStorage 키
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore; 