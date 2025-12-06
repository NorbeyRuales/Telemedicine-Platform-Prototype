import { useState, useEffect, type FormEvent } from 'react';
import { Heart, ArrowLeft, Mail, User, AlertCircle, Lock, Shield, Eye, EyeOff, CheckCircle, Info } from 'lucide-react';
import { Theme } from '../App';
import { ThemeToggle } from './ThemeToggle';
import { useAnalytics } from '../utils/analytics';

interface RegisterProps {
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onBack: () => void;
  onLogin: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Register({ onRegister, onBack, onLogin, theme, onToggleTheme }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [touched, setTouched] = useState<{ 
    name?: boolean; 
    email?: boolean; 
    password?: boolean; 
    confirmPassword?: boolean;
  }>({});
  
  const { trackAction, trackError, trackSuccess, trackExit } = useAnalytics('Register');

  useEffect(() => {
    return () => trackExit();
  }, [trackExit]);

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Necesitamos saber tu nombre para poder atenderte mejor';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Tu nombre parece muy corto. Por favor escribe tu nombre completo';
    }

    if (!email.trim()) {
      newErrors.email = 'Tu correo electrónico es importante para enviarte recordatorios de tus citas';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Parece que falta algo en tu correo. Asegúrate de incluir @ y un dominio (ejemplo: tunombre@gmail.com)';
    }

    if (!password) {
      newErrors.password = 'Necesitas crear una contraseña para proteger tu cuenta';
    } else if (password.length < 6) {
      newErrors.password = 'Para tu seguridad, usa al menos 6 caracteres en tu contraseña';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Por favor confirma tu contraseña escribiéndola nuevamente';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden. Verifica que sean iguales';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await onRegister(name, email, password);
      setShowSuccess(true);
      trackSuccess();
      // The redirect to onboarding will happen in App.tsx via useEffect
    } catch (error: any) {
      setErrors({ general: error.message || 'Error al crear la cuenta. Por favor intenta de nuevo.' });
      trackError('register', error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen glass-background">
      {/* Header */}
      <header className="glass-panel shadow-lg rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="text-blue-600 dark:text-blue-400" size={32} />
              <span className="text-blue-900 dark:text-white">MedConnect</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Volver a la página de inicio"
              >
                <ArrowLeft size={20} />
                <span>Volver</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Registration Form */}
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="glass-panel rounded-3xl p-8">
          <h1 className="text-blue-900 dark:text-white text-center mb-2">
            Bienvenido a MedConnect
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
            Completa estos datos para crear tu cuenta
          </p>

          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-green-800 dark:text-green-300 text-center">
                ¡Perfecto! Tu cuenta está lista. Vamos a mostrarte cómo usar MedConnect.
              </p>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-start gap-2 text-red-800 dark:text-red-300">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p>{errors.general}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 mb-2">
                ¿Cómo te llamas?
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Escribe tu nombre completo"
                  aria-describedby={errors.name ? "name-error" : undefined}
                  aria-invalid={!!errors.name}
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <div id="name-error" className="mt-2 flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p>{errors.name}</p>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">
                ¿Cuál es tu correo electrónico?
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="ejemplo@correo.com"
                  aria-describedby={errors.email ? "email-error" : "email-help"}
                  aria-invalid={!!errors.email}
                  disabled={loading}
                />
              </div>
              {errors.email ? (
                <div id="email-error" className="mt-2 flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p>{errors.email}</p>
                </div>
              ) : (
                <p id="email-help" className="mt-2 text-gray-500 dark:text-gray-400">
                  Te enviaremos recordatorios de tus citas a este correo
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-2">
                Crea una contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Mínimo 6 caracteres"
                  aria-describedby={errors.password ? "password-error" : "password-help"}
                  aria-invalid={!!errors.password}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password ? (
                <div id="password-error" className="mt-2 flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p>{errors.password}</p>
                </div>
              ) : (
                <p id="password-help" className="mt-2 text-gray-500 dark:text-gray-400">
                  Usa al menos 6 caracteres
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 mb-2">
                Confirma tu contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.confirmPassword ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Escribe la misma contraseña"
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                  aria-invalid={!!errors.confirmPassword}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div id="confirm-password-error" className="mt-2 flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p>{errors.confirmPassword}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || showSuccess}
              className="w-full glass-panel glass-cta text-blue-900 dark:text-white py-3 rounded-lg transition-transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creando tu cuenta...</span>
                </>
              ) : showSuccess ? (
                'Cuenta creada exitosamente'
              ) : (
                'Crear mi cuenta gratis'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={onLogin}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-center mt-6">
            Al crear tu cuenta, aceptas mantener tu información actualizada
          </p>
        </div>

        {/* Help Box */}
        <div className="mt-8 glass-panel glass-cta rounded-3xl p-6">
          <p className="text-blue-900 dark:text-blue-300 mb-2">¿Necesitas ayuda?</p>
          <p className="text-gray-700 dark:text-gray-300">
            Si tienes problemas para registrarte, puedes contactarnos al teléfono 
            <span> 1-800-MEDCONNECT</span> o escribirnos a 
            <span> ayuda@medconnect.com</span>
          </p>
        </div>
      </main>
    </div>
  );
}
