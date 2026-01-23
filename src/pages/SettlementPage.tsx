import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSettlementDashboard, getSettlementDetails, downloadSettlementExcel, getSettlementForecast } from '../api/settlementApi';
import { useAuthStore } from '../stores/authStore';
import clsx from 'clsx';

const SettlementPage = () => {
  const { user } = useAuthStore();
  const today = new Date();
  const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const [yearMonth, setYearMonth] = useState(currentYearMonth);
  const [selectedSettlementId, setSelectedSettlementId] = useState<number | null>(null);

  const { data: summaries, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['settlement', yearMonth, user?.role],
    queryFn: () => getSettlementDashboard(yearMonth, user?.role),
  });

  const { data: forecast } = useQuery({
    queryKey: ['settlementForecast', yearMonth],
    queryFn: () => getSettlementForecast(yearMonth),
    enabled: user?.role === 'ROLE_INSTRUCTOR' && yearMonth === currentYearMonth,
  });

  const { data: details, isLoading: isDetailLoading } = useQuery({
    queryKey: ['settlementDetail', selectedSettlementId],
    queryFn: () => getSettlementDetails(selectedSettlementId!),
    enabled: !!selectedSettlementId,
  });

  const totalSummary = summaries?.reduce((acc, curr) => ({
    totalAmount: acc.totalAmount + curr.totalAmount,
    taxAmount: acc.taxAmount + curr.taxAmount,
    realAmount: acc.realAmount + curr.realAmount,
  }), { totalAmount: 0, taxAmount: 0, realAmount: 0 });

  const handleDownloadExcel = async () => {
    try {
      await downloadSettlementExcel(yearMonth);
    } catch (error) {
      alert('엑셀 다운로드에 실패했습니다.');
    }
  };

  if (isSummaryLoading) return <div className="p-8 text-center">로딩 중...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">정산 관리</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="month-picker" className="text-sm font-medium text-gray-700">조회 월:</label>
            <input
              type="month"
              id="month-picker"
              value={yearMonth}
              onChange={(e) => {
                setYearMonth(e.target.value);
                setSelectedSettlementId(null);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 flex items-center gap-2"
          >
            <span>📊</span> 엑셀 다운로드
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {user?.role === 'ROLE_INSTRUCTOR' && forecast ? (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">현재 확정 매출 (세전)</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {forecast.confirmedAmount.toLocaleString()}원
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg border-2 border-dashed border-blue-200 relative">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-blue-500 truncate">남은 수업 예상 (세전)</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">
                  + {forecast.expectedAmount.toLocaleString()}원
                </dd>
                <p className="mt-2 text-xs text-gray-400">
                  예정된 수업을 모두 진행할 경우
                </p>
                {forecast.expectedAmount === 0 && forecast.confirmedAmount === 0 && (
                  <div className="absolute inset-0 bg-white/90 flex items-center justify-center text-center p-4">
                    <p className="text-sm text-gray-500">
                      수강생을 배정하면<br/>예상 수익을 확인할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-blue-50 overflow-hidden shadow rounded-lg border border-blue-100">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-blue-600 truncate">이번 달 예상 실지급액 (세후)</dt>
                <dd className="mt-1 text-3xl font-bold text-blue-700">
                  {forecast.realAmount.toLocaleString()}원
                </dd>
                <div className="mt-2 text-xs text-blue-400 flex justify-between">
                  <span>총 매출: {forecast.totalAmount.toLocaleString()}원</span>
                  <span>공제: -{forecast.taxAmount.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">총 매출 (세전)</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {totalSummary?.totalAmount?.toLocaleString() ?? '0'}원
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">공제액 (3.3%)</dt>
                <dd className="mt-1 text-3xl font-semibold text-red-600">
                  - {totalSummary?.taxAmount?.toLocaleString() ?? '0'}원
                </dd>
              </div>
            </div>
            <div className="bg-blue-50 overflow-hidden shadow rounded-lg border border-blue-100">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-blue-600 truncate">실지급액 합계</dt>
                <dd className="mt-1 text-3xl font-bold text-blue-700">
                  {totalSummary?.realAmount?.toLocaleString() ?? '0'}원
                </dd>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">
              {user?.role === 'ROLE_OWNER' ? '강사별 정산 내역' : '내 정산 내역'}
            </h3>
          </div>
          <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {summaries?.map((summary) => (
              <li 
                key={summary.id}
                onClick={() => setSelectedSettlementId(summary.id)}
                className={clsx(
                  "px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors",
                  selectedSettlementId === summary.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">{summary.instructorName}</span>
                  <span className={clsx(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    summary.status === 'CLOSED' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  )}>
                    {summary.status === 'CLOSED' ? '지급완료' : '미지급'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">실지급액</span>
                  <span className="font-bold text-blue-600">{summary.realAmount.toLocaleString()}원</span>
                </div>
              </li>
            ))}
            {summaries?.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500 text-sm">
                정산 데이터가 없습니다.
              </li>
            )}
          </ul>
        </div>

        <div className="lg:col-span-2 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedSettlementId ? '상세 수업 내역' : '목록에서 선택해주세요'}
            </h3>
          </div>
          
          {selectedSettlementId ? (
            isDetailLoading ? (
              <div className="p-8 text-center text-gray-500">로딩 중...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강의명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학생명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {details?.map((detail, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{detail.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.lectureName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{detail.studentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={clsx(
                            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                            detail.status === 'MAKEUP' ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                          )}>
                            {detail.status === 'MAKEUP' ? '보강' : '출석'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          {detail.amount.toLocaleString()}원
                        </td>
                      </tr>
                    ))}
                    {details?.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                          상세 내역이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="p-12 text-center text-gray-400">
              왼쪽 목록에서 항목을 선택하면<br/>상세 수업 내역을 확인할 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettlementPage;
