import { useNavigate } from 'react-router-dom';

const LectureCreatePage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">새 강의 등록</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">강의명</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="강의명을 입력하세요"
            />
          </div>
          
          {/* 추후 더 많은 필드 추가 예정 */}

          <div className="flex justify-end gap-2 mt-6">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              취소
            </button>
            <button 
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LectureCreatePage;
