import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Axios 인스턴스 생성
export const client = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // 백엔드 API 기본 주소
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정
// 모든 API 요청 전에 실행되어 헤더에 토큰을 자동으로 추가합니다.
client.interceptors.request.use(
  (config) => {
    // Zustand 스토어에서 토큰 가져오기 (getState()로 훅 밖에서도 접근 가능)
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정 (선택 사항)
// 401 에러(토큰 만료 등) 발생 시 로그아웃 처리 등을 할 수 있습니다.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우 로그아웃 처리
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
