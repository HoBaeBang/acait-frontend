import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

// JWT 토큰 페이로드 타입 정의
interface JwtPayload {
  sub: string;
  auth: 'ROLE_OWNER' | 'ROLE_INSTRUCTOR' | 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN';
  academyId?: number; 
  memberId?: number;
  name?: string; // 추가됨: 사용자 이름
  exp: number;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: {
    id: number | null;
    email: string;
    name: string; // 추가됨
    role: 'ROLE_OWNER' | 'ROLE_INSTRUCTOR' | 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN' | null;
    academyId: number | null;
  } | null;
  
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      
      setToken: (token: string) => {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          console.log('Decoded Token:', decoded);
          
          set({ 
            token, 
            isAuthenticated: true,
            user: {
              id: decoded.memberId || null,
              email: decoded.sub,
              name: decoded.name || decoded.sub.split('@')[0], // 이름이 없으면 이메일 앞부분 사용
              role: decoded.auth, 
              academyId: decoded.academyId || null
            }
          });
        } catch (error) {
          console.error('Invalid token:', error);
          set({ token: null, isAuthenticated: false, user: null });
        }
      },
      
      logout: () => {
        localStorage.removeItem('auth-storage');
        set({ 
          token: null, 
          isAuthenticated: false, 
          user: null 
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      version: 3, // 구조 변경으로 버전 업 (2 -> 3)
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          return { token: null, isAuthenticated: false, user: null };
        }
        return persistedState as AuthState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) {
          console.warn('Auth store hydration failed. Clearing storage.');
          localStorage.removeItem('auth-storage');
        }
      },
    }
  )
);
