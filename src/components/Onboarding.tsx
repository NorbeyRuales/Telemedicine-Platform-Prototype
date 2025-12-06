import { useState, useEffect } from 'react';
import { Heart, Calendar, Video, FileText, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Theme } from '../App';
import { ThemeToggle } from './ThemeToggle';
import { useAnalytics } from '../utils/analytics';

interface OnboardingProps {
  userName: string;
  onComplete: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const steps = [
  {
    icon: Calendar,
    title: 'Agenda tu consulta médica',
    description: 'Elige el día y la hora que mejor te funcione. Te mostraremos los médicos disponibles y podrás seleccionar el que prefieras.',
    tip: '💡 Puedes agendar con anticipación o buscar citas para el mismo día'
  },
  {
    icon: Video,
    title: 'Conecta con tu médico',
    description: 'Cuando llegue el momento de tu cita, presiona el botón "Iniciar consulta". Es muy sencillo y no necesitas descargar ningún programa.',
    tip: '💡 Te recomendamos estar en un lugar tranquilo con buena conexión a internet'
  },
  {
    icon: FileText,
    title: 'Consulta tu historial médico',
    description: 'Todas tus consultas, diagnósticos y recetas quedarán guardados de forma segura. Podrás revisarlos cuando los necesites.',
    tip: '💡 Tu información está protegida y solo tú puedes acceder a ella'
  }
];

export function Onboarding({ userName, onComplete, theme, onToggleTheme }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { trackAction, trackSuccess, trackExit } = useAnalytics('Onboarding');

  useEffect(() => {
    return () => trackExit();
  }, [trackExit]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      trackAction(`step_${currentStep + 1}_next`);
    } else {
      trackSuccess('completed');
      onComplete();
    }
  };

  const handleSkip = () => {
    trackAction('skip');
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

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
                onClick={handleSkip}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Saltar tutorial
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Onboarding Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-blue-900 dark:text-white mb-3">
            ¡Hola, {userName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl">
            Te vamos a enseñar cómo usar MedConnect en 3 pasos simples
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep 
                  ? 'w-8 bg-blue-600 dark:bg-blue-500' 
                  : index < currentStep 
                    ? 'w-2 bg-green-600 dark:bg-green-500' 
                    : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={`Paso ${index + 1} de ${steps.length}${
                index === currentStep ? ' (actual)' : index < currentStep ? ' (completado)' : ''
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
              <Icon className="text-blue-600 dark:text-blue-400" size={40} />
            </div>
            
            <div className="mb-2 inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span>Paso {currentStep + 1} de {steps.length}</span>
            </div>

            <h2 className="text-blue-900 dark:text-white mb-4">
              {currentStepData.title}
            </h2>

            <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg max-w-lg">
              {currentStepData.description}
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 w-full max-w-lg">
              <p className="text-blue-900 dark:text-blue-300 mb-1">💡 Consejo útil</p>
              <p className="text-gray-700 dark:text-gray-300">
                {currentStepData.tip}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Paso anterior
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Check size={20} />
                <span>Entendido, empecemos</span>
              </>
            ) : (
              <>
                <span>Siguiente paso</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          Puedes volver a ver este tutorial en cualquier momento desde tu perfil
        </p>
      </main>
    </div>
  );
}