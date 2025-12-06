import { useState, useEffect } from 'react';
import { Heart, ArrowLeft, Mail, Lock, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Theme } from '../App';
import { ThemeToggle } from './ThemeToggle';
import { useAnalytics } from '../utils/analytics';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onBack: () => void;
  onRegister: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Login({ onLogin, onBack, onRegister, theme, onToggleTheme }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  
  const { trackAction, trackError, trackSuccess, trackExit } = useAnalytics('Login');

  useEffect(() => {
    return () => trackExit();
  }, [trackExit]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Por favor escribe tu correo electrónico para continuar';
      trackError('email', 'empty');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Parece que falta algo en tu correo. Asegúrate de incluir @ y un dominio (ejemplo: tucorreo@gmail.com)';
      trackError('email', 'invalid_format');
    }

    if (!password) {
      newErrors.password = 'Por favor escribe tu contraseña para acceder';
      trackError('password', 'empty');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackAction('submit_login');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await onLogin(email, password);
      trackSuccess('login');
    } catch (error: any) {
      const errorMessage = error.message || 'No pudimos iniciar tu sesión. Por favor verifica tu correo y contraseña e intenta nuevamente.';
      setErrors({ general: errorMessage });
      trackError('login', 'failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
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

      {/* Login Form */}
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <h1 className="text-blue-900 dark:text-white text-center mb-2">
            Iniciar sesión
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
            Ingresa tus datos para acceder a tu cuenta
          </p>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-start gap-2 text-red-800 dark:text-red-300">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p>{errors.general}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">
                Correo electrónico
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
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="ejemplo@correo.com"
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <div id="email-error" className="mt-2 flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p>{errors.email}</p>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
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
                  onBlur={() => setTouched({ ...touched, password: true })}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Tu contraseña"
                  aria-describedby={errors.password ? "password-error" : undefined}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <div id="password-error" className="mt-2 flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p>{errors.password}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              ¿No tienes cuenta?{' '}
              <button
                onClick={onRegister}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>

        {/* Help Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <p className="text-blue-900 dark:text-blue-300 mb-2">¿Olvidaste tu contraseña?</p>
          <p className="text-gray-700 dark:text-gray-300">
            Si no puedes acceder a tu cuenta, contáctanos al teléfono 
            <span> 1-800-MEDCONNECT</span> o escríbenos a 
            <span> ayuda@medconnect.com</span>
          </p>
        </div>
      </main>
    </div>
  );
}