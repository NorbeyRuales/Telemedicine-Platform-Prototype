import { Heart, Calendar, Video, FileText, Clock, CheckCircle, User, LogOut, Upload } from 'lucide-react';
import { User as UserType, Appointment, Screen, Theme } from '../App';
import { ThemeToggle } from './ThemeToggle';

interface DashboardProps {
  user: UserType;
  appointments: Appointment[];
  onNavigate: (screen: Screen) => void;
  onStartVideoCall: (appointment: Appointment) => void;
  onSignOut: () => void;
  loadingAppointments?: boolean;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Dashboard({ user, appointments, onNavigate, onStartVideoCall, onSignOut, loadingAppointments, theme, onToggleTheme }: DashboardProps) {
  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const hasUpcomingAppointments = upcomingAppointments.length > 0;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Próxima';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="text-blue-600 dark:text-blue-400" size={32} />
              <span className="text-blue-900 dark:text-white">MedConnect</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              <User className="text-gray-600 dark:text-gray-400" size={20} />
              <span className="text-gray-700 dark:text-gray-300">{user.name}</span>
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ml-2"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-blue-900 dark:text-white mb-2">
            Bienvenido, {user.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl">
            ¿Qué necesitas hacer hoy?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => onNavigate('schedule')}
            className="bg-blue-600 dark:bg-blue-500 text-white p-6 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-3"
          >
            <Calendar size={24} />
            <div className="text-left">
              <p>Agendar nueva cita</p>
              <p className="text-blue-100 dark:text-blue-200">Encuentra un doctor disponible</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('documents')}
            className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
          >
            <Upload size={24} />
            <div className="text-left">
              <p className="text-gray-900 dark:text-white">Subir documentos</p>
              <p className="text-gray-600 dark:text-gray-400">Exámenes y recetas médicas</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
          >
            <FileText size={24} />
            <div className="text-left">
              <p className="text-gray-900 dark:text-white">Ver historial médico</p>
              <p className="text-gray-600 dark:text-gray-400">Tus consultas anteriores</p>
            </div>
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-blue-900 dark:text-white">
              Tus próximas consultas
            </h2>
          </div>

          {hasUpcomingAppointments ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-900 dark:text-white">
                          {appointment.doctorName}
                        </span>
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-1">
                        {appointment.specialty}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {formatDate(appointment.date)} a las {appointment.time}
                      </p>
                      {appointment.reason && (
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                          Motivo: {appointment.reason}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onStartVideoCall(appointment)}
                      className="bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center gap-2 justify-center"
                    >
                      <Video size={20} />
                      <span>Iniciar consulta</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={64} />
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No tienes consultas programadas en este momento
              </p>
              <button
                onClick={() => onNavigate('schedule')}
                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
              >
                <Calendar size={20} />
                <span>Agendar mi primera consulta</span>
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {appointments.some(apt => apt.status === 'completed') && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-blue-900 dark:text-white mb-6">
              Consultas recientes
            </h2>
            <div className="space-y-3">
              {appointments
                .filter(apt => apt.status === 'completed')
                .slice(0, 3)
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <p className="text-gray-900 dark:text-white">
                        {appointment.doctorName} - {appointment.specialty}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {formatDate(appointment.date)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                ))}
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-2"
            >
              Ver todas las consultas anteriores
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h3 className="text-blue-900 dark:text-blue-300 mb-2">¿Necesitas ayuda?</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Si tienes alguna pregunta o problema, estamos aquí para ayudarte.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="tel:1-800-633-2666" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              📞 1-800-MEDCONNECT
            </a>
            <a href="mailto:ayuda@medconnect.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              ✉️ ayuda@medconnect.com
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}