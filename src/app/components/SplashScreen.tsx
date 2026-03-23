import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { GraduationCap, Loader2 } from 'lucide-react';

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div 
      className="h-full flex flex-col items-center justify-center p-8"
      style={{
        background: 'linear-gradient(135deg, #FFB347 0%, #9370DB 100%)',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-full p-8 shadow-2xl mb-6">
          <GraduationCap className="w-24 h-24 text-purple-600" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-white text-2xl font-semibold text-center mb-2">
          Student Placement
          <br />
          Preparation Portal
        </h1>
        
        <p className="text-white/90 text-center text-sm mt-4">
          Prepare Smart. Get Placed Faster.
        </p>
      </div>

      <div className="mb-12">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    </div>
  );
}
