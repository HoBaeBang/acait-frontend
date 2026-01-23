import { client } from './client';

export interface Student {
  id: number;
  studentNumber: string; // 학번 (상세 조회 시 사용)
  name: string;
  school: string;
  grade: string;
  parentPhone: string;
  status: 'ATTENDING' | 'DISCHARGED';
  createdAt: string;
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
  const response = await client.get<any[]>('/students');
  return response.data.map((item) => ({
    id: item.id,
    studentNumber: item.studentNumber, // 백엔드 응답에서 매핑
    name: item.name,
    school: item.school,
    grade: item.grade,
    parentPhone: item.parentPhone,
    status: item.status,
    createdAt: item.createdAt,
  }));
};

// 학생 상세 조회
export const getStudent = async (studentNumber: string): Promise<any> => {
  // 백엔드 API: GET /api/v1/students/{studentNumber}
  const response = await client.get(`/students/${studentNumber}`);
  return response.data;
};

// 학생 등록
export const createStudent = async (data: StudentRequest): Promise<void> => {
  await client.post('/students', data);
};

// 학생 수정
export const updateStudent = async (studentNumber: string, data: StudentRequest): Promise<void> => {
  await client.put(`/students/${studentNumber}`, data);
};
