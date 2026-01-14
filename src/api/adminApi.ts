import { client } from './client';

export interface Instructor {
  memberId: number;
  name: string;
  email: string; // googleEmail
  phone: string;
  role: 'ROLE_ADMIN' | 'ROLE_INSTRUCTOR';
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  createdAt: string;
}

// 전체 강사 목록 조회 (원장용)
export const getInstructors = async (): Promise<Instructor[]> => {
  const response = await client.get<Instructor[]>('/instructors');
  return response.data;
};

// 강사 가입 승인
export const approveInstructor = async (memberId: number): Promise<void> => {
  await client.put(`/instructors/${memberId}/approve`);
};
