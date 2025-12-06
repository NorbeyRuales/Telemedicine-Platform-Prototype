import { Heart, Video, Clock, Shield } from 'lucide-react';
import { Theme } from '../App';
import { ThemeToggle } from './ThemeToggle';

interface HomeProps {
  onGetStarted: () => void;
  onLogin: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Home({ onGetStarted, onLogin, theme, onToggleTheme }: HomeProps) {
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
                onClick={onLogin}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-blue-900 dark:text-white mb-6">
            Cuidamos tu salud desde donde estés
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-xl">
            Consulta con médicos profesionales desde la comodidad de tu hogar. 
            Simple, seguro y accesible para todos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="glass-panel glass-cta text-blue-900 dark:text-white px-8 py-4 rounded-2xl transition-transform hover:-translate-y-1 shadow-lg"
            >
              Crear cuenta gratis
            </button>
            <button
              onClick={onLogin}
              className="glass-panel glass-muted text-blue-600 dark:text-blue-300 px-8 py-4 rounded-2xl transition-transform hover:-translate-y-1"
            >
              Ya tengo cuenta
            </button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            Es gratis y solo toma 2 minutos
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="glass-panel glass-muted p-8 rounded-3xl text-center transition-transform hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <Video className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <h3 className="text-blue-900 dark:text-white mb-3">
              Videollamadas simples
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Habla con tu médico cara a cara. Solo necesitas presionar un botón, 
              sin descargas ni configuraciones complicadas.
            </p>
          </div>

          <div className="glass-panel glass-muted p-8 rounded-3xl text-center transition-transform hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <Clock className="text-green-600 dark:text-green-400" size={32} />
            </div>
            <h3 className="text-blue-900 dark:text-white mb-3">
              Agenda cuando puedas
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Elige el día y horario que mejor te funcione. 
              Te recordaremos tu cita para que no la olvides.
            </p>
          </div>

          <div className="glass-panel glass-muted p-8 rounded-3xl text-center transition-transform hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
              <Shield className="text-purple-600 dark:text-purple-400" size={32} />
            </div>
            <h3 className="text-blue-900 dark:text-white mb-3">
              Tu información protegida
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Tus datos médicos están seguros y privados. 
              Solo tú y tu médico pueden verlos.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20 glass-panel rounded-3xl p-8 md:p-12">
          <h2 className="text-center text-blue-900 dark:text-white mb-12">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Crea tu cuenta en 2 minutos
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Agenda tu consulta médica
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Habla con tu médico por video
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Recibe tu diagnóstico y receta
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-panel glass-muted mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
          <p>© 2025 MedConnect - Cuidando tu salud con tecnología accesible</p>
        </div>
      </footer>
    </div>
  );
}
