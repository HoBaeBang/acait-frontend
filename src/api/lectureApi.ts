import { client } from './client';

// FullCalendar에서 사용할 이벤트 객체 타입 정의
export interface LectureEvent {
  id: string;
  title: string;
  start: string; // ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: {
    description?: string;
    instructor?: string;
  };
}

// 강의 이벤트 목록 조회 API 호출 함수
export const getLectureEvents = async (): Promise<LectureEvent[]> => {
  const response = await client.get<LectureEvent[]>('/lecture/events');
  return response.data;
};
