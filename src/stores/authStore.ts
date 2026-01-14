import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

// JWT 토큰 페이로드 타입 정의 (v5.0 멀티 테넌시 반영)
interface JwtPayload {
  sub: string; // 구글 이메일
  role: 'ROLE_OWNER' | 'ROLE_INSTRUCTOR' | 'ROLE_SUPER_ADMIN';
  academyId?: number; // 학원 ID (가입 후 발급됨)
  exp: number;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: {
    email: string;
    role: 'ROLE_OWNER' | 'ROLE_INSTRUCTOR' | 'ROLE_SUPER_ADMIN' | null;
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
              role: decoded.role,
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
