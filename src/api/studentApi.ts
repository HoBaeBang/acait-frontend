import { client } from './client';

export interface Student {
  studentId: number;
  name: string;
  school?: string;
  grade?: string;
  birthDate?: string; // "MMDD" 4자리
  parentPhone: string;
  parentEmail?: string;
  memo?: string;
}

export interface StudentRequest {
  name: string;
  school?: string;
  grade?: string;
  birthDate?: string;
  parentPhone: string;
  parentEmail?: string;
  memo?: string;
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

// 학생 삭제
export const deleteStudent = async (id: number): Promise<void> => {
  await client.delete(`/students/${id}`);
};
