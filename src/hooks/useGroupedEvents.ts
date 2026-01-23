import { useMemo } from 'react';
import { LectureEvent } from '../api/lectureApi';

export interface GroupedEvent extends LectureEvent {
  isGroup: boolean;
  subEvents: LectureEvent[];
}

export const useGroupedEvents = (events: LectureEvent[] | undefined) => {
  return useMemo(() => {
    if (!events) return [];

    // 시작 시간 순으로 정렬
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    const grouped: GroupedEvent[] = [];
    // 중복 처리 방지를 위한 Set (ID + 시작시간 조합)
    const processedKeys = new Set<string>();

    for (let i = 0; i < sortedEvents.length; i++) {
      const current = sortedEvents[i];
      // 고유 키 생성: ID + 시작시간
      const currentKey = `${current.id}-${current.start}`;
      
      if (processedKeys.has(currentKey)) continue;

      const currentStart = new Date(current.start).getTime();
      const currentEnd = new Date(current.end).getTime();

      // 현재 이벤트와 겹치는 모든 이벤트 찾기 (시간 교차 검사)
      const overlapping = sortedEvents.filter((other, idx) => {
        const otherKey = `${other.id}-${other.start}`;
        if (i === idx || processedKeys.has(otherKey)) return false;
        
        const otherStart = new Date(other.start).getTime();
        const otherEnd = new Date(other.end).getTime();

        // 교차 조건: (StartA < EndB) && (EndA > StartB)
        return currentStart < otherEnd && currentEnd > otherStart;
      });

      if (overlapping.length > 0) {
        // 그룹 생성
        const subEvents = [current, ...overlapping];
        subEvents.forEach(e => processedKeys.add(`${e.id}-${e.start}`));

        // 그룹의 전체 시간 범위 계산
        const minStart = new Date(Math.min(...subEvents.map(e => new Date(e.start).getTime())));
        const maxEnd = new Date(Math.max(...subEvents.map(e => new Date(e.end).getTime())));

        grouped.push({
          id: `group-${current.id}-${current.start}`, // 그룹 ID도 유니크하게
          title: `${subEvents.length}개의 수업`,
          start: minStart.toISOString(),
          end: maxEnd.toISOString(),
          backgroundColor: '#4F46E5',
          borderColor: '#4338CA',
          isGroup: true,
          subEvents: subEvents,
          extendedProps: {
            isRecurring: true,
          }
        });
      } else {
        // 단일 이벤트
        grouped.push({
          ...current,
          // FullCalendar에서 반복 일정의 ID가 같으면 하나만 렌더링하는 경우가 있음
          // 따라서 렌더링용 ID를 유니크하게 만들어줌
          id: `${current.id}-${current.start}`, 
          isGroup: false,
          subEvents: [],
          extendedProps: {
            ...current.extendedProps,
            originalId: current.id // 원본 ID 보존 (수정/삭제 시 필요)
          }
        });
        processedKeys.add(currentKey);
      }
    }

    return grouped;
  }, [events]);
};
