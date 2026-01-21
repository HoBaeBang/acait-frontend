import { client } from './client';

export interface SettlementSummary {
  id: number;
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
  status: 'ATTENDED' | 'MAKEUP';
}

// 예상 정산 금액 DTO (추가됨)
export interface SettlementForecast {
  confirmedAmount: number; // 확정 금액 (세후)
  expectedAmount: number;  // 예상 추가 금액 (세후)
  totalForecastAmount: number; // 월 예상 총액 (세후)
}

// 정산 대시보드 조회 (확정 금액)
export const getSettlementDashboard = async (yearMonth: string, role?: string | null): Promise<SettlementSummary[]> => {
  const url = role === 'ROLE_OWNER' ? '/settlements/dashboard' : '/settlements/my';
  const response = await client.get<SettlementSummary[]>(url, {
    params: { yearMonth },
  });
  return response.data;
};

// 예상 정산 금액 조회 (추가됨)
export const getSettlementForecast = async (yearMonth: string): Promise<SettlementForecast> => {
  const response = await client.get<SettlementForecast>('/settlements/forecast', {
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
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `settlement_${yearMonth}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
