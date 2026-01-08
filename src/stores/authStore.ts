import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

// Zustand 스토어 생성
// persist 미들웨어를 사용하여 새로고침해도 데이터가 유지되도록 설정 (localStorage 사용)
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      
      setToken: (token: string) => set({ 
        token, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        token: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage', // localStorage에 저장될 키 이름
    }
  )
);
