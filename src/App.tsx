import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Register } from './components/Register';
import { Login } from './components/Login';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { ScheduleAppointment } from './components/ScheduleAppointment';
import { VideoCall } from './components/VideoCall';
import { MedicalHistory } from './components/MedicalHistory';
import { UploadDocuments, MedicalDocument } from './components/UploadDocuments';
import { useSupabase } from './hooks/useSupabase';

export type Screen = 'home' | 'login' | 'register' | 'onboarding' | 'dashboard' | 'schedule' | 'videocall' | 'history' | 'documents';
export type Theme = 'light' | 'dark';

export interface User {
  id?: string;
  name: string;
  email: string;
  hasCompletedOnboarding: boolean;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  reason?: string;
}

function App() {
  const { 
    user, 
    loading, 
    signUp, 
    signIn, 
    signOut,
    updateProfile, 
    createAppointment, 
    getAppointments, 
    updateAppointment,
    uploadDocument,
    getDocuments,
    deleteDocument
  } = useSupabase();

  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('medconnect-theme');
    return (saved as Theme) || 'light';
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Load appointments when user logs in
  useEffect(() => {
    if (user && user.hasCompletedOnboarding) {
      loadAppointments();
      // Redirect to dashboard if logged in
      if (currentScreen === 'home' || currentScreen === 'login' || currentScreen === 'register') {
        setCurrentScreen('dashboard');
      }
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if user needs onboarding
  useEffect(() => {
    if (user && !user.hasCompletedOnboarding && currentScreen !== 'onboarding') {
      setCurrentScreen('onboarding');
    }
  }, [user, currentScreen]);

  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const fetchedAppointments = await getAppointments();
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const fetchedDocuments = await getDocuments();
      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleUploadDocument = async (file: File, description: string) => {
    const newDocument = await uploadDocument(file, description);
    setDocuments([...documents, newDocument]);
  };

  const handleDeleteDocument = async (documentId: string) => {
    await deleteDocument(documentId);
    setDocuments(documents.filter(doc => doc.id !== documentId));
  };

  const handleNavigateToDocuments = () => {
    loadDocuments(); // Load documents when navigating
    setCurrentScreen('documents');
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      console.log('Register attempt for:', email);
      await signUp(name, email, password);
      console.log('Registration successful');
      // User will be redirected to onboarding automatically via useEffect
    } catch (error: any) {
      console.error('Registration error:', error);
      // Throw the specific error message from signUp
      throw error;
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      // User will be redirected automatically via useEffect
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'No pudimos iniciar sesión. Por favor revisa tu correo y contraseña.');
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await updateProfile({ hasCompletedOnboarding: true });
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleScheduleAppointment = async (appointment: Omit<Appointment, 'id' | 'status'>) => {
    try {
      const newAppointment = await createAppointment(appointment);
      setAppointments([...appointments, newAppointment]);
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw new Error('Error al agendar la cita. Por favor intenta de nuevo.');
    }
  };

  const handleStartVideoCall = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setCurrentScreen('videocall');
  };

  const handleEndVideoCall = async () => {
    if (currentAppointment) {
      try {
        const updated = await updateAppointment(currentAppointment.id, { status: 'completed' });
        setAppointments(appointments.map(apt => 
          apt.id === currentAppointment.id ? updated : apt
        ));
      } catch (error) {
        console.error('Error updating appointment:', error);
      }
    }
    setCurrentAppointment(null);
    setCurrentScreen('dashboard');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setAppointments([]);
      setCurrentScreen('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    localStorage.setItem('medconnect-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {currentScreen === 'home' && (
        <Home 
          onGetStarted={() => setCurrentScreen('register')} 
          onLogin={() => setCurrentScreen('login')}
          theme={theme} 
          onToggleTheme={toggleTheme} 
        />
      )}
      {currentScreen === 'login' && (
        <Login
          onLogin={handleLogin}
          onBack={() => setCurrentScreen('home')}
          onRegister={() => setCurrentScreen('register')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'register' && (
        <Register 
          onRegister={handleRegister}
          onBack={() => setCurrentScreen('home')}
          onLogin={() => setCurrentScreen('login')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'onboarding' && user && (
        <Onboarding 
          userName={user.name}
          onComplete={handleOnboardingComplete}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'dashboard' && user && (
        <Dashboard 
          user={user}
          appointments={appointments}
          onNavigate={(screen) => {
            if (screen === 'documents') {
              handleNavigateToDocuments();
            } else {
              setCurrentScreen(screen);
            }
          }}
          onStartVideoCall={handleStartVideoCall}
          onSignOut={handleSignOut}
          loadingAppointments={loadingAppointments}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'schedule' && (
        <ScheduleAppointment 
          onSchedule={handleScheduleAppointment}
          onCancel={() => setCurrentScreen('dashboard')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'videocall' && currentAppointment && (
        <VideoCall 
          appointment={currentAppointment}
          onEndCall={handleEndVideoCall}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'history' && (
        <MedicalHistory 
          appointments={appointments}
          onBack={() => setCurrentScreen('dashboard')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      {currentScreen === 'documents' && (
        <UploadDocuments 
          documents={documents}
          onUpload={handleUploadDocument}
          onDelete={handleDeleteDocument}
          onBack={() => setCurrentScreen('dashboard')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}

export default App;