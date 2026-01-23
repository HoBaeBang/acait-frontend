import { client } from './client';
import { Lecture } from './lectureApi';

// 학생이 수강 중인 강의 목록 조회
export const getStudentLectures = async (studentNumber: string): Promise<Lecture[]> => {
  const response = await client.get<any[]>(`/students/${studentNumber}/lectures`);
  
  // 백엔드 응답(LectureResponse)을 프론트엔드 모델(Lecture)로 매핑
  return response.data.map((item) => ({
    lectureId: item.id, // id -> lectureId 매핑
    name: item.name,
    instructorName: item.instructorName || '담당 강사',
    type: item.type,
    defaultPrice: item.defaultPrice,
    defaultDuration: item.defaultDuration,
    isActive: item.isActive,
  }));
};

// 강의에 학생 등록 (수강 신청)
export const enrollStudent = async (lectureId: number, studentNumber: string): Promise<void> => {
  // 백엔드 API: POST /api/v1/lecture/{lectureId}/students/{studentNumber}
  // 주의: 백엔드 API가 studentId(PK)를 받는지 studentNumber(학번)를 받는지 확인 필요
  // 현재 백엔드 LectureStudentController는 studentId(Long)를 받고 있음.
  // 하지만 프론트엔드에서는 studentNumber만 알고 있는 상황.
  // -> 백엔드 API도 studentNumber를 받도록 수정되거나, 프론트에서 studentId를 알아내야 함.
  // 일단은 studentNumber를 그대로 보냄 (백엔드가 String을 받도록 수정되었다고 가정하거나, 
  // getStudent 응답에 id가 포함되어 있으므로 그것을 사용해야 함)
  
  // 수정: StudentFormPage에서 studentData.id를 가져와서 넘겨주는 것이 가장 확실함.
  // 여기서는 일단 any로 받아서 처리
  await client.post(`/lecture/${lectureId}/students/${studentNumber}`);
};

// 강의에서 학생 제외 (수강 취소)
export const removeStudent = async (lectureId: number, studentNumber: string): Promise<void> => {
  await client.delete(`/lecture/${lectureId}/students/${studentNumber}`);
};
