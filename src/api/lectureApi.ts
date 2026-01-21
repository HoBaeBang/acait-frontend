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
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

// 강의 생성 요청 데이터
export interface CreateLectureRequest {
  name: string;
  type: 'BOARD' | 'INDIV';
  defaultPrice: number;
  defaultDuration: number;
  instructorId?: number;
  schedules: ScheduleRequest[];
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
    lectureId?: number; // 추가됨
  };
}

export interface UpdateScheduleRequest {
  startTime: string;
  endTime: string;
  targetDate: string;
  scope: 'INSTANCE' | 'SERIES';
}

// 강의 목록 조회 (역할에 따라 분기)
export const getLectures = async (role?: string | null): Promise<Lecture[]> => {
  // 원장이면 전체 목록, 강사면 내 목록 조회
  const url = role === 'ROLE_OWNER' ? '/lecture/all' : '/lecture';
  const response = await client.get<Lecture[]>(url);
  return response.data;
};

// 강의 생성
export const createLecture = async (data: CreateLectureRequest): Promise<void> => {
  await client.post('/lecture', data);
};

// 캘린더용 이벤트 조회
export const getLectureEvents = async (start: string, end: string): Promise<LectureEvent[]> => {
  const response = await client.get<LectureEvent[]>('/lecture/events', {
    params: { start, end }
  });
  return response.data;
};

// 일정 수정
export const updateSchedule = async (id: string, data: UpdateScheduleRequest): Promise<void> => {
  await client.put(`/schedules/${id}`, data);
};
