import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

// JWT 토큰 페이로드 타입 정의 (백엔드에서 넣어주는 정보)
interface JwtPayload {
  sub: string; // 구글 이메일
  role: 'ROLE_ADMIN' | 'ROLE_INSTRUCTOR';
  exp: number; // 만료 시간
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: {
    email: string;
    role: 'ROLE_ADMIN' | 'ROLE_INSTRUCTOR' | null;
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
          // 토큰 디코딩하여 사용자 정보 추출
          const decoded = jwtDecode<JwtPayload>(token);
          console.log('Decoded Token:', decoded); // 디버깅용 로그
          
          set({ 
            token, 
            isAuthenticated: true,
            user: {
              email: decoded.sub,
              role: decoded.role
            }
          });
        } catch (error) {
          console.error('Invalid token:', error);
          set({ token: null, isAuthenticated: false, user: null });
        }
      },
      
      logout: () => {
        localStorage.removeItem('auth-storage'); // 확실하게 스토리지 비우기
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
