import { client } from './client';

export interface Instructor {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  createdAt: string;
}

export interface AcademyInfo {
  id: number;
  name: string;
  inviteCode: string;
  maxMembers: number;
}

// 강사 목록 조회
export const getInstructors = async (): Promise<Instructor[]> => {
  const response = await client.get<any[]>('/admin/instructors'); // 경로 수정
  return response.data.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.contactEmail || item.googleEmail,
    phone: item.phone,
    role: item.role,
    status: item.status,
    createdAt: item.createdAt,
  }));
};

// 강사 승인
export const approveInstructor = async (id: number): Promise<void> => {
  await client.put(`/admin/instructors/${id}/approve`); // 경로 수정
};

// 역할 변경 (추가됨)
export const updateMemberRole = async (id: number, role: string): Promise<void> => {
  await client.put(`/admin/members/${id}/role`, { role });
};

// 내 학원 정보 조회 (추가됨)
export const getMyAcademy = async (): Promise<AcademyInfo> => {
  const response = await client.get<AcademyInfo>('/academies/my');
  return response.data;
};
