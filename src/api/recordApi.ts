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

// 수업 기록 저장
export const createRecord = async (data: LectureRecordRequest): Promise<void> => {
  await client.post('/records', data);
};

// 특정 수업의 기록 조회 (단건)
// 백엔드 API가 아직 없다면 추후 구현. 현재는 저장만.
export const getRecord = async (recordId: number): Promise<any> => {
  const response = await client.get(`/records/${recordId}`);
  return response.data;
};
