import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

// JWT 토큰 페이로드 타입 정의
interface JwtPayload {
  sub: string;
  auth: 'ROLE_OWNER' | 'ROLE_INSTRUCTOR' | 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN';
  academyId?: number; 
  memberId?: number; // 추가됨: 백엔드에서 memberId 클레임 제공 필요
  exp: number;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: {
    id: number | null; // 추가됨
    email: string;
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
              id: decoded.memberId || null, // memberId 매핑
              email: decoded.sub,
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
      version: 2, // 구조 변경으로 버전 업 (1 -> 2)
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // 이전 버전 데이터는 호환되지 않으므로 초기화
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
