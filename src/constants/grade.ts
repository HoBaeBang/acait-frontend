export const GRADE_OPTIONS = [
  { value: 'E1', label: '초1' },
  { value: 'E2', label: '초2' },
  { value: 'E3', label: '초3' },
  { value: 'E4', label: '초4' },
  { value: 'E5', label: '초5' },
  { value: 'E6', label: '초6' },
  { value: 'M1', label: '중1' },
  { value: 'M2', label: '중2' },
  { value: 'M3', label: '중3' },
  { value: 'H1', label: '고1' },
  { value: 'H2', label: '고2' },
  { value: 'H3', label: '고3' },
  { value: 'N', label: '기타' },
];

// 학년 코드 -> 라벨 매핑 객체 (추가됨)
export const GRADE_LABEL: Record<string, string> = GRADE_OPTIONS.reduce((acc, curr) => {
  acc[curr.value] = curr.label;
  return acc;
}, {} as Record<string, string>);
