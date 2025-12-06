import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { User, Appointment } from '../App';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

const API_BASE = `${supabaseUrl}/functions/v1/make-server-1f0a837c`;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
}

// Helper functions for localStorage fallback
const getLocalStorageKey = (userId: string, type: string) => `medconnect_${userId}_${type}`;

const saveToLocalStorage = (userId: string, type: string, data: any) => {
  try {
    localStorage.setItem(getLocalStorageKey(userId, type), JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const getFromLocalStorage = (userId: string, type: string) => {
  try {
    const data = localStorage.getItem(getLocalStorageKey(userId, type));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

export function useSupabase() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    loading: true
  });

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Try to get user profile from API
        try {
          const response = await fetch(`${API_BASE}/user/profile`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setAuthState({
              user: data.user,
              accessToken: session.access_token,
              loading: false
            });
            return;
          }
        } catch (err) {
          console.error('Error fetching profile, using metadata:', err);
        }

        // Fallback to session metadata if API fails
        const userData = {
          id: session.user?.id,
          name: session.user?.user_metadata?.name || session.user?.email?.split('@')[0] || 'Usuario',
          email: session.user?.email || '',
          hasCompletedOnboarding: session.user?.user_metadata?.hasCompletedOnboarding ?? false
        };

        setAuthState({
          user: userData,
          accessToken: session.access_token,
          loading: false
        });
      } else {
        setAuthState({ user: null, accessToken: null, loading: false });
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setAuthState({ user: null, accessToken: null, loading: false });
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      console.log('Attempting signup for:', email);
      
      // Try server endpoint first (for auto-confirmed emails)
      try {
        const response = await fetch(`${API_BASE}/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        console.log('Signup response:', { status: response.status, ok: response.ok, hasError: !!data.error });

        if (response.ok && data.user) {
          console.log('User created via server, now signing in...');

          // Now sign in with the created credentials
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (signInError || !signInData.session) {
            console.error('Sign in error after signup:', signInError);
            throw new Error('Tu cuenta fue creada exitosamente, pero no pudimos iniciar sesión automáticamente. Por favor inicia sesión manualmente');
          }

          console.log('Sign in successful');

          const userData = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            hasCompletedOnboarding: false
          };

          setAuthState({
            user: userData,
            accessToken: signInData.session.access_token,
            loading: false
          });

          return userData;
        }
      } catch (serverError) {
        console.warn('Server signup failed, falling back to direct Supabase Auth:', serverError);
      }

      // Fallback: Use Supabase Auth directly
      console.log('Using direct Supabase Auth signup...');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            hasCompletedOnboarding: false
          }
        }
      });

      if (authError) {
        console.error('Supabase auth signup error:', authError);
        
        // Mensajes de error empáticos
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          throw new Error('Ya existe una cuenta con este correo electrónico. ¿Quieres iniciar sesión?');
        }
        if (authError.message.includes('password')) {
          throw new Error('La contraseña debe tener al menos 6 caracteres. Por favor elige una contraseña más segura');
        }
        if (authError.message.includes('email')) {
          throw new Error('El formato del correo electrónico no es válido. Verifica que esté escrito correctamente');
        }
        
        throw new Error(authError.message || 'No pudimos crear tu cuenta. Por favor intenta nuevamente');
      }

      if (!authData.user) {
        throw new Error('Hubo un problema al crear tu cuenta. Por favor intenta de nuevo o contacta a soporte');
      }

      console.log('Supabase signup successful');

      // If email confirmation is required, inform the user
      if (!authData.session) {
        throw new Error('Te hemos enviado un correo de confirmación. Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta');
      }

      const userData = {
        id: authData.user.id,
        name: authData.user.user_metadata?.name || name,
        email: authData.user.email || email,
        hasCompletedOnboarding: false
      };

      setAuthState({
        user: userData,
        accessToken: authData.session.access_token,
        loading: false
      });

      // Try to save to KV store (best effort)
      try {
        await fetch(`${API_BASE}/user/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authData.session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, hasCompletedOnboarding: false })
        });
      } catch (kvError) {
        console.warn('Could not save to KV store:', kvError);
        // Non-critical error, continue
      }

      return userData;
    } catch (error) {
      console.error('Signup error:', error);
      // Re-throw the error with the original message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ocurrió un error inesperado al crear tu cuenta. Por favor intenta nuevamente');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Use Supabase Auth directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase signin error:', error);
        // Mensajes de error empáticos
        if (error.message.includes('Invalid') || error.message.includes('credentials')) {
          throw new Error('El correo o la contraseña no son correctos. Por favor revisa tus datos e intenta nuevamente');
        }
        if (error.message.includes('not found') || error.message.includes('User')) {
          throw new Error('No encontramos una cuenta con este correo electrónico. ¿Quieres crear una cuenta nueva?');
        }
        throw new Error('No pudimos iniciar sesión en este momento. Por favor verifica tu conexión e intenta de nuevo');
      }

      if (!data.session) {
        throw new Error('No se pudo crear la sesión');
      }

      // Get user profile from KV store via API
      let userData = null;
      try {
        const response = await fetch(`${API_BASE}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const profileData = await response.json();
          userData = profileData.user;
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }

      // Fallback to metadata if profile not found
      if (!userData) {
        userData = {
          id: data.user?.id,
          name: data.user?.user_metadata?.name || data.user?.email?.split('@')[0] || 'Usuario',
          email: data.user?.email || email,
          hasCompletedOnboarding: data.user?.user_metadata?.hasCompletedOnboarding ?? false
        };
      }

      setAuthState({
        user: userData,
        accessToken: data.session.access_token,
        loading: false
      });

      return userData;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (authState.accessToken) {
        await fetch(`${API_BASE}/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }

      await supabase.auth.signOut();
      setAuthState({ user: null, accessToken: null, loading: false });
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!authState.accessToken || !authState.user) {
        throw new Error('No authenticated user');
      }

      // Try to update via API first
      try {
        const response = await fetch(`${API_BASE}/user/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authState.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (response.ok && data.user) {
          setAuthState(prev => ({ ...prev, user: data.user }));
          return data.user;
        }
      } catch (apiError) {
        console.warn('API update failed, falling back to local update:', apiError);
      }

      // Fallback: Update user metadata directly with Supabase
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: {
          ...authState.user,
          ...updates
        }
      });

      if (authError) {
        throw new Error(authError.message || 'Error al actualizar perfil');
      }

      const updatedUser = {
        ...authState.user,
        ...updates,
        id: authData.user?.id || authState.user.id,
        email: authData.user?.email || authState.user.email
      };

      setAuthState(prev => ({ ...prev, user: updatedUser }));
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'status'>) => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }

      // Try API first
      try {
        const response = await fetch(`${API_BASE}/appointments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appointmentData)
        });

        const data = await response.json();

        if (response.ok && data.appointment) {
          return data.appointment;
        }
      } catch (apiError) {
        console.warn('API appointment creation failed, using localStorage:', apiError);
      }

      // Fallback to localStorage
      const appointment: Appointment = {
        ...appointmentData,
        id: `appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'upcoming'
      };

      const existingAppointments = getFromLocalStorage(authState.user.id!, 'appointments') || [];
      const updatedAppointments = [...existingAppointments, appointment];
      saveToLocalStorage(authState.user.id!, 'appointments', updatedAppointments);

      return appointment;
    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  };

  const getAppointments = async (): Promise<Appointment[]> => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }

      // Try API first
      try {
        const response = await fetch(`${API_BASE}/appointments`, {
          headers: {
            'Authorization': `Bearer ${authState.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.appointments) {
          return data.appointments;
        }
      } catch (apiError) {
        console.warn('API get appointments failed, using localStorage:', apiError);
      }

      // Fallback to localStorage
      return getFromLocalStorage(authState.user.id!, 'appointments') || [];
    } catch (error) {
      console.error('Get appointments error:', error);
      return [];
    }
  };

  const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }

      // Try API first
      try {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authState.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (response.ok && data.appointment) {
          return data.appointment;
        }
      } catch (apiError) {
        console.warn('API update appointment failed, using localStorage:', apiError);
      }

      // Fallback to localStorage
      const appointments = getFromLocalStorage(authState.user.id!, 'appointments') || [];
      const updatedAppointments = appointments.map((apt: Appointment) =>
        apt.id === appointmentId ? { ...apt, ...updates } : apt
      );
      saveToLocalStorage(authState.user.id!, 'appointments', updatedAppointments);

      const updatedAppointment = updatedAppointments.find((apt: Appointment) => apt.id === appointmentId);
      return updatedAppointment;
    } catch (error) {
      console.error('Update appointment error:', error);
      throw error;
    }
  };

  const uploadDocument = async (file: File, description: string) => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }

      // Try API first
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);

        const response = await fetch(`${API_BASE}/documents/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.accessToken}`
          },
          body: formData
        });

        const data = await response.json();

        if (response.ok && data.document) {
          return data.document;
        }
      } catch (apiError) {
        console.warn('API document upload failed, using localStorage:', apiError);
      }

      // Fallback to localStorage (store file metadata only)
      return new Promise<any>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const document = {
            id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            description,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString(),
            url: reader.result as string // Store as base64 for demo purposes
          };

          const existingDocuments = getFromLocalStorage(authState.user!.id!, 'documents') || [];
          const updatedDocuments = [...existingDocuments, document];
          saveToLocalStorage(authState.user!.id!, 'documents', updatedDocuments);

          resolve(document);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  };

  const getDocuments = async () => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }

      // Try API first
      try {
        const response = await fetch(`${API_BASE}/documents`, {
          headers: {
            'Authorization': `Bearer ${authState.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.documents) {
          return data.documents;
        }
      } catch (apiError) {
        console.warn('API get documents failed, using localStorage:', apiError);
      }

      // Fallback to localStorage
      return getFromLocalStorage(authState.user.id!, 'documents') || [];
    } catch (error) {
      console.error('Get documents error:', error);
      return [];
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }

      // Try API first
      try {
        const response = await fetch(`${API_BASE}/documents/${documentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authState.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok) {
          return data;
        }
      } catch (apiError) {
        console.warn('API delete document failed, using localStorage:', apiError);
      }

      // Fallback to localStorage
      const documents = getFromLocalStorage(authState.user.id!, 'documents') || [];
      const updatedDocuments = documents.filter((doc: any) => doc.id !== documentId);
      saveToLocalStorage(authState.user.id!, 'documents', updatedDocuments);

      return { success: true };
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  };

  return {
    user: authState.user,
    accessToken: authState.accessToken,
    loading: authState.loading,
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
  };
}