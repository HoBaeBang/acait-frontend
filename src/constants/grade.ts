// 학년 코드 정의 (백엔드 명세 v5.1 일치)
export const GRADE_OPTIONS = [
  { value: 'N', label: '기타 (미취학/성인)' },
  { value: 'E1', label: '초등 1학년' },
  { value: 'E2', label: '초등 2학년' },
  { value: 'E3', label: '초등 3학년' },
  { value: 'E4', label: '초등 4학년' },
  { value: 'E5', label: '초등 5학년' },
  { value: 'E6', label: '초등 6학년' },
  { value: 'M1', label: '중등 1학년' },
  { value: 'M2', label: '중등 2학년' },
  { value: 'M3', label: '중등 3학년' },
  { value: 'H1', label: '고등 1학년' },
  { value: 'H2', label: '고등 2학년' },
  { value: 'H3', label: '고등 3학년' },
];

// 학생 상태 정의
export const STUDENT_STATUS = {
  ATTENDING: '재원',
  DISCHARGED: '퇴원',
} as const;
