import { Link } from 'react-router-dom';

const LectureListPage = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">강의 목록</h1>
        <Link 
          to="/lectures/new" 
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          강의 등록
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500 text-center py-8">
          등록된 강의가 없습니다. (API 연동 예정)
        </p>
      </div>
    </div>
  );
};

export default LectureListPage;
