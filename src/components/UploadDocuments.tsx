import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { ArrowLeft, Upload, FileText, X, CheckCircle, AlertCircle, Download, Trash2, Info } from 'lucide-react';
import { Theme } from '../App';
import { ThemeToggle } from './ThemeToggle';
import { useAnalytics } from '../utils/analytics';

export interface MedicalDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  description: string;
  url: string;
}

interface UploadDocumentsProps {
  documents: MedicalDocument[];
  onUpload: (file: File, description: string) => Promise<void>;
  onDelete: (documentId: string) => Promise<void>;
  onBack: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function UploadDocuments({ documents, onUpload, onDelete, onBack, theme, onToggleTheme }: UploadDocumentsProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const { trackAction, trackError, trackSuccess, trackExit } = useAnalytics('UploadDocuments');

  useEffect(() => {
    return () => trackExit();
  }, [trackExit]);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es muy grande. Por favor sube un archivo menor a 10 MB');
      trackError('file_size', 'too_large');
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Por favor sube PDF, imagen (JPG/PNG) o documento Word');
      trackError('file_type', 'not_allowed');
      return;
    }

    setSelectedFile(file);
    setError('');
    trackAction('file_selected');
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Por favor selecciona un archivo para subir');
      trackError('file', 'not_selected');
      return;
    }

    if (!description.trim()) {
      setError('Por favor describe qué tipo de documento estás subiendo. Ejemplo: "Receta médica" o "Resultados de laboratorio"');
      trackError('description', 'empty');
      return;
    }

    if (description.trim().length < 5) {
      setError('La descripción es muy corta. Por favor escribe al menos 5 caracteres');
      trackError('description', 'too_short');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await onUpload(selectedFile, description);
      setSuccess(true);
      setSelectedFile(null);
      setDescription('');
      trackSuccess('document_uploaded');
      
      // Limpiar el input de archivo
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      const errorMessage = err.message || 'No pudimos subir el archivo. Por favor verifica tu conexión e intenta de nuevo';
      setError(errorMessage);
      trackError('upload', 'failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de eliminar este documento?\n\nEsta acción no se puede deshacer. El documento será eliminado permanentemente.'
    );
    
    if (!confirmDelete) {
      trackAction('delete_cancelled');
      return;
    }

    setDeletingId(documentId);
    try {
      await onDelete(documentId);
      trackSuccess('document_deleted');
    } catch (err: any) {
      setError(err.message || 'No pudimos eliminar el archivo');
      trackError('delete', 'failed');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    return '📎';
  };

  return (
    <div className="min-h-screen glass-background">
      {/* Header */}
      <header className="glass-panel shadow-lg rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Volver al inicio"
            >
              <ArrowLeft size={20} />
              <span>Volver al inicio</span>
            </button>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-gray-900 dark:text-white mb-2">Documentos médicos</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sube tus exámenes, recetas y otros documentos médicos para tenerlos siempre disponibles
          </p>
        </div>

        {/* Upload Form */}
        <div className="glass-panel rounded-2xl p-6 mb-8">
          <h2 className="text-gray-900 dark:text-white mb-4">Subir nuevo documento</h2>

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-start gap-2 text-green-800 dark:text-green-300">
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p>¡Documento subido exitosamente!</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-start gap-2 text-red-800 dark:text-red-300">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Input */}
            <div>
              <label htmlFor="file-input" className="block text-gray-700 dark:text-gray-300 mb-2">
                Selecciona tu archivo
              </label>
              <div className="relative">
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-input"
                  className="flex items-center justify-center gap-3 w-full px-4 py-8 glass-panel glass-muted border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer transition-transform hover:-translate-y-1"
                  style={{ borderStyle: 'dashed', borderWidth: 2 }}
                >
                  <Upload className="text-gray-400 dark:text-gray-500" size={32} />
                  <div className="text-center">
                    <p className="text-gray-700 dark:text-gray-300 mb-1">
                      Haz clic aquí para seleccionar un archivo
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      PDF, imágenes o documentos Word (máximo 10 MB)
                    </p>
                  </div>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-3 glass-panel glass-cta rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                    <div>
                      <p className="text-gray-900 dark:text-white">{selectedFile.name}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      const fileInput = document.getElementById('file-input') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Quitar archivo"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Description Input */}
            <div>
              <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 mb-2">
                ¿Qué tipo de documento es?
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ejemplo: Resultado de examen de sangre, Receta médica, Radiografía..."
                disabled={uploading}
              />
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Esto te ayudará a encontrar el documento más fácilmente después
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="w-full glass-panel glass-cta text-blue-900 dark:text-white py-3 rounded-lg transition-transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Subiendo documento...</span>
                </>
              ) : (
                <>
                  <Upload size={20} />
                  <span>Subir documento</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Documents List */}
        <div className="glass-panel rounded-3xl p-6">
          <h2 className="text-gray-900 dark:text-white mb-4">Tus documentos guardados</h2>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto mb-4 text-gray-400 dark:text-gray-500" size={48} />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Aún no has subido ningún documento
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                Sube tus exámenes y recetas para tenerlos siempre disponibles
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 glass-panel glass-muted rounded-2xl transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-4xl">{getFileIcon(doc.fileType)}</div>
                      <div className="flex-1">
                        <h3 className="text-gray-900 dark:text-white mb-1">
                          {doc.description}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {doc.fileName}
                        </p>
                        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-500">
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>•</span>
                          <span>Subido el {formatDate(doc.uploadDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <a
                        href={doc.url}
                        download={doc.fileName}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        aria-label={`Descargar ${doc.description}`}
                        title="Descargar"
                      >
                        <Download size={20} />
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                        aria-label={`Eliminar ${doc.description}`}
                        title="Eliminar"
                      >
                        {deletingId === doc.id ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Box */}
        <div className="mt-8 glass-panel glass-cta rounded-2xl p-6">
          <p className="text-blue-900 dark:text-blue-300 mb-2">
            ¿Qué documentos puedes subir?
          </p>
          <ul className="text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
            <li>Resultados de exámenes de laboratorio</li>
            <li>Recetas médicas</li>
            <li>Radiografías o imágenes médicas</li>
            <li>Informes de consultas anteriores</li>
            <li>Certificados médicos</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Tu información está protegida y solo tú puedes acceder a ella
          </p>
        </div>
      </main>
    </div>
  );
}
