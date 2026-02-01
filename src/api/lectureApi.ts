import { client } from './client';
import { Student } from './studentApi';

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
  studentIds?: number[];
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
    originalId?: string;
    lectureName?: string;
    studentNames?: string[];
  };
}

export interface UpdateScheduleRequest {
  startTime: string;
  endTime: string;
  targetDate: string;
  scope: 'INSTANCE' | 'SERIES';
  newDate?: string;
}

// 강의 목록 조회 (역할에 따라 분기)
export const getLectures = async (role?: string | null): Promise<Lecture[]> => {
  const url = role === 'ROLE_OWNER' ? '/lecture/all' : '/lecture';
  const response = await client.get<any[]>(url);
  
  return response.data.map((item) => ({
    lectureId: item.id,
    name: item.name,
    instructorName: item.instructorName || '담당 강사',
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

// 캘린더용 이벤트 조회 (수정됨: viewAll 파라미터 추가)
export const getLectureEvents = async (
  start: string, 
  end: string, 
  instructorId?: number | null,
  viewAll?: boolean // 추가됨
): Promise<LectureEvent[]> => {
  const params: any = { start, end };
  
  if (viewAll) {
    params.viewAll = true;
  } else if (instructorId) {
    params.instructorId = instructorId;
  }
  // 둘 다 없으면 기본적으로 본인 일정 조회 (파라미터 없음)
  
  console.log('Fetching Events with params:', params);

  const response = await client.get<LectureEvent[]>('/lecture/events', { params });
  return response.data;
};

// 일정 수정
export const updateSchedule = async (id: string, data: UpdateScheduleRequest): Promise<void> => {
  await client.put(`/schedules/${id}`, data);
};

// 강의별 수강생 목록 조회
export const getLectureStudents = async (lectureId: number): Promise<Student[]> => {
  const response = await client.get<any[]>(`/lecture/${lectureId}/students`);
  return response.data.map((item) => ({
    id: item.id,
    studentNumber: item.studentNumber,
    name: item.name,
    school: item.school,
    grade: item.grade,
    parentPhone: item.parentPhone,
    status: item.status,
    createdAt: item.createdAt,
  }));
};
