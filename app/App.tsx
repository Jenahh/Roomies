import { useEffect, useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import RegistrationScreen from './RegistrationScreen';
import LoginScreen from './LoginScreen';
import ResidentDashboard from './ResidentDashboard';
import { demoResident, type ResidentUser } from './data/demoAccount';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState<ResidentUser>(demoResident);

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

  if (path === '/home') return <ResidentDashboard user={user} />;

  if (path === '/login') {
    return <LoginScreen onBack={() => navigate('/')} onCreateAccount={() => navigate('/registration')} onResidentLogin={resident => { setUser(resident); navigate('/home'); }} />;
  }

  return path === '/registration'
    ? <RegistrationScreen onBack={() => navigate('/')} />
    : <WelcomeScreen onGetStarted={() => navigate('/registration')} onLogIn={() => navigate('/login')} />;
}
