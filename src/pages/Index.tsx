
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to main app
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Car Rental System...</h1>
      </div>
    </div>
  );
};

export default Index;
