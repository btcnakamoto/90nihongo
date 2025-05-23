
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">90天日语学习平台</h1>
        <p className="text-xl text-gray-600 mb-8">提升实用日语交流能力的高效学习系统</p>
        <div className="space-y-4">
          <Link 
            to="/admin" 
            className="inline-block bg-nihongo-indigo hover:bg-nihongo-darkBlue text-white px-6 py-3 rounded-md transition-colors"
          >
            前往管理仪表盘
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
