import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

// JWT 토큰 페이로드 타입 정의
interface JwtPayload {
  sub: string;
  auth: 'ROLE_OWNER' | 'ROLE_INSTRUCTOR' | 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN';
  academyId?: number; 
  exp: number;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: {
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
      version: 1, // 버전 관리: 구조 변경 시 버전을 올리면 이전 데이터 무시됨
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // 버전 0에서 1로 마이그레이션 할 때 처리 (필요 시)
          // 여기서는 그냥 초기화
          return { token: null, isAuthenticated: false, user: null };
        }
        return persistedState as AuthState;
      },
      onRehydrateStorage: () => (state) => {
        // 스토리지 복원 후 실행됨
        if (!state) {
          console.warn('Auth store hydration failed. Clearing storage.');
          localStorage.removeItem('auth-storage');
        }
      },
    }
  )
);
