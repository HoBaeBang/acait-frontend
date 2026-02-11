import { client } from './client';

export interface StudentBalance {
  yearMonth: string;
  paidAmount: number;
  usedAmount: number;
  carryOverAmount: number;
  currentBalance: number;
}

export interface TuitionPaymentRequest {
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  yearMonth: string;   // YYYY-MM
  memo?: string;
}

// 월별 잔액 조회
export const getStudentBalance = async (studentId: number, yearMonth: string): Promise<StudentBalance> => {
  const response = await client.get<StudentBalance>(`/students/${studentId}/balance`, {
    params: { yearMonth },
  });
  return response.data;
};

// 수강료 납부
export const createTuitionPayment = async (studentId: number, data: TuitionPaymentRequest): Promise<void> => {
  await client.post(`/students/${studentId}/payments`, data);
};
