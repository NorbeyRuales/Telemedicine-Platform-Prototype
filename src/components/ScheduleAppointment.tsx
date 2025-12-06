import { useState, useEffect } from 'react';
import { Heart, ArrowLeft, Calendar, Clock, User, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Appointment, Theme } from '../App';
import { ThemeToggle } from './ThemeToggle';
import { useAnalytics } from '../utils/analytics';

interface ScheduleAppointmentProps {
  onSchedule: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  onCancel: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const doctors = [
  { id: '1', name: 'Dra. María González', specialty: 'Medicina General', available: true },
  { id: '2', name: 'Dr. Carlos Rodríguez', specialty: 'Pediatría', available: true },
  { id: '3', name: 'Dra. Ana Martínez', specialty: 'Dermatología', available: true },
  { id: '4', name: 'Dr. Luis Fernández', specialty: 'Cardiología', available: false },
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

export function ScheduleAppointment({ onSchedule, onCancel, theme, onToggleTheme }: ScheduleAppointmentProps) {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { trackAction, trackError, trackSuccess, trackExit } = useAnalytics('ScheduleAppointment');

  useEffect(() => {
    return () => trackExit();
  }, [trackExit]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedDoctor) {
      newErrors.doctor = 'Necesitamos saber con qué médico quieres agendar tu cita';
      trackError('doctor', 'empty');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedDate) {
      newErrors.date = 'Por favor selecciona el día que mejor te funcione';
      trackError('date', 'empty');
    } else {
      const selected = new Date(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selected < today) {
        newErrors.date = 'La fecha que elegiste ya pasó. Por favor selecciona una fecha futura';
        trackError('date', 'past_date');
      }
    }

    if (!selectedTime) {
      newErrors.time = 'Por favor elige la hora que prefieres para tu consulta';
      trackError('time', 'empty');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!reason.trim()) {
      newErrors.reason = 'Necesitamos saber el motivo de tu consulta para poder ayudarte mejor';
      trackError('reason', 'empty');
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Por favor describe un poco más el motivo de tu consulta (mínimo 10 caracteres)';
      trackError('reason', 'too_short');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setErrors({});
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      setErrors({});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    const doctor = doctors.find(d => d.id === selectedDoctor);
    if (!doctor) return;

    setShowConfirmation(true);

    setTimeout(() => {
      onSchedule({
        doctorName: doctor.name,
        specialty: doctor.specialty,
        date: selectedDate,
        time: selectedTime,
        reason: reason.trim()
      });
      trackSuccess();
    }, 2000);
  };

  const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

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
                onClick={onCancel}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Volver al inicio"
              >
                <ArrowLeft size={20} />
                <span>Volver</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-blue-900 dark:text-white text-center mb-3">
            Agendar nueva consulta
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center text-xl">
            Te ayudaremos paso a paso a programar tu cita
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {step > 1 ? <CheckCircle size={20} /> : '1'}
              </div>
              <span className="hidden sm:inline">Médico</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {step > 2 ? <CheckCircle size={20} /> : '2'}
              </div>
              <span className="hidden sm:inline">Fecha y hora</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                3
              </div>
              <span className="hidden sm:inline">Motivo</span>
            </div>
          </div>
        </div>

        {showConfirmation ? (
          <div className="glass-panel rounded-3xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <h2 className="text-blue-900 dark:text-white mb-3">
                ¡Cita agendada exitosamente!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Te enviaremos un recordatorio por correo electrónico un día antes de tu consulta.
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-8">
            {/* Step 1: Select Doctor */}
            {step === 1 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <User className="text-blue-600 dark:text-blue-400" size={24} />
                  <h2 className="text-blue-900 dark:text-white">
                    Paso 1: Elige tu médico
                  </h2>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Selecciona el especialista que necesitas consultar
                </p>

                <div className="space-y-3">
                  {doctors.map((doctor) => (
                    <label
                      key={doctor.id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedDoctor === doctor.id
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      } ${!doctor.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="doctor"
                        value={doctor.id}
                        checked={selectedDoctor === doctor.id}
                        onChange={(e) => {
                          setSelectedDoctor(e.target.value);
                          if (errors.doctor) setErrors({ ...errors, doctor: undefined });
                        }}
                        disabled={!doctor.available}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900 dark:text-white">
                            {doctor.name}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">
                            {doctor.specialty}
                          </p>
                        </div>
                        {!doctor.available && (
                          <span className="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                            No disponible
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {errors.doctor && (
                  <div className="mt-4 flex items-start gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <p>{errors.doctor}</p>
                  </div>
                )}

                <button
                  onClick={handleNext}
                  className="w-full mt-6 glass-panel glass-cta text-blue-900 dark:text-white py-3 rounded-lg transition-transform hover:-translate-y-1"
                >
                  Continuar al siguiente paso
                </button>
              </div>
            )}

            {/* Step 2: Select Date and Time */}
            {step === 2 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
                  <h2 className="text-blue-900 dark:text-white">
                    Paso 2: Elige fecha y horario
                  </h2>
                </div>

                {selectedDoctorData && (
                  <div className="mb-6 glass-panel glass-cta rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      Médico seleccionado: <span>{selectedDoctorData.name}</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedDoctorData.specialty}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <label htmlFor="date" className="block text-gray-700 dark:text-gray-300 mb-2">
                    ¿Qué día prefieres?
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (errors.date) setErrors({ ...errors, date: undefined });
                    }}
                    min={today}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                      errors.date ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    aria-describedby={errors.date ? "date-error" : undefined}
                  />
                  {errors.date && (
                    <div id="date-error" className="mt-2 flex items-start gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                      <p>{errors.date}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    ¿A qué hora te gustaría?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setSelectedTime(time);
                          if (errors.time) setErrors({ ...errors, time: undefined });
                        }}
                        className={`p-3 border-2 rounded-lg transition-colors ${
                          selectedTime === time
                            ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Clock size={16} className="inline mr-1" />
                        {time}
                      </button>
                    ))}
                  </div>
                  {errors.time && (
                    <div className="mt-3 flex items-start gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                      <p>{errors.time}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 glass-panel glass-muted text-gray-900 dark:text-white py-3 rounded-lg transition-transform hover:-translate-y-1"
                  >
                    Paso anterior
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 glass-panel glass-cta text-blue-900 dark:text-white py-3 rounded-lg transition-transform hover:-translate-y-1"
                  >
                    Continuar al siguiente paso
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Reason for Visit */}
            {step === 3 && (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                  <h2 className="text-blue-900 dark:text-white">
                    Paso 3: Motivo de la consulta
                  </h2>
                </div>

                {selectedDoctorData && (
                  <div className="mb-6 glass-panel glass-cta rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 mb-1">
                      <span>Médico:</span> {selectedDoctorData.name}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span>Fecha:</span> {new Date(selectedDate).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} a las {selectedTime}
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="reason" className="block text-gray-700 dark:text-gray-300 mb-2">
                    Cuéntanos brevemente: ¿Por qué necesitas esta consulta?
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (errors.reason) setErrors({ ...errors, reason: undefined });
                    }}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                      errors.reason ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Ejemplo: Tengo dolor de cabeza frecuente desde hace una semana"
                    aria-describedby={errors.reason ? "reason-error" : "reason-help"}
                  />
                  {errors.reason ? (
                    <div id="reason-error" className="mt-2 flex items-start gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                      <p>{errors.reason}</p>
                    </div>
                  ) : (
                    <p id="reason-help" className="mt-2 text-gray-500 dark:text-gray-400">
                      Esto ayuda al médico a prepararse mejor para tu consulta
                    </p>
                  )}
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 glass-panel glass-muted text-gray-900 dark:text-white py-3 rounded-lg transition-transform hover:-translate-y-1"
                  >
                    Paso anterior
                  </button>
                  <button
                    type="submit"
                    className="flex-1 glass-panel rounded-lg text-white transition-transform hover:-translate-y-1"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.92), rgba(34, 197, 94, 0.9))',
                      borderColor: 'rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    Confirmar y agendar cita
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Help Box */}
        <div className="mt-8 glass-panel glass-cta rounded-3xl p-6">
          <p className="text-blue-900 dark:text-blue-300 mb-2">💡 ¿Necesitas ayuda para agendar?</p>
          <p className="text-gray-700 dark:text-gray-300">
            Si tienes dificultades, llámanos al <span>1-800-MEDCONNECT</span> y 
            te ayudaremos a programar tu cita por teléfono.
          </p>
        </div>
      </main>
    </div>
  );
}
