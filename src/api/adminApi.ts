import { client } from './client';

export interface Instructor {
  id: number; // memberId -> id로 수정 (백엔드 MemberResponse 일치)
  name: string;
  email: string; // googleEmail 또는 contactEmail 매핑 필요 (아래 getInstructors에서 처리)
  phone: string;
  role: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  createdAt: string;
}

// 강사 목록 조회
export const getInstructors = async (): Promise<Instructor[]> => {
  const response = await client.get<any[]>('/instructors');
  // 백엔드 응답(MemberResponse)을 프론트엔드 모델(Instructor)로 매핑
  return response.data.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.contactEmail || item.googleEmail, // 연락처 이메일 우선
    phone: item.phone,
    role: item.role,
    status: item.status,
    createdAt: item.createdAt,
  }));
};

// 강사 승인
export const approveInstructor = async (id: number): Promise<void> => {
  await client.put(`/instructors/${id}/approve`);
};
