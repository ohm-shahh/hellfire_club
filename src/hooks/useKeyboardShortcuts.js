import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only trigger if Alt key is pressed
      if (!e.altKey) return;

      switch (e.key) {
        case '1':
          navigate('/');
          break;
        case '2':
          navigate('/health');
          break;
        case '3':
          navigate('/traffic');
          break;
        case '4':
          navigate('/simulation');
          break;
        case '5':
          navigate('/agriculture');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
};