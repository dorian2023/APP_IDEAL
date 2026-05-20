import { createClient } from '@supabase/supabase-js';

// Obtener variables de entorno de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar la presencia de las variables para evitar fallos silenciosos en producción
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'ADVERTENCIA: Las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están definidas. ' +
    'Por favor, asegúrate de configurar tu archivo .env.local para habilitar la conectividad con la base de datos.'
  );
}

/**
 * Cliente centralizado de Supabase.
 * Proporciona acceso unificado a base de datos, autenticación y storage con tipado estricto.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
