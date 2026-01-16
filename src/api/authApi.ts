import { client } from './client';

// 통합 가입 요청 데이터
export interface SignupRequest {
  googleEmail: string;
  role: 'ROLE_OWNER' | 'ROLE_INSTRUCTOR';
  name: string;
  phone: string;
  contactEmail: string;
  academyName?: string; // 원장일 경우 필수
  inviteCode?: string;  // 강사일 경우 필수
}

// 가입 응답 (토큰 포함)
interface AuthResponse {
  accessToken: string;
}

// 통합 회원가입 API (원장/강사 공용)
export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
  // 백엔드 명세: POST /api/v1/auth/signup
  // 원장이면 academyName 포함, 강사면 inviteCode 포함
  const response = await client.post<AuthResponse>('/auth/signup', data);
  return response.data;
};
