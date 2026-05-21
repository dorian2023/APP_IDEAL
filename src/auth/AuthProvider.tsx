import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Representa el perfil ampliado del usuario en base de datos.
 */
export interface Perfil {
  id: string;
  email: string;
  nombre_completo: string | null;
  avatar_url: string | null;
  telefono?: string | null;
  direccion?: string | null;
  rol: 'cliente' | 'admin';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  perfil: Perfil | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, nombreCompleto: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  refreshPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Proveedor de contexto para autenticación y roles de usuario.
 * Garantiza un control de accesos centralizado y seguro.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  // Consultar perfil de base de datos
  const ADMIN_EMAILS = ['doriangonzalez2019@gmail.com', 'doriangonzalez2018@gmail.com'];

  // Consultar perfil de base de datos.
  // @param uid - UUID del usuario autenticado
  // @param userEmail - Email del usuario (pasado directamente para evitar una segunda llamada de red)
  const fetchPerfil = async (uid: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', uid)
        .single();
      
      const emailLower = (userEmail || '').toLowerCase();
      const isAdminEmail = ADMIN_EMAILS.includes(emailLower);

      if (error) {
        console.warn('Perfil no encontrado en base de datos:', error.message);
        if (isAdminEmail && userEmail) {
          // Perfil admin fallback si la BD aun no lo ha sincronizado
          const fallbackPerfil: Perfil = {
            id: uid,
            email: userEmail,
            nombre_completo: 'Admin Ideal',
            avatar_url: null,
            telefono: '',
            direccion: '',
            rol: 'admin',
            created_at: new Date().toISOString()
          };
          setPerfil(fallbackPerfil);
        } else {
          setPerfil(null);
        }
        return;
      }

      const userPerfil = data as Perfil;
      // Garantizar rol admin si el email coincide, independientemente del valor en BD
      if (isAdminEmail || ADMIN_EMAILS.includes((userPerfil.email || '').toLowerCase())) {
        userPerfil.rol = 'admin';
      }
      setPerfil(userPerfil);
    } catch (err) {
      console.error('Excepción al cargar perfil del usuario:', err);
      setPerfil(null);
    }
  };

  const refreshPerfil = async () => {
    if (user) {
      await fetchPerfil(user.id, user.email || undefined);
    }
  };

  useEffect(() => {
    const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');
    
    if (isDemo) {
      console.log('Iniciando AuthProvider en modo Demo (Sin llamadas a red)...');
      setLoading(false);
      return;
    }

    // Failsafe: evitar pantalla de carga permanente en redes lentas o sin conexión
    const failsafeTimeout = setTimeout(() => {
      console.warn('Advertencia: La inicialización de Supabase superó el tiempo límite. Forzando desactivación de pantalla de carga.');
      setLoading(false);
    }, 8000);

    let subscription: any = null;

    // 1. Verificar sesión activa inicial
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchPerfil(session.user.id, session.user.email || undefined);
        }
      } catch (err) {
        console.error('Error al inicializar sesión activa:', err);
      } finally {
        clearTimeout(failsafeTimeout);
        setLoading(false);
      }
    };

    try {
      initializeAuth();

      // 2. Escuchar cambios de autenticación (Login, Logout, Token refrescos)
      const { data: res } = supabase.auth.onAuthStateChange(async (_event, session) => {
        try {
          if (session?.user) {
            setUser(session.user);
            await fetchPerfil(session.user.id, session.user.email || undefined);
          } else {
            setUser(null);
            setPerfil(null);
          }
        } catch (e) {
          console.error('Error en onAuthStateChange handler:', e);
        } finally {
          clearTimeout(failsafeTimeout);
          setLoading(false);
        }
      });
      subscription = res?.subscription;
    } catch (err) {
      console.error('Error al configurar observadores de autenticación:', err);
      clearTimeout(failsafeTimeout);
      setLoading(false);
    }

    return () => {
      clearTimeout(failsafeTimeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Login Google OAuth
  const signInWithGoogle = async () => {
    const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');
    
    if (isDemo) {
      console.log('Iniciando sesión simulada en Modo Demo (Administrador)...');
      setLoading(true);
      
      const mockUser = {
        id: "mock-admin-id",
        email: "doriangonzalez2019@gmail.com",
        user_metadata: {
          full_name: "Dorian González",
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
        }
      } as any;

      const mockPerfil: Perfil = {
        id: "mock-admin-id",
        email: "doriangonzalez2019@gmail.com",
        nombre_completo: "Dorian González",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
        telefono: "+58 412 1234567",
        direccion: "Av. Principal Bellagio, Casa Ideal #24",
        rol: "admin",
        created_at: new Date().toISOString()
      };

      setUser(mockUser);
      setPerfil(mockPerfil);
      setLoading(false);
      return;
    }

    try {
      // Redirección dinámica basada en la ubicación del cliente (local o Vercel)
      const redirectToUrl = window.location.origin;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectToUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err);
      throw err;
    }
  };

  // Login con Correo y Contraseña (Supabase / Demo)
  const signInWithEmail = async (email: string, password: string) => {
    const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');
    
    if (isDemo) {
      console.log('Iniciando sesión simulada con correo en Modo Demo...', email);
      setLoading(true);
      
      const isAdminEmail = email.toLowerCase() === 'doriangonzalez2019@gmail.com' || email.toLowerCase() === 'doriangonzalez2018@gmail.com';
      const mockUser = {
        id: isAdminEmail ? "mock-admin-id" : `mock-client-${Date.now()}`,
        email: email,
        user_metadata: {
          full_name: isAdminEmail ? "Dorian González" : "Cliente Premium",
          avatar_url: ""
        }
      } as any;

      const mockPerfil: Perfil = {
        id: mockUser.id,
        email: email,
        nombre_completo: isAdminEmail ? "Dorian González" : "Cliente Premium",
        avatar_url: null,
        telefono: isAdminEmail ? "+58 412 1234567" : "+58 424 9876543",
        direccion: isAdminEmail ? "Av. Principal Bellagio, Casa Ideal #24" : "Residencias La Joya, Apto 4B",
        rol: isAdminEmail ? "admin" : "cliente",
        created_at: new Date().toISOString()
      };

      setUser(mockUser);
      setPerfil(mockPerfil);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        await fetchPerfil(data.user.id, data.user.email || undefined);
      }
    } catch (err) {
      console.error('Error al iniciar sesión con credenciales:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Registro con Correo y Contraseña (Supabase / Demo)
  const signUpWithEmail = async (email: string, password: string, nombreCompleto: string) => {
    const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');
    
    if (isDemo) {
      console.log('Creando cuenta simulada en Modo Demo...', email);
      setLoading(true);
      
      const isAdminEmail = email.toLowerCase() === 'doriangonzalez2019@gmail.com' || email.toLowerCase() === 'doriangonzalez2018@gmail.com';
      const mockUser = {
        id: isAdminEmail ? "mock-admin-id" : `mock-client-${Date.now()}`,
        email: email,
        user_metadata: {
          full_name: nombreCompleto,
          avatar_url: ""
        }
      } as any;

      const mockPerfil: Perfil = {
        id: mockUser.id,
        email: email,
        nombre_completo: nombreCompleto,
        avatar_url: null,
        telefono: "",
        direccion: "",
        rol: isAdminEmail ? "admin" : "cliente",
        created_at: new Date().toISOString()
      };

      setUser(mockUser);
      setPerfil(mockPerfil);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: nombreCompleto,
          }
        }
      });
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        // Esperar brevemente a que el trigger handle_new_user cree el perfil
        let retries = 3;
        while (retries > 0) {
          await new Promise(r => setTimeout(r, 1000));
          const { data: profile, error: pErr } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (!pErr && profile) {
            setPerfil(profile as Perfil);
            break;
          }
          retries--;
        }
      }
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar Sesión
  const signOut = async () => {
    const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');
    
    if (isDemo) {
      setUser(null);
      setPerfil(null);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setPerfil(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const isAdmin = user?.email?.toLowerCase() === 'doriangonzalez2019@gmail.com' || 
                  user?.email?.toLowerCase() === 'doriangonzalez2018@gmail.com' || 
                  perfil?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ user, perfil, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, isAdmin, refreshPerfil }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para consumir autenticación y roles en toda la aplicación.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser consumido dentro de un AuthProvider');
  }
  return context;
};
