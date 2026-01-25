import { useMemo } from 'react';
import { LectureEvent } from '../api/lectureApi';

export interface GroupedEvent extends LectureEvent {
  isGroup: boolean;
  subEvents: LectureEvent[];
}

export const useGroupedEvents = (events: LectureEvent[] | undefined) => {
  return useMemo(() => {
    if (!events || events.length === 0) return [];

    // 1. 시작 시간 순으로 정렬 (같으면 종료 시간 순)
    const sortedEvents = [...events].sort((a, b) => {
      const startDiff = new Date(a.start).getTime() - new Date(b.start).getTime();
      if (startDiff !== 0) return startDiff;
      return new Date(a.end).getTime() - new Date(b.end).getTime();
    });

    const grouped: GroupedEvent[] = [];
    
    // 2. 그룹화 로직 (Chain Overlap 처리)
    let currentGroup: LectureEvent[] = [];
    let groupMaxEnd = 0;

    for (const event of sortedEvents) {
      const eventStart = new Date(event.start).getTime();
      const eventEnd = new Date(event.end).getTime();

      if (currentGroup.length === 0) {
        // 첫 이벤트 시작
        currentGroup.push(event);
        groupMaxEnd = eventEnd;
      } else {
        // 현재 그룹과 겹치는지 확인
        // 디버깅 로그 추가
        // console.log(`Checking overlap: ${event.title} (${event.start}) vs GroupMaxEnd (${new Date(groupMaxEnd).toISOString()})`);
        
        if (eventStart < groupMaxEnd) {
          // 겹침 -> 그룹에 추가
          // console.log('  -> Overlap detected!');
          currentGroup.push(event);
          // 그룹의 종료 시간 확장
          if (eventEnd > groupMaxEnd) {
            groupMaxEnd = eventEnd;
          }
        } else {
          // 안 겹침 -> 이전 그룹 확정 및 초기화
          // console.log('  -> No overlap. New group.');
          pushGroup(grouped, currentGroup);
          currentGroup = [event];
          groupMaxEnd = eventEnd;
        }
      }
    }

    // 마지막 그룹 처리
    if (currentGroup.length > 0) {
      pushGroup(grouped, currentGroup);
    }

    return grouped;
  }, [events]);
};

// 그룹을 생성하여 결과 배열에 추가하는 헬퍼 함수
const pushGroup = (result: GroupedEvent[], groupEvents: LectureEvent[]) => {
  if (groupEvents.length === 0) return;

  if (groupEvents.length === 1) {
    // 단일 이벤트
    const event = groupEvents[0];
    result.push({
      ...event,
      // 렌더링용 유니크 ID (반복 일정 구분)
      id: `${event.id}-${event.start}`,
      isGroup: false,
      subEvents: [],
      extendedProps: {
        ...event.extendedProps,
        originalId: event.id
      }
    });
  } else {
    // 그룹 이벤트
    const minStart = new Date(Math.min(...groupEvents.map(e => new Date(e.start).getTime())));
    const maxEnd = new Date(Math.max(...groupEvents.map(e => new Date(e.end).getTime())));
    
    // 그룹 대표 ID 생성 (첫 번째 이벤트 ID + 시작시간)
    const firstEvent = groupEvents[0];
    const groupId = `group-${firstEvent.id}-${minStart.toISOString()}`;

    result.push({
      id: groupId,
      title: `${groupEvents.length}개의 수업`,
      start: minStart.toISOString(),
      end: maxEnd.toISOString(),
      backgroundColor: '#4F46E5', // 그룹 색상 (Indigo)
      borderColor: '#4338CA',
      textColor: '#FFFFFF',
      isGroup: true,
      subEvents: groupEvents, // 원본 이벤트들 포함
      extendedProps: {
        isRecurring: true,
      }
    });
  }
};
