import { useEffect, useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import RegistrationScreen from './RegistrationScreen';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function navigate(nextPath: string) {
    window.history.pushState(null, '', nextPath);
    setPath(nextPath);
    window.scrollTo(0, 0);
  }

  return path === '/registration'
    ? <RegistrationScreen onBack={() => navigate('/')} />
    : <WelcomeScreen onGetStarted={() => navigate('/registration')} />;
}
