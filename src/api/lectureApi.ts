import { client } from './client';

// 강의 정보 인터페이스
export interface Lecture {
  lectureId: number; // 프론트엔드에서 사용하는 ID (백엔드 id와 매핑 필요)
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
    lectureId?: number;
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
  const url = role === 'ROLE_OWNER' ? '/lecture/all' : '/lecture';
  const response = await client.get<any[]>(url); // any[]로 받아서 매핑
  
  return response.data.map((item) => ({
    lectureId: item.id, // 백엔드 id -> 프론트엔드 lectureId 매핑
    name: item.name,
    instructorName: item.instructorName || '담당 강사', // instructorName이 없을 경우 대비
    type: item.type,
    defaultPrice: item.defaultPrice,
    defaultDuration: item.defaultDuration,
    isActive: item.isActive,
  }));
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
