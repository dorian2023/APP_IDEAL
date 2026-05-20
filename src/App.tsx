import React, { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { CartProvider } from './hooks/useCart';
import { LoginView } from './auth/LoginView';
import { Navbar } from './components/Navbar';
import { CatalogView } from './features/catalog/CatalogView';
import { CartDrawer } from './features/catalog/CartDrawer';
import { Receipt } from './components/Receipt';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AnimatePresence } from 'framer-motion';

/**
 * Cuerpo principal de la aplicación.
 * Sincroniza de forma limpia la autenticación con el enrutamiento de vistas 
 * y los estados del carrito transaccional.
 */
const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setView] = useState<'catalog' | 'admin'>('catalog');
  const [cartOpen, setCartOpen] = useState(false);
  
  // Control de la Nota Digital (Recibo)
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    pedidoId: string;
    items: any[];
    total: number;
  } | null>(null);

  // Callback exitoso al confirmar un pedido seguro por RPC
  const handleCheckoutSuccess = (pedidoId: string, items: any[], total: number) => {
    setReceiptData({ pedidoId, items, total });
    setShowReceipt(true);
  };

  // Carga inicial del estado JWT de Supabase
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <svg className="animate-spin h-8 w-8 text-ideal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Interrumpir si no hay sesión activa: Mostrar Login de Alta Gama
  if (!user) {
    return <LoginView />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      currentView === 'admin' ? 'bg-navy-900' : 'bg-slate-50'
    }`}>
      {/* Barra de Navegación Global */}
      <Navbar currentView={currentView} setView={setView} toggleCart={() => setCartOpen(true)} />

      {/* Ruteo de Visualización */}
      {currentView === 'catalog' ? (
        <CatalogView />
      ) : (
        <AdminDashboard setView={setView} />
      )}

      {/* Drawer Lateral del Carrito */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      {/* Modal de Nota Digital / Recibo con animación de desvanecimiento */}
      <AnimatePresence>
        {showReceipt && receiptData && (
          <Receipt
            pedidoId={receiptData.pedidoId}
            items={receiptData.items}
            total={receiptData.total}
            onClose={() => setShowReceipt(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Punto de Entrada Superior de la Aplicación.
 * Inyecta los contextos globales de Autenticación y Carrito de Compras.
 */
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
}
