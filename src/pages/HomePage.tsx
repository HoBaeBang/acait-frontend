import { useState, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { EventDropArg, EventClickArg, DateClickArg } from '@fullcalendar/interaction';
import { getLectureEvents, updateSchedule, UpdateScheduleRequest, LectureEvent } from '../api/lectureApi';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';
import logo from '../assets/acait_logo.png';
import ScheduleEditModal from '../components/ScheduleEditModal';
import LectureRecordModal from '../components/LectureRecordModal';
import MakeupScheduleModal from '../components/MakeupScheduleModal';
import GroupDetailModal from '../components/GroupDetailModal';
import ScheduleChangeModal from '../components/ScheduleChangeModal';
import { useGroupedEvents } from '../hooks/useGroupedEvents';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-4xl mx-auto">
            <img src={logo} alt="ACAIT Logo" className="h-32 mx-auto mb-8 drop-shadow-md" />
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              학원 관리를 <span className="text-blue-600">더 스마트하게</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              복잡한 강의 일정부터 강사 관리까지, ACAIT 하나로 해결하세요.<br />
              효율적인 학원 운영의 시작, 지금 바로 경험해보세요.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              로그인하여 시작하기
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return <CalendarView />;
};

const CalendarView = () => {
  const queryClient = useQueryClient();
  const calendarRef = useRef<FullCalendar>(null);
  
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  
  const [pendingUpdate, setPendingUpdate] = useState<{
    ids: string[];
    start: Date;
    end: Date;
    originalStart: Date;
    revert?: () => void;
  } | null>(null);

  const [changeModalData, setChangeModalData] = useState<{
    scheduleId: string;
    currentDate: string;
    currentStartTime: string;
    currentEndTime: string;
    originalStart: string;
  } | null>(null);

  const [recordModalData, setRecordModalData] = useState<{
    isOpen: boolean;
    lectureId: number;
    studentId: number;
    studentName: string;
    date: string;
    startTime: string;
    endTime: string;
    originalEventId?: string;
  }>({
    isOpen: false,
    lectureId: 0,
    studentId: 0,
    studentName: '',
    date: '',
    startTime: '',
    endTime: '',
  });

  const [makeupModalData, setMakeupModalData] = useState<{
    isOpen: boolean;
    date: string;
    startTime: string;
  }>({
    isOpen: false,
    date: '',
    startTime: '',
  });

  const [groupDetailData, setGroupDetailData] = useState<{
    isOpen: boolean;
    subEvents: LectureEvent[];
  }>({
    isOpen: false,
    subEvents: [],
  });

  const { data: rawEvents = [], isLoading } = useQuery({
    queryKey: ['lectureEvents', dateRange.start, dateRange.end],
    queryFn: () => getLectureEvents(dateRange.start, dateRange.end),
    enabled: !!dateRange.start && !!dateRange.end,
  });

  const groupedEvents = useGroupedEvents(rawEvents);

  const updateMutation = useMutation({
    mutationFn: async (data: { ids: string[]; req: UpdateScheduleRequest }) => {
      await Promise.all(data.ids.map(id => updateSchedule(id, data.req)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectureEvents'] });
      alert('일정이 수정되었습니다.');
      setIsEditModalOpen(false);
      setPendingUpdate(null);
    },
    onError: (error) => {
      console.error('Update Error:', error);
      alert('일정 수정에 실패했습니다.');
      pendingUpdate?.revert?.();
      setIsEditModalOpen(false);
      setPendingUpdate(null);
    },
  });

  const handleDatesSet = (arg: any) => {
    const startStr = arg.startStr.split('T')[0];
    const endStr = arg.endStr.split('T')[0];
    
    if (startStr !== dateRange.start || endStr !== dateRange.end) {
      setDateRange({ start: startStr, end: endStr });
    }
  };

  const handleEventDrop = (info: EventDropArg) => {
    const { event, oldEvent, revert } = info;
    const extendedProps = event.extendedProps as any;
    
    let targetIds: string[] = [];
    if (extendedProps.subEvents && extendedProps.subEvents.length > 0) {
      targetIds = extendedProps.subEvents.map((e: any) => e.extendedProps?.originalId || e.id);
    } else {
      const originalId = extendedProps.originalId || event.id;
      targetIds = [originalId];
    }

    console.log('Dropping Event:', {
      event,
      oldEvent,
      targetIds,
      newStart: event.start,
      originalStart: oldEvent.start
    });

    setPendingUpdate({
      ids: targetIds,
      start: event.start!,
      end: event.end!,
      originalStart: oldEvent.start!,
      revert,
    });
    setIsEditModalOpen(true);
  };

  const handleConfirmUpdate = (scope: 'INSTANCE' | 'SERIES') => {
    if (!pendingUpdate) return;
    
    // Timezone 문제 해결을 위한 날짜 포맷팅 함수
    const formatDate = (date: Date) => {
      // 로컬 시간 기준으로 YYYY-MM-DD 반환
      const offset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - offset);
      return localDate.toISOString().slice(0, 10);
    };
    
    const formatTime = (date: Date) => date.toTimeString().slice(0, 5);

    const requestData: UpdateScheduleRequest = {
      startTime: formatTime(pendingUpdate.start),
      endTime: formatTime(pendingUpdate.end),
      targetDate: scope === 'INSTANCE' ? formatDate(pendingUpdate.originalStart) : formatDate(pendingUpdate.start),
      scope,
      newDate: formatDate(pendingUpdate.start),
    };

    console.log('Updating Schedule:', { ids: pendingUpdate.ids, req: requestData });

    updateMutation.mutate({ ids: pendingUpdate.ids, req: requestData });
  };

  const handleCloseModal = () => {
    pendingUpdate?.revert?.();
    setIsEditModalOpen(false);
    setPendingUpdate(null);
  };

  const handleEventClick = (info: EventClickArg) => {
    const event = info.event;
    const extendedProps = event.extendedProps as any;

    if (extendedProps.isGroup && extendedProps.subEvents && extendedProps.subEvents.length > 0) {
      setGroupDetailData({
        isOpen: true,
        subEvents: extendedProps.subEvents,
      });
      return;
    }

    if (event.start! > new Date()) {
      alert('미래의 수업은 기록할 수 없습니다.');
      return;
    }
    
    openRecordModal(event);
  };

  const handleGroupItemEdit = (event: LectureEvent) => {
    setGroupDetailData(prev => ({ ...prev, isOpen: false }));
    
    setRecordModalData({
      isOpen: true,
      lectureId: parseInt(event.extendedProps?.lectureId?.toString() || '0'),
      studentId: 1, 
      studentName: '홍길동',
      date: event.start.toString().slice(0, 10),
      startTime: event.start.toString().slice(11, 16),
      endTime: event.end.toString().slice(11, 16),
      originalEventId: event.extendedProps?.originalId || event.id,
    });
  };

  const openRecordModal = (event: any) => {
    setRecordModalData({
      isOpen: true,
      lectureId: parseInt(event.extendedProps?.lectureId || 0),
      studentId: 1, 
      studentName: '홍길동',
      date: event.start!.toISOString().slice(0, 10),
      startTime: event.start!.toTimeString().slice(0, 5),
      endTime: event.end!.toTimeString().slice(0, 5),
      originalEventId: event.extendedProps?.originalId || event.id,
    });
  };

  const handleEditScheduleFromRecord = () => {
    setRecordModalData(prev => ({ ...prev, isOpen: false }));

    setChangeModalData({
      scheduleId: recordModalData.originalEventId || '',
      currentDate: recordModalData.date,
      currentStartTime: recordModalData.startTime,
      currentEndTime: recordModalData.endTime,
      originalStart: recordModalData.date,
    });
    
    setIsChangeModalOpen(true);
  };

  const handleDateClick = (info: DateClickArg) => {
    setMakeupModalData({
      isOpen: true,
      date: info.dateStr.slice(0, 10),
      startTime: info.date.toTimeString().slice(0, 5),
    });
  };

  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    const extendedProps = event.extendedProps as any;
    const formatTime = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toTimeString().slice(0, 5);
    };

    if (extendedProps.isGroup && extendedProps.subEvents && extendedProps.subEvents.length > 0) {
      const groupStart = formatTime(event.startStr);
      const groupEnd = formatTime(event.endStr);

      return (
        <div className="p-1 h-full overflow-hidden flex flex-col">
          <div className="font-bold text-xs mb-1 bg-white/20 rounded px-1 flex justify-between items-center">
            <span>{extendedProps.subEvents.length}개 통합</span>
            <span className="text-[10px] opacity-90">{groupStart}~{groupEnd}</span>
          </div>
          <ul className="text-xs space-y-1 overflow-y-auto flex-1">
            {extendedProps.subEvents.map((sub: any) => (
              <li key={sub.id} className="flex flex-col border-b border-white/10 pb-1 last:border-0">
                <span className="text-[10px] opacity-80">
                  [{formatTime(sub.start)}~{formatTime(sub.end)}]
                </span>
                <span className="truncate font-medium">{sub.title}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className="p-1">
        <div className="font-semibold text-xs truncate">{event.title}</div>
        <div className="text-xs opacity-80">{event.extendedProps?.instructor}</div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 m-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-blue-500">📅</span> 강의 일정
        </h1>
        <Link 
          to="/lectures/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
        >
          + 일정 등록
        </Link>
      </div>
      
      <ScheduleEditModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmUpdate}
      />

      <LectureRecordModal
        isOpen={recordModalData.isOpen}
        onClose={() => setRecordModalData(prev => ({ ...prev, isOpen: false }))}
        lectureId={recordModalData.lectureId}
        studentId={recordModalData.studentId}
        studentName={recordModalData.studentName}
        date={recordModalData.date}
        startTime={recordModalData.startTime}
        endTime={recordModalData.endTime}
        onEditSchedule={handleEditScheduleFromRecord}
      />

      {changeModalData && (
        <ScheduleChangeModal
          isOpen={isChangeModalOpen}
          onClose={() => setIsChangeModalOpen(false)}
          scheduleId={changeModalData.scheduleId}
          currentDate={changeModalData.currentDate}
          currentStartTime={changeModalData.currentStartTime}
          currentEndTime={changeModalData.currentEndTime}
          originalStart={changeModalData.originalStart}
        />
      )}

      <MakeupScheduleModal
        isOpen={makeupModalData.isOpen}
        onClose={() => setMakeupModalData(prev => ({ ...prev, isOpen: false }))}
        date={makeupModalData.date}
        startTime={makeupModalData.startTime}
      />

      <GroupDetailModal
        isOpen={groupDetailData.isOpen}
        onClose={() => setGroupDetailData(prev => ({ ...prev, isOpen: false }))}
        subEvents={groupDetailData.subEvents}
        onEdit={handleGroupItemEdit}
      />

      <div className="calendar-container relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale="ko"
          events={groupedEvents}
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
          editable={true}
          eventDrop={handleEventDrop}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          contentHeight="70vh"
          eventColor="#3B82F6"
          slotMinTime="09:00:00"
          slotMaxTime="22:00:00"
        />
      </div>
    </div>
  );
}

export default HomePage;
