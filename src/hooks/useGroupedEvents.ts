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
    const processedIds = new Set<string>();

    for (let i = 0; i < sortedEvents.length; i++) {
      const current = sortedEvents[i];
      if (processedIds.has(current.id)) continue;

      const currentStart = new Date(current.start).getTime();
      const currentEnd = new Date(current.end).getTime();

      // 현재 이벤트와 겹치는 모든 이벤트 찾기 (시간 교차 검사)
      const overlapping = sortedEvents.filter((other, idx) => {
        if (i === idx || processedIds.has(other.id)) return false;
        
        const otherStart = new Date(other.start).getTime();
        const otherEnd = new Date(other.end).getTime();

        // 교차 조건: (StartA < EndB) && (EndA > StartB)
        return currentStart < otherEnd && currentEnd > otherStart;
      });

      if (overlapping.length > 0) {
        // 그룹 생성
        const subEvents = [current, ...overlapping];
        subEvents.forEach(e => processedIds.add(e.id));

        // 그룹의 전체 시간 범위 계산 (최소 시작 ~ 최대 종료)
        const minStart = new Date(Math.min(...subEvents.map(e => new Date(e.start).getTime())));
        const maxEnd = new Date(Math.max(...subEvents.map(e => new Date(e.end).getTime())));

        grouped.push({
          id: `group-${current.id}`,
          title: `${subEvents.length}개의 수업`,
          start: minStart.toISOString(),
          end: maxEnd.toISOString(),
          backgroundColor: '#4F46E5', // 그룹 색상
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
          isGroup: false,
          subEvents: [],
        });
        processedIds.add(current.id);
      }
    }

    return grouped;
  }, [events]);
};
