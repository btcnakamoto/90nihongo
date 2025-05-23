
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  // Redirect to Dashboard
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  // This is just a fallback in case the redirect doesn't work immediately
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold mb-4 text-japan-navy">90日本語</h1>
        <p className="text-xl text-gray-600">Loading your Japanese learning journey...</p>
      </div>
    </div>
  );
};

export default Index;
