import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

// JWT 토큰 페이로드 타입 정의 (백엔드 실제 응답 반영)
interface JwtPayload {
  sub: string; // 구글 이메일
  auth: 'ROLE_OWNER' | 'ROLE_INSTRUCTOR' | 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN'; // 백엔드는 'auth' 키 사용
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
              // 백엔드의 'auth' 필드를 프론트엔드의 'role'로 매핑
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
    }
  )
);
