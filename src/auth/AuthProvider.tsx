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
  const fetchPerfil = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', uid)
        .single();
      
      if (error) {
        console.warn('Perfil no encontrado en base de datos:', error.message);
        setPerfil(null);
        return;
      }
      setPerfil(data as Perfil);
    } catch (err) {
      console.error('Excepción al cargar perfil del usuario:', err);
      setPerfil(null);
    }
  };

  const refreshPerfil = async () => {
    if (user) {
      await fetchPerfil(user.id);
    }
  };

  useEffect(() => {
    const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');
    
    if (isDemo) {
      console.log('Iniciando AuthProvider en modo Demo (Sin llamadas a red)...');
      setLoading(false);
      return;
    }

    // 1. Verificar sesión activa inicial
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchPerfil(session.user.id);
        }
      } catch (err) {
        console.error('Error al inicializar sesión activa:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Escuchar cambios de autenticación (Login, Logout, Token refrescos)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      if (session?.user) {
        setUser(session.user);
        await fetchPerfil(session.user.id);
      } else {
        setUser(null);
        setPerfil(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
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
        email: "admin@conecaideal.com",
        user_metadata: {
          full_name: "Administrador Ideal",
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
        }
      } as any;

      const mockPerfil: Perfil = {
        id: "mock-admin-id",
        email: "admin@conecaideal.com",
        nombre_completo: "Administrador Ideal",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
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
      
      const isAdminEmail = email.toLowerCase() === 'admin@conecaideal.com';
      const mockUser = {
        id: isAdminEmail ? "mock-admin-id" : `mock-client-${Date.now()}`,
        email: email,
        user_metadata: {
          full_name: isAdminEmail ? "Administrador Ideal" : "Cliente Premium",
          avatar_url: ""
        }
      } as any;

      const mockPerfil: Perfil = {
        id: mockUser.id,
        email: email,
        nombre_completo: isAdminEmail ? "Administrador Ideal" : "Cliente Premium",
        avatar_url: null,
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
        await fetchPerfil(data.user.id);
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
      
      const isAdminEmail = email.toLowerCase() === 'admin@conecaideal.com';
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

  const isAdmin = perfil?.rol === 'admin';

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
