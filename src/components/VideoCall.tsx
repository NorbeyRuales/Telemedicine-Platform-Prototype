import { useState, useEffect } from 'react';
import { Heart, Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, AlertCircle } from 'lucide-react';
import { Appointment, Theme } from '../App';
import { ThemeToggle } from './ThemeToggle';

interface VideoCallProps {
  appointment: Appointment;
  onEndCall: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function VideoCall({ appointment, onEndCall, theme, onToggleTheme }: VideoCallProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    // Simulate connection
    const connectTimer = setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);

    // Call duration counter
    const durationTimer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(durationTimer);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setShowEndConfirm(true);
  };

  const confirmEndCall = () => {
    onEndCall();
  };

  return (
    <div className="min-h-screen glass-background flex flex-col">
      {/* Header */}
      <header className="glass-panel shadow-lg rounded-b-3xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="text-blue-500 dark:text-blue-400" size={24} />
              <span className="text-blue-900 dark:text-white">MedConnect</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              {connectionStatus === 'connected' && (
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Conectado</span>
                </div>
              )}
              <span className="text-blue-900 dark:text-white">
                {formatDuration(callDuration)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Connection Status */}
        {connectionStatus === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-xl mb-2">Conectando con tu médico...</p>
              <p className="text-gray-400">
                Esto tomará solo unos segundos
              </p>
            </div>
          </div>
        )}

        {/* Doctor Video (Main) */}
        <div className="h-full bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-4xl">
                {appointment.doctorName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <h2 className="text-white text-2xl mb-2">
              {appointment.doctorName}
            </h2>
            <p className="text-gray-400">
              {appointment.specialty}
            </p>
          </div>
        </div>

        {/* Patient Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 glass-panel glass-muted rounded-2xl overflow-hidden shadow-lg">
          {isVideoEnabled ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-600">
              <div className="text-center">
                <Video className="text-gray-400 mx-auto mb-2" size={32} />
                <p className="text-gray-300">Tu video</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <VideoOff className="text-gray-500" size={32} />
            </div>
          )}
        </div>

        {/* Connection Help */}
        {connectionStatus === 'connected' && (
          <div className="absolute top-4 left-4 glass-panel glass-cta text-white px-4 py-3 rounded-2xl max-w-md">
            <div className="flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="mb-1">Consejos para una buena consulta:</p>
                <ul className="text-sm space-y-1 text-blue-100">
                  <li>• Busca un lugar tranquilo y con buena luz</li>
                  <li>• Habla claro y cerca del micrófono</li>
                  <li>• Ten a mano tus documentos médicos</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="glass-panel rounded-t-3xl p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            {/* Video Toggle */}
            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isVideoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              aria-label={isVideoEnabled ? 'Apagar cámara' : 'Encender cámara'}
              title={isVideoEnabled ? 'Apagar cámara' : 'Encender cámara'}
            >
              {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isAudioEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              aria-label={isAudioEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
              title={isAudioEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
            >
              {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
            </button>

            {/* End Call */}
            <button
              onClick={handleEndCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-colors"
              aria-label="Terminar llamada"
              title="Terminar llamada"
            >
              <PhoneOff size={24} />
            </button>

            {/* Chat */}
            <button
              className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white transition-colors"
              aria-label="Abrir chat"
              title="Abrir chat"
            >
              <MessageSquare size={24} />
            </button>
          </div>

          {/* Control Labels */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <p className="text-gray-400 text-sm text-center w-14">
              {isVideoEnabled ? 'Video' : 'Sin video'}
            </p>
            <p className="text-gray-400 text-sm text-center w-14">
              {isAudioEnabled ? 'Audio' : 'Silenciado'}
            </p>
            <p className="text-gray-400 text-sm text-center w-14">
              Colgar
            </p>
            <p className="text-gray-400 text-sm text-center w-14">
              Chat
            </p>
          </div>
        </div>
      </div>

      {/* End Call Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6">
            <h3 className="text-blue-900 mb-3">
              ¿Terminar la consulta?
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres finalizar esta videollamada? 
              El médico guardará un resumen de la consulta en tu historial.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmEndCall}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sí, terminar consulta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Help */}
      <div
        className="absolute bottom-24 left-4 glass-panel text-white px-4 py-3 rounded-2xl max-w-xs"
        style={{
          background: 'linear-gradient(135deg, rgba(185, 28, 28, 0.9), rgba(153, 27, 27, 0.85))',
          borderColor: 'rgba(248, 113, 113, 0.35)'
        }}
      >
        <p className="mb-2">🚨 En caso de emergencia:</p>
        <p className="text-sm">
          Si sientes que tu vida está en peligro, cuelga inmediatamente 
          y llama al número de emergencias de tu país.
        </p>
      </div>
    </div>
  );
}
