import React, { useState } from 'react';
import { LoginButton } from './LoginButton';
import { useAuth } from './AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Vista de Login Premium de Ideal.
 * Ofrece un diseño inmersivo con formulario de credenciales (Email/Contraseña),
 * toggle animado entre Iniciar Sesión y Registrarse, y Google OAuth como alternativa.
 */
export const LoginView: React.FC = () => {
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validación básica del lado del cliente
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (isRegistering && !nombreCompleto.trim()) {
      setErrorMsg('Por favor, ingresa tu nombre completo para registrarte.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await signUpWithEmail(email.trim(), password, nombreCompleto.trim());
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ha ocurrido un error inesperado.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Elementos Decorativos de Fondo (Efecto Moderno de Glow) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-ideal/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-ideal/10 blur-[100px] pointer-events-none" />

      {/* Tarjeta Principal de Presentación */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 md:p-10 z-10"
      >
        {/* Identidad de la Marca */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ideal/10 text-ideal mb-4"
          >
            <Sparkles className="h-7 w-7" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold tracking-tight text-slate-900 font-title"
          >
            Ideal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-[14px] text-slate-500 mt-1 font-sans"
          >
            Sistemas Digitales de Alta Gama
          </motion.p>
        </div>

        {/* Toggle Animado: Iniciar Sesión / Registrarse */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative flex items-center bg-slate-100/80 rounded-2xl p-1 mb-6"
        >
          <motion.div
            layout
            className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm"
            style={{ width: 'calc(50% - 4px)' }}
            animate={{ x: isRegistering ? 'calc(100% + 4px)' : '4px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          />
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setErrorMsg(''); }}
            className={`relative z-10 flex-1 py-2.5 text-[13px] font-semibold rounded-xl transition-colors duration-200 ${
              !isRegistering ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setErrorMsg(''); }}
            className={`relative z-10 flex-1 py-2.5 text-[13px] font-semibold rounded-xl transition-colors duration-200 ${
              isRegistering ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Crear Cuenta
          </button>
        </motion.div>

        {/* Formulario de Credenciales */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de Nombre Completo (Solo en Registro) */}
          <AnimatePresence mode="wait">
            {isRegistering && (
              <motion.div
                key="nombre-field"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <label htmlFor="nombre-completo" className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400 pointer-events-none" />
                  <input
                    id="nombre-completo"
                    type="text"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    placeholder="Tu nombre y apellido"
                    autoComplete="name"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-[14px] text-slate-800 placeholder:text-slate-400 font-sans transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ideal/20 focus:border-ideal/40 focus:bg-white hover:border-slate-300"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Campo de Correo Electrónico */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <label htmlFor="email-login" className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400 pointer-events-none" />
              <input
                id="email-login"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-[14px] text-slate-800 placeholder:text-slate-400 font-sans transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ideal/20 focus:border-ideal/40 focus:bg-white hover:border-slate-300"
              />
            </div>
          </motion.div>

          {/* Campo de Contraseña */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="password-login" className="block text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400 pointer-events-none" />
              <input
                id="password-login"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                required
                minLength={6}
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-[14px] text-slate-800 placeholder:text-slate-400 font-sans transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ideal/20 focus:border-ideal/40 focus:bg-white hover:border-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </motion.div>

          {/* Alerta de Error Elegante */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                key="error-alert"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-2xl"
              >
                <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-red-600 leading-snug font-sans">{errorMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón Principal de Envío */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01, boxShadow: '0 12px 30px -10px rgba(0, 82, 204, 0.25)' }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="w-full flex items-center justify-center gap-2.5 bg-ideal text-white font-semibold px-6 py-4 rounded-2xl shadow-md shadow-ideal/15 transition-all duration-200 hover:bg-ideal-hover focus:outline-none focus:ring-2 focus:ring-ideal/30 disabled:opacity-60 disabled:cursor-not-allowed select-none text-[15px] font-sans"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span>{isRegistering ? 'Crear Mi Cuenta' : 'Ingresar'}</span>
            )}
          </motion.button>
        </form>

        {/* Separador Visual */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <span className="relative bg-white px-4 text-[11px] font-medium text-slate-400 uppercase tracking-wider font-sans">
            o continúa con
          </span>
        </div>

        {/* Botón de Google OAuth (Alternativa Rápida) */}
        <LoginButton />

        {/* Términos y Pie de Página */}
        <div className="text-center mt-6 text-[11px] text-slate-400 font-sans leading-normal">
          <p className="flex items-center justify-center gap-1.5 text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Conexión protegida por cifrado SSL de extremo a extremo
          </p>
          <p className="mt-3">
            Al continuar, aceptas nuestros términos de servicio y políticas de privacidad basados en conecaideal.com.
          </p>
        </div>

        {/* Indicador Sutil de Modo Demo */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-4 text-[10px] text-slate-300 font-sans"
        >
          Tip: Usa admin@conecaideal.com para acceso administrativo
        </motion.p>
      </motion.div>
    </div>
  );
};
