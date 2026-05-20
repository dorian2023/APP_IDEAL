import React from 'react';
import { useCart } from '../../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutSuccess: (pedidoId: string, items: any[], total: number) => void;
}

/**
 * Panel Desplegable (Drawer) del Carrito de Compras.
 * Implementa animaciones fluidas de Framer Motion, manipulación táctil, 
 * y checkout blindado de alta fidelidad.
 */
export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckoutSuccess }) => {
  const { cart, updateQuantity, removeFromCart, cartTotal, checkout, loadingCheckout } = useCart();

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    // Capturamos la información actual del carrito para pasarla al recibo
    // ya que la función checkout vaciará el carrito al completarse con éxito
    const cartItemsSnapshot = cart.map(item => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio_unitario: item.precio_venta
    }));
    const totalSnapshot = cartTotal;

    try {
      const pedidoId = await checkout();
      onClose();
      // Notificar éxito al componente raíz para mostrar la Nota Digital
      onCheckoutSuccess(pedidoId, cartItemsSnapshot, totalSnapshot);
    } catch (err: any) {
      alert(`Error al procesar el pedido: ${err.message || err}`);
    }
  };

  // Formatear precio
  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(valor);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Translúcido con desenfoque de fondo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Panel Lateral Deslizante */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[460px] bg-white shadow-2xl border-l border-slate-100 flex flex-col"
          >
            {/* Cabecera del Drawer */}
            <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100 flex-shrink-0 text-left">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-ideal" />
                <h2 className="text-lg font-bold text-slate-800 font-title">
                  Tu Carrito
                </h2>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Listado de Productos */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 text-left">
              {cart.length === 0 ? (
                /* Estado Vacío de Alta Fidelidad */
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                    <ShoppingBag className="h-6 w-6 stroke-[1.2]" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-[14px]">
                    El carrito está vacío
                  </h3>
                  <p className="text-slate-400 text-[12px] leading-normal max-w-[220px] mt-1">
                    Explora el catálogo premium y añade tus artículos predilectos.
                  </p>
                </div>
              ) : (
                /* Tarjetas de Producto en Carrito */
                cart.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="flex gap-4 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50/50 transition-colors bg-white/50"
                  >
                    {/* Miniatura de Imagen */}
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      {item.imagen_url ? (
                        <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                          <ShoppingBag className="h-6 w-6 stroke-[1.2]" />
                        </div>
                      )}
                    </div>

                    {/* Datos y Acciones */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-[13px] text-slate-800 line-clamp-1">
                          {item.nombre}
                        </h4>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex justify-between items-end mt-2">
                        {/* Selector de Cantidades Reactivo */}
                        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
                          <button
                            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          
                          <span className="min-w-[20px] text-center text-xs font-semibold text-slate-800">
                            {item.cantidad}
                          </span>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                            disabled={item.cantidad >= item.stock}
                            className={`w-6 h-6 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer ${
                              item.cantidad >= item.stock ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Subtotal del Item */}
                        <span className="font-bold text-[14px] text-slate-800 tracking-tight">
                          {formatearPrecio(item.precio_venta * item.cantidad)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Panel de Resumen de Pago y Checkout */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-100 flex-shrink-0 bg-slate-50/50 text-left">
                {/* Total Desglosado */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Importe Estimado
                    </span>
                    <span className="text-[10px] text-indigo-500 font-semibold mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Servidor Validado
                    </span>
                  </div>
                  <span className="text-xl font-bold text-slate-900 tracking-tight font-title">
                    {formatearPrecio(cartTotal)}
                  </span>
                </div>

                {/* Botón de Checkout Segurizado */}
                <button
                  onClick={handleCheckout}
                  disabled={loadingCheckout}
                  className="w-full btn-primary select-none cursor-pointer py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-ideal/10 text-[14px]"
                >
                  {loadingCheckout ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Validando Pedido...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4.5 w-4.5" />
                      Autorizar y Enviar Pedido
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
