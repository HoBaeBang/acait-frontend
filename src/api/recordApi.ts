import { client } from './client';

export interface LectureRecordRequest {
  lectureId: number;
  studentId: number;
  date: string; // YYYY-MM-DD
  attendanceStatus: 'ATTENDED' | 'LATE' | 'ABSENT' | 'REQ_MAKEUP' | 'MAKEUP';
  dailyLog?: string;
  actualStartTime?: string; // HH:mm
  actualEndTime?: string; // HH:mm
  linkedRecordId?: number; // 보강일 경우 원본 기록 ID
}

// 보강 필요 학생 정보
export interface MakeupRequiredStudent {
  recordId: number;
  studentId: number;
  studentName: string;
  lectureName: string;
  absentDate: string; // 결석한 날짜
}

// 수업 기록 저장
export const createRecord = async (data: LectureRecordRequest): Promise<void> => {
  await client.post('/records', data);
};

// 특정 수업의 기록 조회 (단건)
export const getRecord = async (recordId: number): Promise<any> => {
  const response = await client.get(`/records/${recordId}`);
  return response.data;
};

// 보강 필요 학생 목록 조회
export const getMakeupRequiredStudents = async (): Promise<MakeupRequiredStudent[]> => {
  const response = await client.get<MakeupRequiredStudent[]>('/records/makeup-required');
  return response.data;
};
