import { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Check authentication session
  const isAuthenticated = () => {
    return localStorage.getItem('nexus_user') !== null;
  };

  // Safe routing layouts
  if (currentPath === '/dashboard') {
    if (!isAuthenticated()) {
      // Redirect unauthenticated traffic to decryption console
      window.history.pushState({}, '', '/login');
      return <LoginPage onNavigate={navigate} />;
    }
    return <Dashboard onNavigate={navigate} />;
  }

  if (currentPath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  if (currentPath === '/signup') {
    return <SignupPage onNavigate={navigate} />;
  }

  // Render premium SaaS landing page at root path /
  return <LandingPage onNavigate={navigate} />;
}
