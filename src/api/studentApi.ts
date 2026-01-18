import { client } from './client';

export interface Student {
  studentId: number;
  studentNumber: string; // 학번 (자동생성, Read-Only)
  name: string;
  school?: string;
  grade: string; // E1, M1 ...
  birthDate?: string;
  parentPhone: string;
  parentEmail?: string;
  memo?: string;
  status: 'ATTENDING' | 'DISCHARGED'; // 재원/퇴원 상태
  dischargeDate?: string; // 퇴원일 (YYYY-MM-DD)
}

export interface StudentRequest {
  name: string;
  school?: string;
  grade: string;
  birthDate?: string;
  parentPhone: string;
  parentEmail?: string;
  memo?: string;
  status?: 'ATTENDING' | 'DISCHARGED';
  dischargeDate?: string;
}

// 학생 목록 조회
export const getStudents = async (): Promise<Student[]> => {
  const response = await client.get<Student[]>('/students');
  return response.data;
};

// 학생 상세 조회
export const getStudent = async (id: string): Promise<Student> => {
  const response = await client.get<Student>(`/students/${id}`);
  return response.data;
};

// 학생 등록
export const createStudent = async (data: StudentRequest): Promise<void> => {
  await client.post('/students', data);
};

// 학생 수정
export const updateStudent = async (id: string, data: StudentRequest): Promise<void> => {
  await client.put(`/students/${id}`, data);
};

// 학생 삭제 (논리 삭제 - 퇴원 처리)
export const deleteStudent = async (id: number): Promise<void> => {
  await client.delete(`/students/${id}`);
};
