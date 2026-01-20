import { client } from './client';
import { Lecture } from './lectureApi';

// 학생이 수강 중인 강의 목록 조회
export const getStudentLectures = async (studentId: number): Promise<Lecture[]> => {
  // 백엔드 API: GET /api/v1/students/{studentId}/lectures
  const response = await client.get<Lecture[]>(`/students/${studentId}/lectures`);
  return response.data;
};

// 강의에 학생 등록 (수강 신청)
export const enrollStudent = async (lectureId: number, studentId: number): Promise<void> => {
  // 백엔드 API: POST /api/v1/lecture/{lectureId}/students/{studentId}
  await client.post(`/lecture/${lectureId}/students/${studentId}`);
};

// 강의에서 학생 제외 (수강 취소)
export const removeStudent = async (lectureId: number, studentId: number): Promise<void> => {
  // 백엔드 API: DELETE /api/v1/lecture/{lectureId}/students/{studentId}
  await client.delete(`/lecture/${lectureId}/students/${studentId}`);
};
