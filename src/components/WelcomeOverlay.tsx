import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Shield, ShoppingBag, ArrowRight } from 'lucide-react';
import type { Perfil } from '../auth/AuthProvider';

interface WelcomeOverlayProps {
  userEmail: string;
  perfil: Perfil | null;
  onClose: () => void;
}

/**
 * Componente de bienvenida interactivo premium y de alta gama.
 * Muestra una tarjeta glassmorphic inmersiva con micro-animaciones en 3D de Framer Motion,
 * una lluvia festiva continua de confeti tridimensional a doble cañón y
 * una interfaz responsiva adaptada al rol del usuario.
 */
export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ userEmail, perfil, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const isAdmin = userEmail === 'doriangonzalez2019@gmail.com' || userEmail === 'doriangonzalez2018@gmail.com' || perfil?.rol === 'admin';
  const displayNombre = isAdmin 
    ? (perfil?.nombre_completo || 'Dorian González') 
    : (perfil?.nombre_completo || userEmail.split('@')[0]);

  useEffect(() => {
    // 1. Lanzar explosión inicial de confeti masivo
    confetti({
      particleCount: 180,
      spread: 100,
      origin: { y: 0.65 },
      colors: ['#0052cc', '#ffab00', '#36b37e', '#ff5630', '#6554c0'],
      ticks: 300
    });

    // 2. Establecer un ciclo continuo de confeti festivo por los costados (doble cañón)
    const confettiInterval = setInterval(() => {
      // Cañón Izquierdo
      confetti({
        particleCount: 15,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: ['#0052cc', '#ffab00', '#36b37e'],
      });
      // Cañón Derecho
      confetti({
        particleCount: 15,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: ['#0052cc', '#ffab00', '#36b37e'],
      });
    }, 700);

    // 3. Cierre automático después de 4.5 segundos
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 4500);

    return () => {
      clearInterval(confettiInterval);
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onClose, 500); // Dar tiempo a la animación de salida
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md select-none"
        >
          {/* Card Glassmorphic Premium con Borde de Brillo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="relative w-full max-w-[500px] bg-white rounded-3xl shadow-[0_30px_90px_-10px_rgba(0,0,0,0.3)] border border-slate-100 p-8 md:p-10 text-center overflow-hidden"
          >
            {/* Resplandor de fondo interactivo */}
            <div className={`absolute -top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full opacity-20 blur-[80px] pointer-events-none ${
              isAdmin ? 'bg-amber-500' : 'bg-ideal'
            }`} />
            <div className="absolute -bottom-[20%] -right-[20%] w-[60%] h-[60%] rounded-full opacity-10 blur-[80px] pointer-events-none bg-emerald-500" />

            {/* Ícono de Entrada Animado en 3D */}
            <div className="relative flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
                className={`relative inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg text-white ${
                  isAdmin 
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-amber-500/20' 
                    : 'bg-gradient-to-tr from-ideal to-ideal-hover shadow-ideal/20'
                }`}
              >
                {isAdmin ? (
                  <Shield className="h-10 w-10 animate-pulse" />
                ) : (
                  <ShoppingBag className="h-10 w-10" />
                )}
                
                {/* Estrellas decorativas flotantes */}
                <motion.div
                  animate={{ y: [0, -6, 0], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-lg shadow-md"
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
              </motion.div>
            </div>

            {/* Textos de Bienvenida Enérgicos */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <span className={`inline-block px-4 py-1 text-[11px] font-bold tracking-widest uppercase rounded-full ${
                isAdmin 
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' 
                  : 'bg-ideal/10 text-ideal border border-ideal/20'
              }`}>
                {isAdmin ? 'Acceso Administrativo Exclusivo' : 'E-Commerce Premium de Alta Gama'}
              </span>

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-title px-2">
                {isAdmin ? (
                  <>
                    🎉 ¡Bienvenido de nuevo,<br />
                    <span className="bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
                      {displayNombre}
                    </span>! 👑
                  </>
                ) : (
                  <>
                    🎉 ¡Bienvenido a Compra Ideal,<br />
                    <span className="bg-gradient-to-r from-ideal to-cyan-600 bg-clip-text text-transparent">
                      {displayNombre}
                    </span>! 🛍️
                  </>
                )}
              </h2>

              <p className="text-[14px] text-slate-500 font-sans max-w-[380px] mx-auto leading-relaxed">
                {isAdmin 
                  ? 'Todo el ecosistema de administración, inventario contable y CRM comercial está listo para tu gestión.'
                  : 'Tu portal boutique digital de alta gama está cargado y listo. Disfruta de la mejor experiencia de compra.'}
              </p>
            </motion.div>

            {/* Barra de progreso de cierre automático */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-7 relative">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: 0 }}
                transition={{ duration: 4.5, ease: "linear" }}
                className={`h-full ${isAdmin ? 'bg-amber-500' : 'bg-ideal'}`}
              />
            </div>

            {/* Botón de Acción Principal con Micro-Interacciones */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <motion.button
                onClick={handleDismiss}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.985 }}
                className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-bold shadow-md transition-all duration-200 select-none text-[15px] font-sans ${
                  isAdmin 
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25' 
                    : 'bg-ideal hover:bg-ideal-hover shadow-ideal/20'
                }`}
              >
                <span>{isAdmin ? 'Ingresar a la Consola' : 'Comenzar a Comprar'}</span>
                <ArrowRight className="h-4.5 w-4.5 animate-pulse" />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
