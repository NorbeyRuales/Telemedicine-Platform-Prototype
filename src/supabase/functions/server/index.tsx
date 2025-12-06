import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as db from './db.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Create a separate client for Auth operations (needs anon key)
const supabaseAuth = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Initialize storage bucket for medical documents
const BUCKET_NAME = 'make-1f0a837c-medical-documents';

// Create bucket if it doesn't exist
async function ensureBucketExists() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 10485760 // 10MB
      });
      console.log('Medical documents bucket created');
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
  }
}

// Call on startup
ensureBucketExists();

// Helper function to verify user
async function verifyUser(authHeader: string | null) {
  if (!authHeader) {
    return { user: null, error: 'No authorization header' };
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return { user: null, error: 'Invalid authorization header' };
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { user: null, error: 'Unauthorized' };
  }
  
  return { user, error: null };
}

// Routes

// Health check
app.get('/make-server-1f0a837c/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sign up
app.post('/make-server-1f0a837c/signup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    console.log('Signup request received for:', email);

    if (!name || !email || !password) {
      return c.json({ error: 'Por favor completa todos los campos: nombre, correo y contraseña' }, 400);
    }

    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: 'Por favor ingresa un correo electrónico válido' }, 400);
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return c.json({ error: 'Tu contraseña debe tener al menos 6 caracteres' }, 400);
    }

    // Create user with Supabase Auth using Service Role
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Supabase createUser error:', error);
      
      // Mensajes de error empáticos y específicos
      if (error.message.includes('already') || error.message.includes('exists')) {
        return c.json({ error: 'Ya existe una cuenta con este correo electrónico. ¿Quieres iniciar sesión?' }, 400);
      }
      if (error.message.includes('email')) {
        return c.json({ error: 'Por favor revisa que tu correo electrónico esté escrito correctamente' }, 400);
      }
      if (error.message.includes('password')) {
        return c.json({ error: 'Tu contraseña debe tener al menos 6 caracteres' }, 400);
      }
      if (error.message.includes('service_role')) {
        console.error('Service role key not configured properly');
        return c.json({ error: 'Error de configuración del servidor. Por favor contacta soporte.' }, 500);
      }
      
      return c.json({ 
        error: 'No pudimos crear tu cuenta. Por favor intenta nuevamente en unos momentos',
        details: error.message 
      }, 400);
    }

    if (!data.user) {
      console.error('User created but no user data returned');
      return c.json({ error: 'Error al crear la cuenta. Por favor intenta nuevamente' }, 500);
    }

    console.log('User created successfully:', data.user.id);

    // Store user profile in database
    try {
      await db.set(`user:${data.user.id}`, {
        id: data.user.id,
        name,
        email,
        hasCompletedOnboarding: false,
        createdAt: new Date().toISOString()
      });
      console.log('User profile stored in database');
    } catch (dbError) {
      console.error('Error storing user profile:', dbError);
      // Continue even if KV storage fails
    }

    return c.json({ 
      user: {
        id: data.user.id,
        name,
        email,
        hasCompletedOnboarding: false
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return c.json({ 
      error: 'Ocurrió un problema al crear tu cuenta. Por favor verifica tus datos e intenta nuevamente',
      details: err instanceof Error ? err.message : String(err)
    }, 500);
  }
});

// Sign in
app.post('/make-server-1f0a837c/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Por favor ingresa tu correo electrónico y contraseña' }, 400);
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Error signing in:', error);
      
      // Mensajes de error empáticos
      if (error.message.includes('Invalid') || error.message.includes('credentials')) {
        return c.json({ error: 'El correo o la contraseña no son correctos. Por favor verifica tus datos' }, 401);
      }
      if (error.message.includes('not found') || error.message.includes('User')) {
        return c.json({ error: 'No encontramos una cuenta con este correo electrónico' }, 401);
      }
      
      return c.json({ error: 'No pudimos iniciar sesión. Por favor verifica tu conexión e intenta de nuevo' }, 401);
    }

    // Get user profile from KV
    const userProfile = await db.get(`user:${data.user.id}`);

    return c.json({
      session: data.session,
      user: userProfile || {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || '',
        hasCompletedOnboarding: false
      }
    });
  } catch (err) {
    console.log('Signin error:', err);
    return c.json({ error: 'Ocurrió un problema al iniciar sesión. Por favor intenta nuevamente' }, 500);
  }
});

// Get current user session
app.get('/make-server-1f0a837c/session', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    // Get user profile from KV
    const userProfile = await db.get(`user:${user.id}`);

    return c.json({
      user: userProfile || {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        hasCompletedOnboarding: false
      }
    });
  } catch (err) {
    console.log('Session error:', err);
    return c.json({ error: 'Server error getting session' }, 500);
  }
});

// Create user profile
app.post('/make-server-1f0a837c/user/create', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const { id, name, email, hasCompletedOnboarding } = await c.req.json();

    const profile = {
      id: id || user.id,
      name,
      email,
      hasCompletedOnboarding: hasCompletedOnboarding ?? false,
      createdAt: new Date().toISOString()
    };

    await db.set(`user:${profile.id}`, profile);

    return c.json({ user: profile });
  } catch (err) {
    console.log('User create error:', err);
    return c.json({ error: 'Server error creating user profile' }, 500);
  }
});

// Get user profile
app.get('/make-server-1f0a837c/user/profile', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const profile = await db.get(`user:${user.id}`);
    
    if (!profile) {
      // Create default profile from metadata
      const defaultProfile = {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
        email: user.email,
        hasCompletedOnboarding: user.user_metadata?.hasCompletedOnboarding ?? false,
        createdAt: new Date().toISOString()
      };
      
      await db.set(`user:${user.id}`, defaultProfile);
      return c.json({ user: defaultProfile });
    }

    return c.json({ user: profile });
  } catch (err) {
    console.log('Get profile error:', err);
    return c.json({ error: 'Server error getting profile' }, 500);
  }
});

// Update user profile (onboarding completion)
app.put('/make-server-1f0a837c/user/profile', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();
    const currentProfile = await db.get(`user:${user.id}`) || {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || ''
    };

    const updatedProfile = { ...currentProfile, ...updates };
    await db.set(`user:${user.id}`, updatedProfile);

    return c.json({ user: updatedProfile });
  } catch (err) {
    console.log('Profile update error:', err);
    return c.json({ error: 'Server error updating profile' }, 500);
  }
});

// Create appointment
app.post('/make-server-1f0a837c/appointments', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const appointmentData = await c.req.json();
    const appointmentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const appointment = {
      id: appointmentId,
      userId: user.id,
      ...appointmentData,
      status: 'upcoming',
      createdAt: new Date().toISOString()
    };

    await db.set(`appointment:${appointmentId}`, appointment);
    await db.set(`user_appointment:${user.id}:${appointmentId}`, appointmentId);

    return c.json({ appointment });
  } catch (err) {
    console.log('Create appointment error:', err);
    return c.json({ error: 'Server error creating appointment' }, 500);
  }
});

// Get user appointments
app.get('/make-server-1f0a837c/appointments', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    // Get all appointment IDs for this user
    const appointmentKeys = await db.getByPrefix(`user_appointment:${user.id}:`);
    
    if (!appointmentKeys || appointmentKeys.length === 0) {
      return c.json({ appointments: [] });
    }

    // Get all appointments
    const appointmentIds = appointmentKeys.map(item => item.value);
    const appointments = await db.mget(appointmentIds.map(id => `appointment:${id}`));

    return c.json({ appointments: appointments.filter(a => a !== null) });
  } catch (err) {
    console.log('Get appointments error:', err);
    return c.json({ error: 'Server error getting appointments' }, 500);
  }
});

// Update appointment status
app.put('/make-server-1f0a837c/appointments/:id', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const appointmentId = c.req.param('id');
    const updates = await c.req.json();

    const appointment = await db.get(`appointment:${appointmentId}`);
    
    if (!appointment) {
      return c.json({ error: 'Appointment not found' }, 404);
    }

    if (appointment.userId !== user.id) {
      return c.json({ error: 'Unauthorized to update this appointment' }, 403);
    }

    const updatedAppointment = { ...appointment, ...updates };
    await db.set(`appointment:${appointmentId}`, updatedAppointment);

    return c.json({ appointment: updatedAppointment });
  } catch (err) {
    console.log('Update appointment error:', err);
    return c.json({ error: 'Server error updating appointment' }, 500);
  }
});

// Sign out
app.post('/make-server-1f0a837c/signout', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    await supabase.auth.signOut();
    return c.json({ message: 'Signed out successfully' });
  } catch (err) {
    console.log('Signout error:', err);
    return c.json({ error: 'Server error during signout' }, 500);
  }
});

// Upload document
app.post('/make-server-1f0a837c/documents/upload', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: 'No tienes permiso para subir documentos' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;

    if (!file) {
      return c.json({ error: 'Por favor selecciona un archivo' }, 400);
    }

    if (!description) {
      return c.json({ error: 'Por favor describe el documento' }, 400);
    }

    // Generate unique file path
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.id}/${timestamp}.${fileExtension}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.log('Upload error:', uploadError);
      return c.json({ error: 'No pudimos subir el archivo. Por favor intenta de nuevo' }, 500);
    }

    // Create signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileName, 31536000); // 1 year in seconds

    // Save document metadata to KV
    const documentId = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    const document = {
      id: documentId,
      userId: user.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storagePath: fileName,
      description,
      uploadDate: new Date().toISOString(),
      url: urlData?.signedUrl || ''
    };

    await db.set(`document:${documentId}`, document);
    await db.set(`user_document:${user.id}:${documentId}`, documentId);

    return c.json({ document });
  } catch (err) {
    console.log('Document upload error:', err);
    return c.json({ error: 'Ocurrió un problema al subir el documento. Por favor intenta nuevamente' }, 500);
  }
});

// Get user documents
app.get('/make-server-1f0a837c/documents', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: 'No tienes permiso para ver documentos' }, 401);
    }

    // Get all document IDs for this user
    const documentKeys = await db.getByPrefix(`user_document:${user.id}:`);
    
    if (!documentKeys || documentKeys.length === 0) {
      return c.json({ documents: [] });
    }

    // Get all documents
    const documentIds = documentKeys.map(item => item.value);
    const documents = await db.mget(documentIds.map(id => `document:${id}`));

    // Refresh signed URLs if needed
    const refreshedDocuments = await Promise.all(
      documents.filter(doc => doc !== null).map(async (doc) => {
        // Create new signed URL
        const { data: urlData } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(doc.storagePath, 31536000);
        
        return {
          ...doc,
          url: urlData?.signedUrl || doc.url
        };
      })
    );

    return c.json({ documents: refreshedDocuments });
  } catch (err) {
    console.log('Get documents error:', err);
    return c.json({ error: 'Ocurrió un problema al obtener los documentos' }, 500);
  }
});

// Delete document
app.delete('/make-server-1f0a837c/documents/:id', async (c) => {
  try {
    const { user, error } = await verifyUser(c.req.header('Authorization'));
    
    if (error || !user) {
      return c.json({ error: 'No tienes permiso para eliminar documentos' }, 401);
    }

    const documentId = c.req.param('id');
    const document = await db.get(`document:${documentId}`);
    
    if (!document) {
      return c.json({ error: 'Documento no encontrado' }, 404);
    }

    if (document.userId !== user.id) {
      return c.json({ error: 'No tienes permiso para eliminar este documento' }, 403);
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([document.storagePath]);

    if (storageError) {
      console.log('Storage delete error:', storageError);
    }

    // Delete from KV
    await db.del(`document:${documentId}`);
    await db.del(`user_document:${user.id}:${documentId}`);

    return c.json({ message: 'Documento eliminado correctamente' });
  } catch (err) {
    console.log('Delete document error:', err);
    return c.json({ error: 'No pudimos eliminar el documento. Por favor intenta de nuevo' }, 500);
  }
});

Deno.serve(app.fetch);