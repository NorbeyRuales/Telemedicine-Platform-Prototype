# Guía de UX Writing - MedConnect

## Principios Fundamentales

### 1. Tono Emocional
- **Empático**: Reconocemos que la salud es un tema sensible
- **Cercano**: Hablamos como un amigo que ayuda, no como una institución distante
- **Tranquilizador**: Evitamos alarmismo, damos seguridad
- **Respetuoso**: Usamos usted/tu según el contexto (preferimos "tu" para cercanía)
- **Positivo**: Enfocamos en soluciones, no en problemas

### 2. Vocabulario

#### ✅ Usar:
- Cita (en lugar de "consulta médica")
- Doctor/Médico (en lugar de "profesional de la salud")
- Documentos (en lugar de "archivos clínicos")
- Registrarse (en lugar de "crear cuenta")
- Iniciar sesión (en lugar de "login")
- Tu información (en lugar de "tus datos personales")

#### ❌ Evitar:
- Tecnicismos médicos sin explicación
- Jerga técnica (API, sistema, base de datos)
- Anglicismos innecesarios
- Lenguaje formal excesivo
- Palabras que generen ansiedad

### 3. Estructura de Mensajes

#### Mensajes de Error
**Formato:**
```
[Qué pasó] + [Por qué] + [Qué hacer]

Ejemplo:
"No pudimos guardar tu información porque falta completar tu correo electrónico. 
Por favor revísalo e intenta nuevamente."
```

**Características:**
- Máximo 2-3 líneas
- Lenguaje simple y directo
- Sin culpar al usuario
- Siempre ofrecer una solución

#### Mensajes de Éxito
**Formato:**
```
[Confirmación] + [Qué sigue (opcional)]

Ejemplo:
"¡Tu cita fue agendada exitosamente! 
Te enviaremos un recordatorio un día antes."
```

**Características:**
- Tono celebratorio pero moderado
- Clarificar próximos pasos
- Dar tranquilidad

#### Mensajes de Ayuda (Microcopy)
**Formato:**
```
[Instrucción clara] + [Ejemplo (opcional)]

Ejemplo:
"Usa al menos 6 caracteres. Combina letras y números para mayor seguridad."
```

**Características:**
- Aparecer antes o durante la interacción
- No esperar al error
- Máximo 1 línea
- Usar ejemplos cuando sea necesario

### 4. Contextos Específicos

#### Login Fallido
❌ "Credenciales inválidas"
✅ "El correo o la contraseña no son correctos. ¿Necesitas ayuda para recuperar tu cuenta?"

#### Registro Exitoso
❌ "Usuario creado"
✅ "¡Bienvenido a MedConnect! Tu cuenta está lista. Vamos a configurarla juntos."

#### Formularios Vacíos
❌ "Campo requerido"
✅ "Por favor completa este campo para continuar"

#### Carga de Archivos
❌ "Error de carga"
✅ "No pudimos subir el archivo. Verifica que sea menor a 10 MB e intenta nuevamente."

#### Confirmación de Acciones Críticas
❌ "¿Eliminar?"
✅ "¿Estás seguro de eliminar este documento? Esta acción no se puede deshacer."

### 5. Accesibilidad Textual

#### Frases Cortas
- Máximo 15-20 palabras por oración
- Un concepto por párrafo
- Usar listas cuando sea posible

#### Formato
- Títulos claros y descriptivos
- Negrita para información crítica
- Espaciado generoso
- Contraste alto

#### Lenguaje Inclusivo
- Evitar suposiciones sobre conocimientos técnicos
- Explicar conceptos nuevos
- Ofrecer múltiples formas de entender

### 6. Escalas de Retroalimentación

#### Nivel 1: Informativo (Azul)
"Tu cita es mañana a las 10:00 AM"

#### Nivel 2: Éxito (Verde)
"✓ Documento subido correctamente"

#### Nivel 3: Advertencia (Amarillo)
"Recuerda subir tus documentos antes de la cita"

#### Nivel 4: Error (Rojo)
"No pudimos conectar con el servidor. Verifica tu conexión e intenta de nuevo."

### 7. Mensajes Contextualizados por Módulo

#### Onboarding
- Tono: Amigable y guía
- Ejemplo: "Te ayudaremos a dar tus primeros pasos. Esto solo tomará un minuto."

#### Agendar Citas
- Tono: Eficiente pero cálido
- Ejemplo: "Elige el día y hora que mejor te funcione. Puedes cambiarla después si lo necesitas."

#### Videollamada
- Tono: Profesional y tranquilizador
- Ejemplo: "Tu médico se conectará en unos momentos. Verifica que tu cámara y micrófono funcionen."

#### Historial Médico
- Tono: Informativo y privado
- Ejemplo: "Aquí puedes ver todas tus citas. Esta información es privada y segura."

#### Carga de Documentos
- Tono: Instructivo y paciente
- Ejemplo: "Puedes subir recetas, análisis o cualquier documento relacionado con tu salud."

### 8. Plantillas Reutilizables

#### Cargando
"Un momento, estamos procesando tu solicitud..."

#### Sin Internet
"Parece que no tienes conexión a internet. Verifica tu conexión e intenta nuevamente."

#### Sesión Expirada
"Tu sesión expiró por seguridad. Por favor inicia sesión nuevamente."

#### Acción Completada
"Listo, [acción] completada exitosamente."

#### Acción Cancelada
"No te preocupes, no se realizaron cambios."

### 9. Checklist de Calidad

Antes de publicar cualquier texto, verifica:

- [ ] ¿Es claro y directo?
- [ ] ¿Evita tecnicismos innecesarios?
- [ ] ¿Es empático con el usuario?
- [ ] ¿Ofrece una solución o próximo paso?
- [ ] ¿Tiene máximo 2-3 líneas?
- [ ] ¿Un adulto mayor podría entenderlo fácilmente?
- [ ] ¿Usa un tono tranquilizador en temas médicos?
- [ ] ¿Incluye ayuda contextual donde sea necesario?

### 10. Ejemplos Antes/Después

#### Login
**Antes:**
```
Error: Invalid credentials
```

**Después:**
```
El correo o la contraseña no son correctos. 
Por favor revisa tus datos e intenta nuevamente.
¿Necesitas ayuda para recuperar tu cuenta?
```

#### Registro
**Antes:**
```
Account created successfully
```

**Después:**
```
¡Bienvenido a MedConnect! 
Tu cuenta está lista. Vamos a configurarla juntos 
para que puedas agendar tu primera cita.
```

#### Error de Red
**Antes:**
```
Network error
```

**Después:**
```
No pudimos conectar con el servidor. 
Verifica tu conexión a internet e intenta de nuevo.
Si el problema continúa, contáctanos.
```

---

## Palabras Clave por Categoría

### Tranquilidad
- No te preocupes
- Estamos aquí para ayudarte
- Todo está bien
- Es normal
- Paso a paso

### Empatía
- Entendemos que...
- Sabemos que esto puede ser...
- Te acompañamos en...
- Queremos que te sientas...

### Acción
- Vamos a...
- Puedes...
- Intenta...
- Verifica...
- Continúa...

### Seguridad
- Tu información está protegida
- Es privado y seguro
- Solo tú puedes ver...
- Mantenemos tu privacidad

---

**Última actualización:** Diciembre 2025
**Responsable:** Equipo de UX/UI MedConnect
