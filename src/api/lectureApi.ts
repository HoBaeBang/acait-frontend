import { client } from './client';

// 강의 정보 인터페이스
export interface Lecture {
  lectureId: number;
  name: string;
  instructorName: string;
  type: 'BOARD' | 'INDIV';
  defaultPrice: number;
  defaultDuration: number;
  isActive: boolean;
}

// 시간표 요청 데이터
export interface ScheduleRequest {
  dayOfWeek: string; // "MONDAY", "TUESDAY", ...
  startTime: string; // "HH:mm:ss"
  endTime: string;   // "HH:mm:ss"
}

// 강의 생성 요청 데이터 (시간표 포함)
export interface CreateLectureRequest {
  name: string;
  type: 'BOARD' | 'INDIV';
  defaultPrice: number;
  defaultDuration: number;
  instructorId?: number;
  schedules: ScheduleRequest[]; // 추가됨
}

// FullCalendar 이벤트
export interface LectureEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: {
    description?: string;
    instructor?: string;
    isRecurring?: boolean;
  };
}

export interface UpdateScheduleRequest {
  startTime: string;
  endTime: string;
  targetDate: string;
  scope: 'INSTANCE' | 'SERIES';
}

// 강의 목록 조회
export const getLectures = async (): Promise<Lecture[]> => {
  const response = await client.get<Lecture[]>('/lecture');
  return response.data;
};

// 강의 생성 (시간표 포함)
export const createLecture = async (data: CreateLectureRequest): Promise<void> => {
  await client.post('/lecture', data);
};

// 캘린더용 이벤트 조회
export const getLectureEvents = async (): Promise<LectureEvent[]> => {
  const response = await client.get<LectureEvent[]>('/lecture/events');
  return response.data;
};

// 일정 수정
export const updateSchedule = async (id: string, data: UpdateScheduleRequest): Promise<void> => {
  await client.put(`/schedules/${id}`, data);
};
