import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
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

function AppContent() {
  const [path, setPath] = useState(() => Platform.OS === 'web' ? window.location.pathname : '/');
  const [user, setUser] = useState<ResidentUser | null>(demoResident);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function navigate(nextPath: string) {
    if (Platform.OS === 'web') {
      window.history.pushState(null, '', nextPath);
      window.scrollTo(0, 0);
    }
    setPath(nextPath);
  }

  function signOut() {
    setUser(null);
    if (Platform.OS === 'web') {
      window.history.replaceState(null, '', '/');
      window.scrollTo(0, 0);
    }
    setPath('/');
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

const previewStyles = StyleSheet.create({
  stage: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EAF0' },
  fill: { flex: 1, width: '100%', height: '100%' },
  phone: { borderWidth: 8, borderColor: '#252631', borderRadius: 36, overflow: 'hidden', backgroundColor: '#FAF9F6' },
});

export default function App() {
  const { width, height } = useWindowDimensions();
  const isLocalWebPreview = Platform.OS === 'web'
    && typeof window !== 'undefined'
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    && width > 430;
  const phoneWidth = Math.max(0, Math.min(390, width - 48, (height - 48) * 390 / 844));
  const phoneHeight = phoneWidth * 844 / 390;

  return (
    <View style={isLocalWebPreview ? previewStyles.stage : previewStyles.fill}>
      <View style={isLocalWebPreview ? [previewStyles.phone, { width: phoneWidth, height: phoneHeight }] : previewStyles.fill}>
        <AppContent />
      </View>
    </View>
  );
}
