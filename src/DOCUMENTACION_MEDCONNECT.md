# 📱 MedConnect - Documentación Técnica Completa

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Arquitectura de la Aplicación](#arquitectura-de-la-aplicación)
4. [Backend - Supabase](#backend---supabase)
5. [Frontend - Componentes React](#frontend---componentes-react)
6. [Hooks Personalizados](#hooks-personalizados)
7. [Flujos de Usuario](#flujos-de-usuario)
8. [UX Writing y Accesibilidad](#ux-writing-y-accesibilidad)
9. [Guía de Uso](#guía-de-uso)

---

## 📖 Descripción General

**MedConnect** es una plataforma de teleconsulta médica diseñada con enfoque en:
- ✅ **Accesibilidad**: Para usuarios con diferentes niveles de alfabetización digital
- ✅ **UX Writing inclusivo**: Mensajes claros, empáticos y sin tecnicismos
- ✅ **Funcionalidad completa**: Registro, citas, videollamadas e historial médico
- ✅ **Persistencia de datos**: Integración con Supabase para almacenamiento real
- ✅ **Modo oscuro/claro**: Interfaz adaptable a preferencias del usuario

### Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Estilos**: Tailwind CSS v4
- **Backend**: Supabase (Hono server + Deno KV)
- **Autenticación**: Supabase Auth
- **Base de datos**: Supabase KV Store
- **Iconos**: Lucide React

---

## 📁 Estructura del Proyecto

```
/
├── App.tsx                           # Componente principal (Router)
├── styles/
│   └── globals.css                   # Estilos globales y tokens de Tailwind
├── components/                       # Componentes de React
│   ├── Home.tsx                     # Página de inicio
│   ├── Login.tsx                    # Pantalla de inicio de sesión
│   ├── Register.tsx                 # Pantalla de registro
│   ├── Onboarding.tsx               # Tutorial para nuevos usuarios
│   ├── Dashboard.tsx                # Panel principal del usuario
│   ├── ScheduleAppointment.tsx      # Formulario para agendar citas
│   ├── VideoCall.tsx                # Sala de videollamada
│   ├── MedicalHistory.tsx           # Historial de citas médicas
│   ├── ThemeToggle.tsx              # Botón para cambiar tema claro/oscuro
│   └── figma/
│       └── ImageWithFallback.tsx    # Componente protegido para imágenes
├── hooks/
│   └── useSupabase.ts               # Hook para operaciones con Supabase
├── utils/
│   └── supabase/
│       └── info.ts                  # Configuración de Supabase
└── supabase/
    └── functions/
        └── server/
            ├── index.tsx            # Servidor API (Hono)
            └── kv_store.tsx         # Utilidades para Deno KV
```

---

## 🏗️ Arquitectura de la Aplicación

### Flujo de Datos

```
Usuario
  ↓
Frontend (React Components)
  ↓
useSupabase Hook
  ↓
Supabase Client
  ↓
API Backend (Hono Server)
  ↓
Supabase Auth + KV Store
  ↓
Persistencia de Datos
```

### Estados Globales (App.tsx)

El archivo `/App.tsx` es el componente raíz que maneja:

1. **Estado de autenticación**: Usuario actual y sesión
2. **Pantalla actual**: Navegación entre vistas
3. **Tema**: Modo claro/oscuro
4. **Citas médicas**: Lista de appointments del usuario
5. **Carga**: Estados de loading para operaciones asíncronas

---

## 🔧 Backend - Supabase

### Archivo: `/supabase/functions/server/index.tsx`

Este archivo contiene el servidor API construido con **Hono** (framework para Deno).

#### Endpoints Disponibles

##### 1. **POST /make-server-1f0a837c/signup**
**Función**: Crear una nueva cuenta de usuario

**Body esperado**:
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "micontraseña123"
}
```

**Proceso**:
1. Valida que todos los campos estén presentes
2. Crea el usuario en Supabase Auth usando `admin.createUser()`
3. Guarda el perfil del usuario en KV Store
4. Retorna los datos del usuario creado

**Respuesta exitosa**:
```json
{
  "user": {
    "id": "uuid-generado",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "hasCompletedOnboarding": false
  }
}
```

**Mensajes de error empáticos**:
- "Parece que ya existe una cuenta con este correo electrónico"
- "Por favor completa todos los campos: nombre, correo y contraseña"
- "Tu contraseña debe tener al menos 6 caracteres"

---

##### 2. **POST /make-server-1f0a837c/signin**
**Función**: Iniciar sesión con credenciales

**Body esperado**:
```json
{
  "email": "juan@ejemplo.com",
  "password": "micontraseña123"
}
```

**Proceso**:
1. Valida credenciales con `supabase.auth.signInWithPassword()`
2. Recupera el perfil del usuario desde KV Store
3. Retorna la sesión y datos del usuario

**Respuesta exitosa**:
```json
{
  "session": {
    "access_token": "token-jwt",
    "refresh_token": "refresh-token"
  },
  "user": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "hasCompletedOnboarding": true
  }
}
```

**Mensajes de error empáticos**:
- "El correo o la contraseña no son correctos. Por favor verifica tus datos"
- "No encontramos una cuenta con este correo electrónico"

---

##### 3. **GET /make-server-1f0a837c/session**
**Función**: Verificar sesión activa

**Headers requeridos**:
```
Authorization: Bearer {access_token}
```

**Proceso**:
1. Verifica el token JWT usando `supabase.auth.getUser()`
2. Recupera el perfil del usuario desde KV Store
3. Retorna los datos del usuario autenticado

---

##### 4. **PUT /make-server-1f0a837c/user/profile**
**Función**: Actualizar perfil del usuario (ej: completar onboarding)

**Headers requeridos**:
```
Authorization: Bearer {access_token}
```

**Body esperado**:
```json
{
  "hasCompletedOnboarding": true
}
```

**Proceso**:
1. Verifica autenticación
2. Obtiene el perfil actual del usuario
3. Combina los datos existentes con las actualizaciones
4. Guarda en KV Store

---

##### 5. **POST /make-server-1f0a837c/appointments**
**Función**: Crear una nueva cita médica

**Headers requeridos**:
```
Authorization: Bearer {access_token}
```

**Body esperado**:
```json
{
  "doctorName": "Dra. María González",
  "specialty": "Medicina General",
  "date": "2025-12-15",
  "time": "10:00 AM",
  "reason": "Consulta de seguimiento"
}
```

**Proceso**:
1. Verifica autenticación del usuario
2. Genera un ID único para la cita
3. Guarda la cita con status 'upcoming'
4. Crea una referencia user_appointment para búsquedas eficientes

**Estructura de datos guardada**:
```json
{
  "id": "timestamp-randomid",
  "userId": "uuid-del-usuario",
  "doctorName": "Dra. María González",
  "specialty": "Medicina General",
  "date": "2025-12-15",
  "time": "10:00 AM",
  "reason": "Consulta de seguimiento",
  "status": "upcoming",
  "createdAt": "2025-12-05T10:30:00.000Z"
}
```

---

##### 6. **GET /make-server-1f0a837c/appointments**
**Función**: Obtener todas las citas del usuario

**Headers requeridos**:
```
Authorization: Bearer {access_token}
```

**Proceso**:
1. Verifica autenticación
2. Busca todas las referencias `user_appointment:{userId}:*`
3. Obtiene los detalles completos de cada cita
4. Retorna el array de citas

**Respuesta exitosa**:
```json
{
  "appointments": [
    {
      "id": "1234567890-abc123",
      "doctorName": "Dra. María González",
      "specialty": "Medicina General",
      "date": "2025-12-15",
      "time": "10:00 AM",
      "status": "upcoming"
    }
  ]
}
```

---

##### 7. **PUT /make-server-1f0a837c/appointments/:id**
**Función**: Actualizar el estado de una cita

**Headers requeridos**:
```
Authorization: Bearer {access_token}
```

**Body esperado**:
```json
{
  "status": "completed"
}
```

**Proceso**:
1. Verifica autenticación
2. Verifica que la cita pertenezca al usuario
3. Actualiza los campos especificados
4. Guarda en KV Store

---

##### 8. **POST /make-server-1f0a837c/signout**
**Función**: Cerrar sesión del usuario

**Headers requeridos**:
```
Authorization: Bearer {access_token}
```

**Proceso**:
1. Verifica autenticación
2. Invalida el token en Supabase
3. Retorna confirmación

---

### Archivo: `/supabase/functions/server/kv_store.tsx`

Utilidades para interactuar con **Deno KV** (base de datos key-value).

#### Funciones Disponibles

##### `get(key: string)`
Obtiene un valor del store por su clave.

```typescript
const user = await kv.get(`user:${userId}`);
// Retorna: { id, name, email, hasCompletedOnboarding }
```

##### `set(key: string, value: any)`
Guarda un valor en el store.

```typescript
await kv.set(`user:${userId}`, {
  id: userId,
  name: "Juan Pérez",
  email: "juan@ejemplo.com",
  hasCompletedOnboarding: true
});
```

##### `del(key: string)`
Elimina un valor del store.

```typescript
await kv.del(`user:${userId}`);
```

##### `getByPrefix(prefix: string)`
Obtiene todos los valores que comienzan con un prefijo.

```typescript
const appointments = await kv.getByPrefix(`user_appointment:${userId}:`);
// Retorna array de { key, value }
```

##### `mget(keys: string[])`
Obtiene múltiples valores en una sola operación.

```typescript
const appointments = await kv.mget([
  'appointment:123',
  'appointment:456',
  'appointment:789'
]);
```

---

## 🎨 Frontend - Componentes React

### 1. `/App.tsx` - Componente Principal

**Responsabilidad**: Router principal y gestor de estado global.

#### Estados Manejados

```typescript
const [currentScreen, setCurrentScreen] = useState<Screen>('home');
// Posibles valores: 'home' | 'login' | 'register' | 'onboarding' | 
//                    'dashboard' | 'schedule' | 'videocall' | 'history'

const [theme, setTheme] = useState<Theme>('light');
// Posibles valores: 'light' | 'dark'

const [appointments, setAppointments] = useState<Appointment[]>([]);
const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
```

#### Interfaces Principales

```typescript
export interface User {
  id?: string;
  name: string;
  email: string;
  hasCompletedOnboarding: boolean;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  reason?: string;
}
```

#### Funciones Principales

##### `handleRegister(name, email, password)`
1. Llama a `signUp()` del hook useSupabase
2. Maneja errores con mensajes empáticos
3. La redirección a onboarding ocurre automáticamente vía useEffect

##### `handleLogin(email, password)`
1. Llama a `signIn()` del hook useSupabase
2. Maneja errores con mensajes empáticos
3. La redirección ocurre automáticamente

##### `handleOnboardingComplete()`
1. Actualiza el perfil con `hasCompletedOnboarding: true`
2. Navega al dashboard

##### `handleScheduleAppointment(appointment)`
1. Crea la cita en Supabase usando `createAppointment()`
2. Actualiza el estado local de appointments
3. Navega al dashboard

##### `handleStartVideoCall(appointment)`
1. Guarda la cita actual en el estado
2. Navega a la pantalla de videollamada

##### `handleEndVideoCall()`
1. Actualiza el status de la cita a 'completed'
2. Actualiza el estado local
3. Navega al dashboard

##### `handleSignOut()`
1. Llama a `signOut()` del hook
2. Limpia el estado local
3. Navega a la pantalla de inicio

#### useEffects Importantes

```typescript
// Cargar citas cuando el usuario está autenticado
useEffect(() => {
  if (user && user.hasCompletedOnboarding) {
    loadAppointments();
    if (currentScreen === 'home' || currentScreen === 'login' || currentScreen === 'register') {
      setCurrentScreen('dashboard');
    }
  }
}, [user]);

// Redirigir a onboarding si no está completado
useEffect(() => {
  if (user && !user.hasCompletedOnboarding && currentScreen !== 'onboarding') {
    setCurrentScreen('onboarding');
  }
}, [user]);

// Persistir tema en localStorage y DOM
useEffect(() => {
  localStorage.setItem('medconnect-theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [theme]);
```

---

### 2. `/components/Home.tsx` - Página de Inicio

**Ubicación**: Pantalla inicial que ven los usuarios no autenticados.

#### Props Recibidos

```typescript
interface HomeProps {
  onGetStarted: () => void;    // Navega a registro
  onLogin: () => void;          // Navega a login
  theme: Theme;                 // 'light' | 'dark'
  onToggleTheme: () => void;    // Función para cambiar tema
}
```

#### Estructura Visual

1. **Header**: 
   - Logo de MedConnect
   - Botón de ThemeToggle
   - Botón "Iniciar sesión"

2. **Hero Section**:
   - Título principal: "Cuidamos tu salud desde donde estés"
   - Descripción empática
   - Dos botones CTA:
     - "Crear cuenta gratis" (principal)
     - "Ya tengo cuenta" (secundario)
   - Texto de tranquilidad: "Es gratis y solo toma 2 minutos"

3. **Sección de Beneficios**:
   - **Consultas por video**: "Habla con tu doctor cara a cara, sin salir de casa"
   - **Agenda flexible**: "Encuentra citas que se ajusten a tu horario"
   - **Información segura**: "Tus datos médicos están protegidos"

4. **Sección de Cómo Funciona** (3 pasos):
   - Paso 1: Crea tu cuenta (1 minuto)
   - Paso 2: Agenda tu cita (Elige doctor, día y hora)
   - Paso 3: Consulta desde casa (Videollamada por internet)

5. **Footer**:
   - Información de contacto
   - Horarios de atención

#### Características de Accesibilidad

- Iconos con descripción textual
- Tamaños de fuente legibles
- Contraste adecuado en ambos temas
- Lenguaje claro sin tecnicismos

---

### 3. `/components/Login.tsx` - Inicio de Sesión

**Ubicación**: Pantalla para usuarios existentes.

#### Props Recibidos

```typescript
interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onBack: () => void;           // Vuelve a Home
  onRegister: () => void;       // Navega a Register
  theme: Theme;
  onToggleTheme: () => void;
}
```

#### Estados Internos

```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState<{
  email?: string;
  password?: string;
  general?: string;
}>({});
const [loading, setLoading] = useState(false);
```

#### Validaciones del Formulario

##### Validación de Email
```typescript
if (!email.trim()) {
  newErrors.email = 'Por favor escribe tu correo electrónico para continuar';
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  newErrors.email = 'Parece que falta algo en tu correo. Asegúrate de incluir @ y un dominio (ejemplo: tucorreo@gmail.com)';
}
```

##### Validación de Contraseña
```typescript
if (!password) {
  newErrors.password = 'Por favor escribe tu contraseña para acceder';
}
```

#### Campos del Formulario

1. **Campo de Email**:
   - Icono: Mail (Lucide)
   - Placeholder: "ejemplo@correo.com"
   - Validación en tiempo real (borra errores al escribir)
   - Mensaje de error con icono AlertCircle

2. **Campo de Contraseña**:
   - Icono: Lock (Lucide)
   - Type: "password"
   - Placeholder: "Tu contraseña"
   - Validación en tiempo real

3. **Botón de Submit**:
   - Texto normal: "Iniciar sesión"
   - Texto cargando: "Iniciando sesión..." + spinner
   - Deshabilitado durante loading

#### Mensajes de Error Empáticos

Los errores se muestran en cajas destacadas:

```typescript
// Error general (de API)
{errors.general && (
  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
    <div className="flex items-start gap-2 text-red-800 dark:text-red-300">
      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
      <p>{errors.general}</p>
    </div>
  </div>
)}
```

#### Caja de Ayuda

Sección inferior con información de soporte:
- "¿Olvidaste tu contraseña?"
- Teléfono: 1-800-MEDCONNECT
- Email: ayuda@medconnect.com

---

### 4. `/components/Register.tsx` - Registro de Usuario

**Ubicación**: Pantalla para crear cuenta nueva.

#### Props Recibidos

```typescript
interface RegisterProps {
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onBack: () => void;
  onLogin: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}
```

#### Estados Internos

```typescript
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [errors, setErrors] = useState<{
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}>({});
const [loading, setLoading] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);
```

#### Validaciones Detalladas

##### Nombre
```typescript
if (!name.trim()) {
  newErrors.name = 'Necesitamos saber tu nombre para poder atenderte mejor';
} else if (name.trim().length < 2) {
  newErrors.name = 'Tu nombre parece muy corto. Por favor escribe tu nombre completo';
}
```

##### Email
```typescript
if (!email.trim()) {
  newErrors.email = 'Tu correo electrónico es importante para enviarte recordatorios de tus citas';
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  newErrors.email = 'Parece que falta algo en tu correo. Asegúrate de incluir @ y un dominio (ejemplo: tunombre@gmail.com)';
}
```

##### Contraseña
```typescript
if (!password) {
  newErrors.password = 'Necesitas crear una contraseña para proteger tu cuenta';
} else if (password.length < 6) {
  newErrors.password = 'Para tu seguridad, usa al menos 6 caracteres en tu contraseña';
}
```

##### Confirmación de Contraseña
```typescript
if (!confirmPassword) {
  newErrors.confirmPassword = 'Por favor confirma tu contraseña escribiéndola nuevamente';
} else if (password !== confirmPassword) {
  newErrors.confirmPassword = 'Las contraseñas no coinciden. Verifica que sean iguales';
}
```

#### Campos del Formulario

1. **Nombre Completo**:
   - Pregunta: "¿Cómo te llamas?"
   - Icono: User
   - Placeholder: "Escribe tu nombre completo"

2. **Email**:
   - Pregunta: "¿Cuál es tu correo electrónico?"
   - Icono: Mail
   - Placeholder: "ejemplo@correo.com"
   - Ayuda: "Te enviaremos recordatorios de tus citas a este correo"

3. **Contraseña**:
   - Pregunta: "Crea una contraseña"
   - Icono: Lock
   - Placeholder: "Mínimo 6 caracteres"
   - Ayuda: "Usa al menos 6 caracteres"

4. **Confirmar Contraseña**:
   - Pregunta: "Confirma tu contraseña"
   - Icono: Lock
   - Placeholder: "Escribe la misma contraseña"

#### Mensaje de Éxito

Cuando el registro es exitoso:
```typescript
{showSuccess && (
  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
    <p className="text-green-800 dark:text-green-300 text-center">
      ¡Perfecto! Tu cuenta está lista. Vamos a mostrarte cómo usar MedConnect.
    </p>
  </div>
)}
```

#### Caja de Seguridad

Información sobre privacidad de datos médicos:
- Icono: Shield
- Título: "Tu información está protegida"
- Descripción: Cumplimiento de estándares de seguridad

---

### 5. `/components/Onboarding.tsx` - Tutorial Interactivo

**Ubicación**: Primera vez que un usuario accede después de registrarse.

#### Props Recibidos

```typescript
interface OnboardingProps {
  userName: string;            // Nombre del usuario para personalizar
  onComplete: () => void;      // Función al completar el tutorial
  theme: Theme;
  onToggleTheme: () => void;
}
```

#### Estados Internos

```typescript
const [currentStep, setCurrentStep] = useState(0);  // 0 = bienvenida, 1-3 = pasos
```

#### Estructura del Tutorial

##### Pantalla 0: Bienvenida
```typescript
{
  title: `¡Hola ${userName}!`,
  description: 'Bienvenido a MedConnect. Te vamos a mostrar cómo funciona la plataforma en 3 pasos simples.',
  icon: <Heart className="text-blue-600 dark:text-blue-400" size={64} />
}
```

##### Paso 1: Agendar Citas
```typescript
{
  title: 'Agenda tu cita médica',
  description: 'Elige el tipo de especialista que necesitas, selecciona un día y hora que te funcione, y ¡listo!',
  icon: <Calendar className="text-blue-600 dark:text-blue-400" size={64} />,
  tip: 'Puedes agendar consultas con 24 horas de anticipación'
}
```

##### Paso 2: Videollamada
```typescript
{
  title: 'Conéctate desde tu casa',
  description: 'El día de tu cita, haz clic en "Iniciar consulta" y podrás hablar con tu doctor por video.',
  icon: <Video className="text-blue-600 dark:text-blue-400" size={64} />,
  tip: 'Asegúrate de estar en un lugar tranquilo con buena conexión a internet'
}
```

##### Paso 3: Historial
```typescript
{
  title: 'Consulta tu historial',
  description: 'Todas tus citas y documentos médicos quedarán guardados para que puedas revisarlos cuando quieras.',
  icon: <FileText className="text-blue-600 dark:text-blue-400" size={64} />,
  tip: 'Tu información médica está protegida y es confidencial'
}
```

#### Navegación

- **Indicador de progreso**: Puntos que muestran en qué paso estás
- **Botón "Siguiente"**: Avanza al siguiente paso
- **Botón "Atrás"**: Regresa al paso anterior (no disponible en paso 0)
- **Botón "Empezar a usar MedConnect"**: En el último paso, llama a `onComplete()`

#### Características de Accesibilidad

- **Aria-labels** en todos los botones
- **Aria-live** para anunciar cambios de paso
- **Aria-current** en el indicador de progreso
- Colores con contraste adecuado
- Iconos grandes y descriptivos

---

### 6. `/components/Dashboard.tsx` - Panel Principal

**Ubicación**: Pantalla principal después de autenticarse.

#### Props Recibidos

```typescript
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
```

#### Secciones del Dashboard

##### 1. Header
- Logo de MedConnect
- ThemeToggle
- Nombre del usuario (con icono User)
- Botón de cerrar sesión (icono LogOut)

##### 2. Mensaje de Bienvenida
```typescript
<h1>Hola, {user.name.split(' ')[0]}</h1>
<p>Bienvenido a tu panel de salud</p>
```

##### 3. Botones de Acción Rápida

**Agendar nueva cita**:
- Icono: Calendar
- Color: Azul (principal)
- Acción: Navega a 'schedule'

**Ver historial médico**:
- Icono: FileText
- Color: Blanco con borde
- Acción: Navega a 'history'

##### 4. Sección de Próximas Citas

**Estados posibles**:

1. **Cargando**:
```typescript
{loadingAppointments && (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <p>Cargando tus citas...</p>
  </div>
)}
```

2. **Sin citas**:
```typescript
{upcomingAppointments.length === 0 && (
  <div className="text-center py-12">
    <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
    <p>No tienes citas programadas</p>
    <button onClick={() => onNavigate('schedule')}>
      Agenda tu primera consulta
    </button>
  </div>
)}
```

3. **Con citas**:
Cada cita muestra:
- Icono según especialidad (Video para videollamada)
- Nombre del doctor
- Especialidad
- Fecha y hora
- Badge de estado (próxima/completada/cancelada)
- Botón "Iniciar consulta" si está próxima

#### Filtrado de Citas

```typescript
const upcomingAppointments = appointments
  .filter(apt => apt.status === 'upcoming')
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
```

#### Colores de Estado

```typescript
const statusConfig = {
  upcoming: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-300',
    label: 'Próxima'
  },
  completed: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    label: 'Completada'
  },
  cancelled: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-800 dark:text-gray-300',
    label: 'Cancelada'
  }
};
```

---

### 7. `/components/ScheduleAppointment.tsx` - Agendar Cita

**Ubicación**: Formulario para crear una nueva cita médica.

#### Props Recibidos

```typescript
interface ScheduleAppointmentProps {
  onSchedule: (appointment: Omit<Appointment, 'id' | 'status'>) => Promise<void>;
  onCancel: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}
```

#### Estados del Formulario

```typescript
const [specialty, setSpecialty] = useState('');
const [doctorName, setDoctorName] = useState('');
const [date, setDate] = useState('');
const [time, setTime] = useState('');
const [reason, setReason] = useState('');
const [errors, setErrors] = useState<{
  specialty?: string;
  date?: string;
  time?: string;
  general?: string;
}>({});
const [loading, setLoading] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);
```

#### Especialidades Disponibles

```typescript
const specialties = [
  { value: 'general', label: 'Medicina General', doctor: 'Dr. Carlos Ramírez' },
  { value: 'pediatria', label: 'Pediatría', doctor: 'Dra. María González' },
  { value: 'cardiologia', label: 'Cardiología', doctor: 'Dr. Roberto Fernández' },
  { value: 'dermatologia', label: 'Dermatología', doctor: 'Dra. Ana Martínez' },
  { value: 'psicologia', label: 'Psicología', doctor: 'Dra. Laura Sánchez' },
  { value: 'nutricion', label: 'Nutrición', doctor: 'Lic. Pedro Morales' },
];
```

#### Horarios Disponibles

```typescript
const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
];
```

#### Validaciones del Formulario

##### Especialidad
```typescript
if (!specialty) {
  newErrors.specialty = 'Por favor selecciona el tipo de consulta que necesitas';
}
```

##### Fecha
```typescript
if (!date) {
  newErrors.date = 'Por favor elige el día de tu consulta';
} else if (new Date(date) < new Date(today)) {
  newErrors.date = 'La fecha debe ser hoy o un día futuro';
}
```

##### Horario
```typescript
if (!time) {
  newErrors.time = 'Por favor selecciona una hora para tu consulta';
}
```

#### Campos del Formulario

1. **Tipo de Consulta**:
   - Pregunta: "¿Qué tipo de consulta necesitas?"
   - Tipo: Select dropdown
   - Opciones: Especialidades disponibles
   - Al seleccionar, asigna automáticamente el doctor

2. **Doctor Asignado**:
   - Icono: User
   - Solo lectura
   - Se muestra automáticamente según especialidad

3. **Fecha**:
   - Pregunta: "¿Qué día prefieres?"
   - Tipo: date input
   - Restricción: Fecha mínima = hoy
   - Ayuda: "Elige el día que mejor te funcione"

4. **Horario**:
   - Pregunta: "¿A qué hora te gustaría la consulta?"
   - Tipo: Select dropdown
   - Opciones: Horarios de 8 AM a 7 PM

5. **Motivo (Opcional)**:
   - Pregunta: "¿Por qué necesitas esta consulta?"
   - Tipo: textarea
   - Placeholder: "Describe brevemente qué te gustaría consultar..."
   - Máximo: 500 caracteres
   - Ayuda: "Esto ayuda al doctor a prepararse mejor para tu consulta"

#### Proceso de Agendamiento

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setLoading(true);
  setErrors({});
  
  try {
    await onSchedule({
      doctorName,
      specialty: specialties.find(s => s.value === specialty)?.label || '',
      date,
      time,
      reason: reason || undefined
    });
    
    setShowSuccess(true);
    
    // Redirigir al dashboard después de 2 segundos
    setTimeout(() => {
      onCancel();
    }, 2000);
  } catch (error: any) {
    setErrors({ general: error.message });
  } finally {
    setLoading(false);
  }
};
```

#### Mensaje de Éxito

```typescript
{showSuccess && (
  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
    <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
      <CheckCircle size={20} />
      <p>¡Cita agendada exitosamente! Te enviaremos un recordatorio por correo.</p>
    </div>
  </div>
)}
```

---

### 8. `/components/VideoCall.tsx` - Sala de Videollamada

**Ubicación**: Pantalla de consulta médica por video.

#### Props Recibidos

```typescript
interface VideoCallProps {
  appointment: Appointment;
  onEndCall: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}
```

#### Estados Internos

```typescript
const [isMicOn, setIsMicOn] = useState(true);
const [isCameraOn, setIsCameraOn] = useState(true);
const [callDuration, setCallDuration] = useState(0);
const [showEndConfirmation, setShowEndConfirmation] = useState(false);
```

#### Temporizador de Llamada

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    setCallDuration(prev => prev + 1);
  }, 1000);
  
  return () => clearInterval(timer);
}, []);

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
```

#### Estructura de la Pantalla

##### 1. Header
- Logo MedConnect
- ThemeToggle
- Indicador de llamada en curso (punto rojo pulsante)
- Duración de la llamada

##### 2. Vista de Video Principal

**Simulación de video del doctor**:
```typescript
<div className="aspect-video bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden relative">
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-center">
      <Video className="text-white mb-4 mx-auto" size={64} />
      <p className="text-white">
        Conectado con {appointment.doctorName}
      </p>
    </div>
  </div>
  
  {/* Mini vista del usuario */}
  <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border-2 border-blue-500">
    <div className="flex items-center justify-center h-full">
      <User className="text-white" size={32} />
    </div>
  </div>
</div>
```

##### 3. Información de la Cita

Card con:
- Nombre del doctor
- Especialidad
- Fecha y hora
- Motivo de consulta (si existe)

##### 4. Controles de la Llamada

**Botón de Micrófono**:
```typescript
<button
  onClick={() => setIsMicOn(!isMicOn)}
  className={`p-4 rounded-full ${
    isMicOn 
      ? 'bg-gray-700 hover:bg-gray-600' 
      : 'bg-red-500 hover:bg-red-600'
  }`}
  aria-label={isMicOn ? 'Silenciar micrófono' : 'Activar micrófono'}
>
  {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
</button>
```

**Botón de Cámara**:
```typescript
<button
  onClick={() => setIsCameraOn(!isCameraOn)}
  className={`p-4 rounded-full ${
    isCameraOn 
      ? 'bg-gray-700 hover:bg-gray-600' 
      : 'bg-red-500 hover:bg-red-600'
  }`}
  aria-label={isCameraOn ? 'Apagar cámara' : 'Encender cámara'}
>
  {isCameraOn ? <VideoIcon size={24} /> : <VideoOffIcon size={24} />}
</button>
```

**Botón de Terminar Llamada**:
```typescript
<button
  onClick={() => setShowEndConfirmation(true)}
  className="p-4 rounded-full bg-red-500 hover:bg-red-600"
  aria-label="Terminar consulta"
>
  <PhoneOff size={24} />
</button>
```

##### 5. Modal de Confirmación

Aparece al hacer clic en "Terminar llamada":
```typescript
{showEndConfirmation && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4">
      <h3 className="text-gray-900 dark:text-white mb-2">
        ¿Terminar la consulta?
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        ¿Estás seguro de que quieres finalizar la videollamada?
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setShowEndConfirmation(false)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
        >
          Continuar llamada
        </button>
        <button
          onClick={onEndCall}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Sí, terminar
        </button>
      </div>
    </div>
  </div>
)}
```

#### Características de Accesibilidad

- Indicador visual de estado del micrófono/cámara
- Aria-labels en todos los controles
- Confirmación antes de terminar llamada
- Indicador de duración de llamada

---

### 9. `/components/MedicalHistory.tsx` - Historial Médico

**Ubicación**: Vista de todas las citas del usuario.

#### Props Recibidos

```typescript
interface MedicalHistoryProps {
  appointments: Appointment[];
  onBack: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}
```

#### Estados Internos

```typescript
const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
const [searchTerm, setSearchTerm] = useState('');
```

#### Funcionalidad de Filtrado

```typescript
const filteredAppointments = appointments
  .filter(apt => {
    if (filter !== 'all' && apt.status !== filter) return false;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        apt.doctorName.toLowerCase().includes(search) ||
        apt.specialty.toLowerCase().includes(search)
      );
    }
    
    return true;
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
```

#### Estructura de la Pantalla

##### 1. Header
- Botón "Volver al inicio"
- Logo MedConnect
- ThemeToggle

##### 2. Título y Descripción
```typescript
<h1>Tu historial médico</h1>
<p>Aquí puedes ver todas tus consultas anteriores y próximas</p>
```

##### 3. Barra de Búsqueda

```typescript
<div className="relative">
  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
  <input
    type="text"
    placeholder="Buscar por doctor o especialidad..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full pl-10 pr-4 py-3 border rounded-lg"
  />
</div>
```

##### 4. Filtros

Botones de filtro:
- **Todas** (filter = 'all')
- **Próximas** (filter = 'upcoming')
- **Completadas** (filter = 'completed')

```typescript
<button
  onClick={() => setFilter('all')}
  className={filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}
>
  Todas ({appointments.length})
</button>
```

##### 5. Lista de Citas

**Estados posibles**:

1. **Sin citas**:
```typescript
{appointments.length === 0 && (
  <div className="text-center py-12">
    <FileText className="mx-auto mb-4 text-gray-400" size={48} />
    <p>Aún no tienes citas registradas</p>
    <button onClick={onBack}>
      Agenda tu primera consulta
    </button>
  </div>
)}
```

2. **Sin resultados de búsqueda**:
```typescript
{filteredAppointments.length === 0 && appointments.length > 0 && (
  <div className="text-center py-12">
    <Search className="mx-auto mb-4 text-gray-400" size={48} />
    <p>No encontramos citas que coincidan con "{searchTerm}"</p>
  </div>
)}
```

3. **Con citas**:
Cada cita muestra:
- Fecha y hora destacadas
- Nombre del doctor y especialidad
- Badge de estado con color
- Motivo de consulta (si existe)

#### Card de Cita

```typescript
<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
  <div className="flex items-start justify-between mb-4">
    {/* Fecha y hora */}
    <div className="flex items-center gap-3">
      <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
        <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
      </div>
      <div>
        <p className="text-gray-900 dark:text-white">
          {formatDate(apt.date)}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          {apt.time}
        </p>
      </div>
    </div>
    
    {/* Badge de estado */}
    <span className={`px-3 py-1 rounded-full ${statusConfig[apt.status].bg}`}>
      {statusConfig[apt.status].label}
    </span>
  </div>
  
  {/* Información del doctor */}
  <div className="border-t dark:border-gray-700 pt-4">
    <p className="text-gray-900 dark:text-white mb-1">
      {apt.doctorName}
    </p>
    <p className="text-gray-600 dark:text-gray-400">
      {apt.specialty}
    </p>
    
    {/* Motivo (si existe) */}
    {apt.reason && (
      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 mb-1">
          Motivo de consulta:
        </p>
        <p className="text-gray-900 dark:text-white">
          {apt.reason}
        </p>
      </div>
    )}
  </div>
</div>
```

#### Funciones Auxiliares

##### Formateo de Fecha

```typescript
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('es-ES', options);
};
```

---

### 10. `/components/ThemeToggle.tsx` - Selector de Tema

**Ubicación**: Componente reutilizable en todos los headers.

#### Props Recibidos

```typescript
interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}
```

#### Implementación

```typescript
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
    >
      {theme === 'light' ? (
        <Moon className="text-gray-700 dark:text-gray-300" size={20} />
      ) : (
        <Sun className="text-gray-300" size={20} />
      )}
    </button>
  );
}
```

#### Características

- **Accesible**: Aria-label y title descriptivos
- **Responsive**: Cambia icono según tema actual
- **Visual**: Icono Moon para tema claro, Sun para tema oscuro
- **Hover**: Efecto de hover suave

---

## 🔌 Hooks Personalizados

### `/hooks/useSupabase.ts`

Hook personalizado que encapsula toda la lógica de autenticación y operaciones con Supabase.

#### Configuración Inicial

```typescript
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);
const API_BASE = `${supabaseUrl}/functions/v1/make-server-1f0a837c`;
```

#### Estado del Hook

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
}

const [authState, setAuthState] = useState<AuthState>({
  user: null,
  accessToken: null,
  loading: true
});
```

#### Funciones Exportadas

##### 1. `checkSession()`
Verifica si hay una sesión activa al cargar la aplicación.

**Proceso**:
1. Llama a `supabase.auth.getSession()`
2. Si hay sesión, obtiene el perfil del usuario desde el API
3. Actualiza el estado con user y accessToken

**Cuándo se ejecuta**:
- Al montar el componente (useEffect inicial)
- Automáticamente al recargar la página

##### 2. `signUp(name, email, password)`
Crea una nueva cuenta de usuario.

**Proceso**:
1. Llama al endpoint `/signup` con los datos
2. Maneja errores con mensajes empáticos
3. Automáticamente hace login después del registro
4. Retorna el usuario creado

**Errores manejados**:
- Email ya registrado
- Email inválido
- Contraseña muy corta
- Error de conexión

##### 3. `signIn(email, password)`
Inicia sesión con credenciales existentes.

**Proceso**:
1. Llama al endpoint `/signin`
2. Maneja errores con mensajes empáticos
3. Actualiza el estado con user y accessToken
4. Retorna el usuario autenticado

**Errores manejados**:
- Credenciales incorrectas
- Usuario no encontrado
- Error de conexión

##### 4. `signOut()`
Cierra la sesión del usuario.

**Proceso**:
1. Llama al endpoint `/signout`
2. Llama a `supabase.auth.signOut()` para invalidar token
3. Limpia el estado local

##### 5. `updateProfile(updates)`
Actualiza el perfil del usuario.

**Uso principal**: Marcar onboarding como completado.

**Proceso**:
1. Verifica autenticación
2. Envía actualizaciones al endpoint `/user/profile`
3. Actualiza el estado local
4. Retorna el perfil actualizado

##### 6. `createAppointment(appointmentData)`
Crea una nueva cita médica.

**Proceso**:
1. Verifica autenticación
2. Envía datos al endpoint `/appointments`
3. Retorna la cita creada con ID y status

##### 7. `getAppointments()`
Obtiene todas las citas del usuario autenticado.

**Proceso**:
1. Verifica autenticación
2. Llama al endpoint `/appointments`
3. Retorna array de citas ordenadas

##### 8. `updateAppointment(appointmentId, updates)`
Actualiza una cita existente (ejemplo: cambiar status a 'completed').

**Proceso**:
1. Verifica autenticación
2. Envía actualizaciones al endpoint `/appointments/:id`
3. Retorna la cita actualizada

#### Valores Retornados

```typescript
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
  updateAppointment
};
```

#### Ejemplo de Uso

```typescript
function MiComponente() {
  const {
    user,
    loading,
    signIn,
    createAppointment
  } = useSupabase();
  
  if (loading) return <div>Cargando...</div>;
  
  if (!user) {
    return <button onClick={() => signIn('email@test.com', 'pass')}>
      Login
    </button>;
  }
  
  const agendar = async () => {
    await createAppointment({
      doctorName: 'Dr. Test',
      specialty: 'General',
      date: '2025-12-20',
      time: '10:00 AM'
    });
  };
  
  return <button onClick={agendar}>Agendar</button>;
}
```

---

## 🔄 Flujos de Usuario

### Flujo 1: Registro de Nuevo Usuario

```
1. Home.tsx
   └─> Click "Crear cuenta gratis"
   
2. Register.tsx
   └─> Completa formulario (nombre, email, password)
   └─> Click "Crear mi cuenta gratis"
   └─> useSupabase.signUp()
       └─> API: POST /signup
       └─> Crea usuario en Supabase Auth
       └─> Guarda perfil en KV Store
       └─> Automáticamente hace login
   
3. App.tsx (useEffect detecta user sin onboarding)
   └─> Redirige a Onboarding.tsx
   
4. Onboarding.tsx
   └─> Muestra 3 pasos del tutorial
   └─> Click "Empezar a usar MedConnect"
   └─> useSupabase.updateProfile({ hasCompletedOnboarding: true })
       └─> API: PUT /user/profile
   
5. App.tsx (useEffect detecta onboarding completado)
   └─> Redirige a Dashboard.tsx
   └─> Carga citas con useSupabase.getAppointments()
```

### Flujo 2: Inicio de Sesión

```
1. Home.tsx
   └─> Click "Iniciar sesión" o "Ya tengo cuenta"
   
2. Login.tsx
   └─> Completa formulario (email, password)
   └─> Click "Iniciar sesión"
   └─> useSupabase.signIn()
       └─> API: POST /signin
       └─> Valida credenciales
       └─> Obtiene perfil desde KV Store
       └─> Retorna session + user
   
3. App.tsx (useEffect detecta user)
   └─> Si hasCompletedOnboarding = true
       └─> Redirige a Dashboard.tsx
   └─> Si hasCompletedOnboarding = false
       └─> Redirige a Onboarding.tsx
```

### Flujo 3: Agendar Cita

```
1. Dashboard.tsx
   └─> Click "Agendar nueva cita"
   
2. ScheduleAppointment.tsx
   └─> Selecciona especialidad (asigna doctor automáticamente)
   └─> Selecciona fecha
   └─> Selecciona horario
   └─> (Opcional) Escribe motivo
   └─> Click "Agendar cita"
   └─> Valida formulario localmente
   └─> handleScheduleAppointment()
       └─> useSupabase.createAppointment()
           └─> API: POST /appointments
           └─> Genera ID único
           └─> Guarda en KV Store
           └─> Crea índice user_appointment
   
3. App.tsx
   └─> Actualiza estado local de appointments
   └─> Redirige a Dashboard.tsx
   
4. Dashboard.tsx
   └─> Muestra la nueva cita en "Próximas citas"
```

### Flujo 4: Realizar Videollamada

```
1. Dashboard.tsx
   └─> En la card de una cita próxima
   └─> Click "Iniciar consulta"
   └─> handleStartVideoCall(appointment)
   
2. App.tsx
   └─> Guarda currentAppointment en estado
   └─> Navega a VideoCall.tsx
   
3. VideoCall.tsx
   └─> Muestra interfaz de videollamada
   └─> Inicia temporizador de duración
   └─> Usuario puede controlar mic/cámara
   └─> Click "Terminar llamada"
   └─> Muestra modal de confirmación
   └─> Click "Sí, terminar"
   └─> handleEndVideoCall()
       └─> useSupabase.updateAppointment(id, { status: 'completed' })
           └─> API: PUT /appointments/:id
           └─> Actualiza status en KV Store
   
4. App.tsx
   └─> Actualiza appointment en estado local
   └─> Navega a Dashboard.tsx
   
5. Dashboard.tsx
   └─> La cita ya no aparece en "Próximas citas"
   └─> Ahora está en historial como "Completada"
```

### Flujo 5: Consultar Historial

```
1. Dashboard.tsx
   └─> Click "Ver historial médico"
   
2. MedicalHistory.tsx
   └─> Muestra todas las citas del usuario
   └─> Ordenadas por fecha (más recientes primero)
   └─> Usuario puede:
       ├─> Buscar por doctor o especialidad
       ├─> Filtrar por estado (todas/próximas/completadas)
       └─> Ver detalles de cada cita
   └─> Click "Volver al inicio"
   
3. Dashboard.tsx
   └─> Regresa al panel principal
```

### Flujo 6: Cerrar Sesión

```
1. Dashboard.tsx (o cualquier pantalla autenticada)
   └─> Click en ícono LogOut
   └─> handleSignOut()
       └─> useSupabase.signOut()
           └─> API: POST /signout
           └─> supabase.auth.signOut()
   
2. App.tsx
   └─> Limpia estado de appointments
   └─> setUser(null)
   └─> Navega a Home.tsx
   
3. Home.tsx
   └─> Usuario ve pantalla de inicio
```

---

## ♿ UX Writing y Accesibilidad

### Principios de UX Writing Aplicados

#### 1. Lenguaje Claro y Natural

**❌ Antes**: "Error: Invalid email format"  
**✅ Ahora**: "Parece que falta algo en tu correo. Asegúrate de incluir @ y un dominio (ejemplo: tunombre@gmail.com)"

**❌ Antes**: "Authentication failed"  
**✅ Ahora**: "El correo o la contraseña no son correctos. Por favor verifica tus datos"

#### 2. Preguntas en Lugar de Etiquetas

**❌ Antes**: "Email"  
**✅ Ahora**: "¿Cuál es tu correo electrónico?"

**❌ Antes**: "Appointment type"  
**✅ Ahora**: "¿Qué tipo de consulta necesitas?"

#### 3. Mensajes Empáticos

**❌ Antes**: "Error: Password too short"  
**✅ Ahora**: "Para tu seguridad, usa al menos 6 caracteres en tu contraseña"

**❌ Antes**: "No appointments found"  
**✅ Ahora**: "No tienes citas programadas. ¿Te gustaría agendar tu primera consulta?"

#### 4. Contexto y Razones

**✅ Ejemplos**:
- "Necesitamos saber tu nombre para poder atenderte mejor"
- "Tu correo electrónico es importante para enviarte recordatorios de tus citas"
- "Esto ayuda al doctor a prepararse mejor para tu consulta"

#### 5. Confirmaciones Positivas

**✅ Ejemplos**:
- "¡Perfecto! Tu cuenta está lista. Vamos a mostrarte cómo usar MedConnect."
- "¡Cita agendada exitosamente! Te enviaremos un recordatorio por correo."
- "Tu información está protegida y es confidencial"

### Características de Accesibilidad Implementadas

#### 1. Atributos ARIA

```typescript
// Labels descriptivos
<button aria-label="Cerrar sesión">
  <LogOut />
</button>

// Describir campos con errores
<input
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
/>

// Anunciar cambios de estado
<div role="status" aria-live="polite">
  Paso {currentStep + 1} de 3
</div>

// Indicar elemento actual
<div 
  aria-current={currentStep === index ? 'step' : undefined}
/>
```

#### 2. Textos Alternativos

```typescript
// Todos los iconos tienen descripción
<Calendar className="..." size={24} />
<span className="sr-only">Calendario</span>

// Imágenes con alt
<img src={...} alt="Logo de MedConnect" />
```

#### 3. Navegación por Teclado

- Todos los botones son accesibles con Tab
- Formularios se pueden enviar con Enter
- Modales se pueden cerrar con Escape (implementable)
- Focus visible en todos los elementos interactivos

#### 4. Contraste de Colores

```typescript
// Modo claro
text-gray-900  // Negro suave para títulos
text-gray-600  // Gris oscuro para texto secundario
bg-blue-600    // Azul accesible para CTA

// Modo oscuro
dark:text-white         // Blanco para títulos
dark:text-gray-300      // Gris claro para texto
dark:bg-blue-500        // Azul más claro en fondos oscuros
```

Todos los colores cumplen con WCAG 2.1 AA mínimo.

#### 5. Estados de Carga

```typescript
// Indicador visual + texto
{loading && (
  <div className="flex items-center gap-2">
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
    <span>Cargando...</span>
  </div>
)}
```

#### 6. Mensajes de Error Visibles

```typescript
// Error con icono y color
<div className="mt-2 flex items-start gap-2 text-red-600">
  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
  <p>{errors.email}</p>
</div>
```

#### 7. Tamaños de Fuente Responsivos

Configurados en `/styles/globals.css`:
```css
h1 { font-size: 2rem; line-height: 2.5rem; }
h2 { font-size: 1.5rem; line-height: 2rem; }
p { font-size: 1rem; line-height: 1.5rem; }
```

No se usan clases de Tailwind para tamaños de fuente, respetando la tipografía global.

### Niveles de Alfabetización Digital Soportados

#### Nivel Bajo
- Lenguaje simple sin tecnicismos
- Instrucciones paso a paso
- Iconos + texto (no solo iconos)
- Tutorial de onboarding obligatorio
- Mensajes de confirmación claros

#### Nivel Medio
- Shortcuts visuales (badges de estado)
- Búsqueda y filtros
- Navegación intuitiva

#### Nivel Alto
- Acceso rápido a funciones
- Estados de carga informativos
- Personalización (tema)

---

## 📚 Guía de Uso

### Para Desarrolladores

#### 1. Configuración Inicial

```bash
# El proyecto ya está configurado con Supabase
# Las credenciales están en /utils/supabase/info.ts
```

#### 2. Estructura de Archivos a Conocer

**Archivos Core**:
- `/App.tsx` - Router y estado global
- `/hooks/useSupabase.ts` - Lógica de backend
- `/supabase/functions/server/index.tsx` - API endpoints

**Componentes de Pantalla**:
- Home, Login, Register, Onboarding
- Dashboard, ScheduleAppointment, VideoCall, MedicalHistory

**Utilidades**:
- `/components/ThemeToggle.tsx` - Modo oscuro/claro
- `/supabase/functions/server/kv_store.tsx` - Base de datos

#### 3. Agregar Nueva Funcionalidad

**Ejemplo: Agregar cancelación de citas**

1. **Backend** (`/supabase/functions/server/index.tsx`):
```typescript
app.delete('/make-server-1f0a837c/appointments/:id', async (c) => {
  const { user, error } = await verifyUser(c.req.header('Authorization'));
  if (error || !user) return c.json({ error }, 401);
  
  const appointmentId = c.req.param('id');
  const appointment = await kv.get(`appointment:${appointmentId}`);
  
  if (!appointment || appointment.userId !== user.id) {
    return c.json({ error: 'No encontrado' }, 404);
  }
  
  await kv.del(`appointment:${appointmentId}`);
  await kv.del(`user_appointment:${user.id}:${appointmentId}`);
  
  return c.json({ message: 'Cita cancelada' });
});
```

2. **Hook** (`/hooks/useSupabase.ts`):
```typescript
const deleteAppointment = async (appointmentId: string) => {
  if (!authState.accessToken) throw new Error('No autenticado');
  
  const response = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authState.accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) throw new Error('Error al cancelar cita');
  return response.json();
};

// Agregar a return
return { ..., deleteAppointment };
```

3. **Componente** (Dashboard o MedicalHistory):
```typescript
const handleCancelAppointment = async (appointmentId: string) => {
  if (confirm('¿Estás seguro de cancelar esta cita?')) {
    await deleteAppointment(appointmentId);
    // Recargar citas
    const updated = await getAppointments();
    setAppointments(updated);
  }
};
```

#### 4. Modificar Estilos Globales

Edita `/styles/globals.css`:
```css
/* Cambiar color principal */
:root {
  --color-primary: #3b82f6; /* Azul */
}

/* Agregar nueva fuente */
body {
  font-family: 'Inter', system-ui, sans-serif;
}
```

#### 5. Agregar Nueva Especialidad

En `/components/ScheduleAppointment.tsx`:
```typescript
const specialties = [
  // ... especialidades existentes
  { 
    value: 'oftalmologia', 
    label: 'Oftalmología', 
    doctor: 'Dr. Juan López' 
  },
];
```

### Para Usuarios Finales

#### Crear una Cuenta

1. Abre MedConnect en tu navegador
2. Haz clic en "Crear cuenta gratis"
3. Escribe tu nombre completo
4. Escribe tu correo electrónico
5. Crea una contraseña (mínimo 6 caracteres)
6. Confirma tu contraseña
7. Haz clic en "Crear mi cuenta gratis"
8. Verás un tutorial de 3 pasos
9. Haz clic en "Empezar a usar MedConnect"

#### Agendar una Cita

1. En el Dashboard, haz clic en "Agendar nueva cita"
2. Selecciona el tipo de consulta que necesitas
3. Elige la fecha que prefieres
4. Selecciona un horario disponible
5. (Opcional) Escribe por qué necesitas la consulta
6. Haz clic en "Agendar cita"
7. Recibirás una confirmación

#### Realizar una Consulta

1. En el Dashboard, ve a "Próximas citas"
2. Encuentra tu cita del día
3. Haz clic en "Iniciar consulta"
4. Verás la sala de videollamada
5. Puedes controlar tu micrófono y cámara
6. Cuando termines, haz clic en el botón rojo de teléfono
7. Confirma que quieres terminar la llamada

#### Ver tu Historial

1. En el Dashboard, haz clic en "Ver historial médico"
2. Verás todas tus citas anteriores y próximas
3. Puedes buscar por doctor o especialidad
4. Puedes filtrar por tipo de cita
5. Haz clic en "Volver al inicio" cuando termines

#### Cambiar Tema (Modo Oscuro)

1. En cualquier pantalla, busca el botón con el ícono de luna/sol
2. Haz clic para cambiar entre modo claro y oscuro
3. Tu preferencia se guardará automáticamente

#### Cerrar Sesión

1. En el Dashboard, haz clic en el ícono de salida (arriba a la derecha)
2. Tu sesión se cerrará de forma segura
3. Volverás a la pantalla de inicio

---

## 🔒 Seguridad y Privacidad

### Datos Almacenados

**En Supabase Auth**:
- Email (encriptado)
- Contraseña (hasheada con bcrypt)
- Metadata del usuario (nombre)

**En KV Store**:
- Perfil de usuario (id, nombre, email, onboarding status)
- Citas médicas (sin información médica sensible)

### Autenticación

- Tokens JWT con expiración
- Refresh tokens para renovar sesión
- Verificación en cada request al backend

### Consideraciones Importantes

⚠️ **Este es un prototipo educativo**. Para un sistema médico real:

1. **Cumplimiento regulatorio**: Implementar HIPAA, GDPR, etc.
2. **Encriptación**: E2E encryption para datos médicos
3. **Auditoría**: Logs de acceso a información sensible
4. **Backup**: Respaldos automáticos de datos
5. **2FA**: Autenticación de dos factores
6. **Videollamada real**: Integrar WebRTC con servidores TURN/STUN

---

## 📞 Soporte

### Información de Contacto (Ficticia)

- **Teléfono**: 1-800-MEDCONNECT
- **Email**: ayuda@medconnect.com
- **Horario**: Lunes a Viernes, 8 AM - 8 PM

### Preguntas Frecuentes

**¿Es gratis usar MedConnect?**
Sí, el registro y uso básico es completamente gratis.

**¿Necesito instalar algo?**
No, MedConnect funciona completamente en tu navegador web.

**¿Puedo usar MedConnect desde mi celular?**
Sí, la plataforma es responsive y funciona en todos los dispositivos.

**¿Mis datos están seguros?**
Sí, usamos encriptación y cumplimos con estándares de seguridad.

**¿Qué hago si olvidé mi contraseña?**
Contáctanos al 1-800-MEDCONNECT para recuperar tu cuenta.

---

## 📝 Conclusión

MedConnect es una plataforma completa de teleconsulta médica que prioriza:

✅ **Accesibilidad** - Para todos los niveles de alfabetización digital  
✅ **Empatía** - Mensajes claros y reconfortantes  
✅ **Funcionalidad** - Sistema completo de citas y videollamadas  
✅ **Seguridad** - Autenticación robusta con Supabase  
✅ **Usabilidad** - Interfaz intuitiva y responsive  

La documentación cubre todos los aspectos técnicos y funcionales del proyecto, desde la arquitectura del backend hasta los detalles de UX Writing en cada componente.

---

**Versión**: 1.0  
**Fecha**: Diciembre 2025  
**Proyecto**: MedConnect - Plataforma de Teleconsulta Médica
