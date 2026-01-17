import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-slate-400 mb-8">Page Not Found</p>
        <p className="text-slate-500 mb-8">The page you're looking for doesn't exist in the Smart City Dashboard.</p>
        
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
        >
          <Home className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;