import { Heart, ArrowLeft, Calendar, FileText, Download, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { Appointment, Theme } from '../App';
import { ThemeToggle } from './ThemeToggle';

interface MedicalHistoryProps {
  appointments: Appointment[];
  onBack: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function MedicalHistory({ appointments, onBack, theme, onToggleTheme }: MedicalHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

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

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.reason && appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

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
            <div className="flex items-center gap-4">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Volver al panel principal"
              >
                <ArrowLeft size={20} />
                <span>Volver</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-blue-900 dark:text-white mb-2">
            Tu historial médico
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl">
            Aquí puedes ver todas tus consultas y documentos médicos
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-gray-700 dark:text-gray-300 mb-2">
                Buscar en tu historial
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Busca por médico, especialidad o motivo..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Filter */}
            <div>
              <label htmlFor="filter" className="block text-gray-700 dark:text-gray-300 mb-2">
                Filtrar por estado
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
                <select
                  id="filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Todas las consultas</option>
                  <option value="upcoming">Próximas</option>
                  <option value="completed">Completadas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>
            </div>
          </div>

          {searchTerm && (
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Mostrando resultados para: "<span>{searchTerm}</span>"
            </p>
          )}
        </div>

        {/* Appointments List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
          {sortedAppointments.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-blue-900 dark:text-white">
                              {appointment.doctorName}
                            </h3>
                            <span className={`px-2 py-1 rounded text-sm ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">
                            {appointment.specialty}
                          </p>
                        </div>
                      </div>

                      <div className="ml-0 lg:ml-15 space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar size={16} />
                          <span>{formatDate(appointment.date)} a las {appointment.time}</span>
                        </div>
                        {appointment.reason && (
                          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <FileText size={16} className="mt-0.5 flex-shrink-0" />
                            <span>Motivo: {appointment.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {appointment.status === 'completed' && (
                      <div className="flex flex-col gap-2">
                        <button className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                          <FileText size={18} />
                          <span>Ver resumen</span>
                        </button>
                        <button className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                          <Download size={18} />
                          <span>Descargar receta</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="text-gray-300 dark:text-gray-600 mx-auto mb-4" size={64} />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No se encontraron consultas con esos criterios'
                  : 'Aún no tienes consultas en tu historial'
                }
              </p>
              {(searchTerm || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {appointments.length > 0 && (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-1">Total de consultas</p>
              <p className="text-3xl text-blue-900 dark:text-blue-400">
                {appointments.length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-1">Consultas completadas</p>
              <p className="text-3xl text-green-600 dark:text-green-400">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-1">Consultas próximas</p>
              <p className="text-3xl text-blue-600 dark:text-blue-400">
                {appointments.filter(a => a.status === 'upcoming').length}
              </p>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h3 className="text-blue-900 dark:text-blue-300 mb-2">🔒 Tu privacidad está protegida</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Toda tu información médica está encriptada y segura. Solo tú y los médicos 
            que autorizas pueden acceder a tu historial.
          </p>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            Conocer más sobre privacidad →
          </button>
        </div>

        {/* Export Options */}
        {appointments.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-blue-900 dark:text-white mb-4">
              Descargar tu historial completo
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Puedes descargar una copia de todo tu historial médico en formato PDF. 
              Esto es útil si necesitas compartir tu información con otro médico.
            </p>
            <button className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Download size={20} />
              <span>Descargar historial completo (PDF)</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}