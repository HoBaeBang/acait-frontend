import { useMemo } from 'react';
import { LectureEvent } from '../api/lectureApi';

export interface GroupedEvent extends LectureEvent {
  isGroup: boolean;
  subEvents: LectureEvent[];
}

export const useGroupedEvents = (events: LectureEvent[] | undefined) => {
  return useMemo(() => {
    if (!events) return [];

    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    const grouped: GroupedEvent[] = [];
    const processedIds = new Set<string>();

    for (let i = 0; i < sortedEvents.length; i++) {
      const current = sortedEvents[i];
      if (processedIds.has(current.id)) continue;

      // 현재 이벤트와 겹치는 이벤트 찾기
      const overlapping = sortedEvents.filter((other, idx) => {
        if (i === idx || processedIds.has(other.id)) return false;
        
        const currentStart = new Date(current.start).getTime();
        const currentEnd = new Date(current.end).getTime();
        const otherStart = new Date(other.start).getTime();
        const otherEnd = new Date(other.end).getTime();

        // 시간이 정확히 일치하거나 포함되는 경우만 그룹화 (단순 겹침은 제외)
        // 여기서는 "시작 시간이 같고 종료 시간도 같은" 경우만 묶는 것으로 단순화
        // (완전히 겹치는 경우만 묶어야 시각적으로 깔끔함)
        return currentStart === otherStart && currentEnd === otherEnd;
      });

      if (overlapping.length > 0) {
        // 그룹 생성
        const subEvents = [current, ...overlapping];
        subEvents.forEach(e => processedIds.add(e.id));

        grouped.push({
          id: `group-${current.id}`, // 가상 ID
          title: `${subEvents.length}개의 수업`,
          start: current.start,
          end: current.end,
          backgroundColor: '#4F46E5', // 그룹 색상 (진한 파랑)
          borderColor: '#4338CA',
          isGroup: true,
          subEvents: subEvents,
          extendedProps: {
            isRecurring: true, // 그룹도 반복 일정으로 취급
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
