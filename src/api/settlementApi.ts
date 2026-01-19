import { client } from './client';

export interface SettlementSummary {
  id: number; // 정산 ID (상세 조회용)
  instructorName: string;
  yearMonth: string;
  totalAmount: number;
  taxAmount: number;
  realAmount: number;
  status: 'OPEN' | 'CLOSED';
}

export interface SettlementDetail {
  date: string;
  lectureName: string;
  studentName: string;
  amount: number;
  status: 'ATTENDED' | 'MAKEUP'; // 출석 상태
}

// 정산 대시보드 조회 (목록 반환으로 변경됨)
export const getSettlementDashboard = async (yearMonth: string): Promise<SettlementSummary[]> => {
  const response = await client.get<SettlementSummary[]>('/settlements/dashboard', {
    params: { yearMonth },
  });
  return response.data;
};

// 정산 상세 내역 조회
export const getSettlementDetails = async (settlementId: number): Promise<SettlementDetail[]> => {
  const response = await client.get<SettlementDetail[]>(`/settlements/${settlementId}/details`);
  return response.data;
};

// 엑셀 다운로드
export const downloadSettlementExcel = async (yearMonth: string): Promise<void> => {
  const response = await client.get('/settlements/excel', {
    params: { yearMonth },
    responseType: 'blob', // 파일 다운로드를 위해 blob 설정 필수
  });

  // 브라우저에서 파일 다운로드 트리거
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `settlement_${yearMonth}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
