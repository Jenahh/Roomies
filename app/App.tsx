import { useEffect, useState } from 'react';
import WelcomeScreen from './pages/WelcomeScreen';
import RegistrationScreen from './pages/RegistrationScreen';
import LoginScreen from './pages/LoginScreen';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import ResidentAssistantDashboard from './pages/resident-assistant/ResidentAssistantDashboard';
import PropertyManagerDashboard from './pages/property-manager/PropertyManagerDashboard';
import ResidentSignUp from './pages/resident/ResidentSignUp';
import ResidentVerificationScreen from './pages/resident/ResidentVerificationScreen';
import { demoResident, demoResidentAssistant, demoPropertyManager, type ResidentUser } from './data/demoAccount';
import PropertyManagerJoinScreen from './pages/property-manager/PropertyManagerJoinScreen';
import PropertyManagerVerificationScreen from './pages/property-manager/PropertyManagerVerificationScreen';
import ResidentAssistantJoinScreen from './pages/resident-assistant/ResidentAssistantJoinScreen';
import ResidentAssistantVerificationScreen from './pages/resident-assistant/ResidentAssistantVerificationScreen';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState<ResidentUser | null>(demoResident);

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

  function signOut() {
    setUser(null);
    window.history.replaceState(null, '', '/');
    setPath('/');
    window.scrollTo(0, 0);
  }

  if (path === '/property-manager' && user?.role === 'property-manager') {
    return <PropertyManagerDashboard key={user.email} user={user} onSignOut={signOut} />;
  }

  if (path === '/home' && user) {
    if (user.role === 'property-manager') return <PropertyManagerDashboard key={user.email} user={user} onSignOut={signOut} />;
    return user.role === 'assistant'
      ? <ResidentAssistantDashboard key={user.email} user={user} onSignOut={signOut} />
      : <ResidentDashboard key={user.email} user={user} onSignOut={signOut} />;
  }

  if (path === '/login' || path === '/property-manager' || (path === '/home' && !user)) {
    return <LoginScreen onBack={() => navigate('/')} onCreateAccount={() => navigate('/registration')} onResidentLogin={account => { setUser(account); navigate(account.role === 'property-manager' ? '/property-manager' : '/home'); }} />;
  }

  if (path === '/resident-verification') return <ResidentVerificationScreen onBack={() => navigate('/registration')} onContinueAdmin={() => { setUser(demoResident); navigate('/home'); }} />;

  if (path === '/resident-assistant-join') return <ResidentAssistantJoinScreen onBack={() => navigate('/registration')} onLogIn={() => navigate('/login')} onRequestSubmitted={() => navigate('/resident-assistant-verification')} />;

  if (path === '/resident-assistant-verification') return <ResidentAssistantVerificationScreen onBack={() => navigate('/resident-assistant-join')} onContinueAdmin={() => { setUser(demoResidentAssistant); navigate('/home'); }} />;

  if (path === '/property-manager-join') return <PropertyManagerJoinScreen onBack={() => navigate('/registration')} onLogIn={() => navigate('/login')} onRequestSubmitted={() => navigate('/property-manager-verification')} />;

  if (path === '/property-manager-verification') return <PropertyManagerVerificationScreen onBack={() => navigate('/property-manager-join')} onContinueAdmin={() => { setUser(demoPropertyManager); navigate('/property-manager'); }} />;

  if (path === '/resident-sign-up') return <ResidentSignUp onBack={() => navigate('/registration')} onLogIn={() => navigate('/login')} onRequestSubmitted={() => navigate('/resident-verification')} />;

  return path === '/registration'
    ? <RegistrationScreen onBack={() => navigate('/')} onContinue={role => { if (role === 'resident') navigate('/resident-sign-up'); else if (role === 'assistant') navigate('/resident-assistant-join'); else if (role === 'landlord') navigate('/property-manager-join'); }} />
    : <WelcomeScreen onGetStarted={() => navigate('/registration')} onLogIn={() => navigate('/login')} />;
}
