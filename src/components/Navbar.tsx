import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Sparkles, LogOut, LayoutDashboard, Store, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentView: 'catalog' | 'admin';
  setView: (view: 'catalog' | 'admin') => void;
  toggleCart: () => void;
}

/**
 * Barra de Navegación de Alta Gama (Glassmorphism).
 * Se adapta de forma inteligente al rol del usuario y proporciona micro-interacciones fluidas.
 */
export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, toggleCart }) => {
  const { perfil, signOut, isAdmin } = useAuth();
  const { cartCount } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 z-40 flex items-center justify-between px-6 md:px-12 glass-nav">
      {/* Logotipo Ideal con micro-animación de destello */}
      <motion.div 
        onClick={() => setView('catalog')}
        className="flex items-center gap-2 cursor-pointer select-none group"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-ideal text-white shadow-md shadow-ideal/10 group-hover:rotate-6 transition-transform duration-300">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900 font-title">
          Ideal
        </span>
      </motion.div>

      {/* Menú de Enlaces Centrales */}
      <div className="hidden md:flex items-center gap-2 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/20">
        <button
          onClick={() => setView('catalog')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-[13px] transition-all ${
            currentView === 'catalog'
              ? 'bg-white text-ideal shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
          }`}
        >
          <Store className="h-4 w-4" />
          Catálogo E-Commerce
        </button>

        {isAdmin && (
          <button
            onClick={() => setView('admin')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-[13px] transition-all ${
              currentView === 'admin'
                ? 'bg-navy-800 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Panel de Administración
          </button>
        )}
      </div>

      {/* Menú Lateral y Acciones Rápidas */}
      <div className="flex items-center gap-4">
        {/* Carrito de Compras (Flotante y Reactivo) */}
        {currentView === 'catalog' && (
          <motion.button
            onClick={toggleCart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm text-slate-700 flex items-center justify-center cursor-pointer"
          >
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-ideal rounded-full shadow-md shadow-ideal/20"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}

        {/* Móvil: Botón rápido de Admin */}
        {isAdmin && (
          <button
            onClick={() => setView(currentView === 'catalog' ? 'admin' : 'catalog')}
            className="md:hidden p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            {currentView === 'catalog' ? <LayoutDashboard className="h-5 w-5" /> : <Store className="h-5 w-5" />}
          </button>
        )}

        {/* Separador */}
        <div className="h-6 w-[1px] bg-slate-200" />

        {/* Perfil del Usuario y Cierre de Sesión */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 select-none">
            {perfil?.avatar_url ? (
              <img
                src={perfil.avatar_url}
                alt={perfil.nombre_completo || 'Usuario'}
                className="w-10 h-10 rounded-full border border-slate-200 shadow-sm object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-ideal/10 text-ideal border border-ideal/20 flex items-center justify-center">
                <UserIcon className="h-5 w-5" />
              </div>
            )}
            
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-semibold text-slate-800 text-[13px] leading-tight max-w-[120px] truncate">
                {perfil?.nombre_completo || 'Cliente Ideal'}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                isAdmin ? 'text-indigo-600' : 'text-slate-400'
              }`}>
                {perfil?.rol || 'Cliente'}
              </span>
            </div>
          </div>

          {/* Botón de Logout */}
          <motion.button
            onClick={signOut}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors border border-slate-200/50 flex items-center justify-center cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="h-4.5 w-4.5" />
          </motion.button>
        </div>
      </div>
    </nav>
  );
};
