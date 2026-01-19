import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const client = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 주입
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 에러 처리 (토큰 만료 등)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('인증 토큰이 만료되었거나 유효하지 않습니다. 로그아웃 처리합니다.');
      
      // 1. 스토어 초기화 (로그아웃)
      useAuthStore.getState().logout();
      
      // 2. 로그인 페이지로 이동 (window.location 사용이 가장 확실함)
      // React Router의 navigate를 훅 밖에서 쓰기 어렵기 때문
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
