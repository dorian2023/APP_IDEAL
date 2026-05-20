import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer, X, ShieldCheck, Sparkles } from 'lucide-react';

interface ReceiptItem {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

interface ReceiptProps {
  pedidoId: string;
  items: ReceiptItem[];
  total: number;
  onClose: () => void;
}

/**
 * Nota Digital (Generador de Recibo Premium y de Lujo).
 * Muestra el pedido procesado en un formato minimalista y elegante, 
 * optimizado para impresión web o exportación rápida a PDF.
 */
export const Receipt: React.FC<ReceiptProps> = ({ pedidoId, items, total, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  // Formatear precio
  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(valor);
  };

  const fechaActual = new Date().toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4 print:p-0 overflow-y-auto">
      {/* Tarjeta de Recibo con Animación de Desenvolvimiento */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        ref={receiptRef}
        className="w-full max-w-[500px] bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 relative print:shadow-none print:border-none print:m-0 print:p-6 print:max-w-full my-auto"
      >
        {/* Cabecera / Botón Cerrar (Escondido en Impresión) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors print:hidden cursor-pointer flex items-center justify-center"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Branding */}
        <div className="text-center mb-6 pt-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ideal/10 text-ideal mb-3 print:bg-slate-100 print:text-slate-800">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-title">
            Ideal
          </h2>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5 tracking-wider uppercase">
            Nota Digital de Pedido
          </p>
        </div>

        {/* Divisor Estilo Papel Térmico */}
        <div className="border-t-2 border-dashed border-slate-200 my-4" />

        {/* Metadatos del Recibo */}
        <div className="space-y-2 text-[12px] text-slate-500 font-sans text-left">
          <div className="flex justify-between">
            <span className="font-medium text-slate-400">ID de Transacción:</span>
            <span className="font-mono font-semibold text-slate-800 uppercase">{pedidoId.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-400">Fecha y Hora:</span>
            <span className="font-semibold text-slate-800">{fechaActual}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-400">Estado de Operación:</span>
            <span className="font-bold text-emerald-500 bg-emerald-50 px-2.5 py-0.5 rounded-full print:bg-transparent print:p-0">
              Procesado
            </span>
          </div>
        </div>

        {/* Divisor Estilo Papel Térmico */}
        <div className="border-t-2 border-dashed border-slate-200 my-4" />

        {/* Desglose de Ítems */}
        <div className="space-y-4 my-6 text-left">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
            Detalle de Artículos
          </span>
          <div className="space-y-3 font-sans">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start gap-4 text-[13px]">
                <div className="flex gap-2">
                  <span className="font-bold text-ideal print:text-slate-800">{item.cantidad}x</span>
                  <span className="text-slate-700 font-medium">{item.nombre}</span>
                </div>
                <span className="font-semibold text-slate-800 flex-shrink-0">
                  {formatearPrecio(item.precio_unitario * item.cantidad)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Divisor Estilo Papel Térmico */}
        <div className="border-t-2 border-dashed border-slate-200 my-4" />

        {/* Total Final Calculado en Servidor */}
        <div className="flex items-center justify-between py-2 text-left">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Total Autorizado
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold mt-0.5 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Servidor Validado
            </span>
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-title">
            {formatearPrecio(total)}
          </span>
        </div>

        {/* Divisor Estilo Papel Térmico */}
        <div className="border-t-2 border-dashed border-slate-200 my-4" />

        {/* Notas de Seguridad */}
        <div className="bg-slate-50/80 rounded-2xl p-4 mt-6 text-[11px] text-slate-500 font-sans text-center print:bg-transparent print:p-0">
          <p className="leading-relaxed">
            Este documento representa un comprobante digital oficial de compra de **Ideal**. Consérvalo para cualquier trámite o seguimiento de despacho.
          </p>
        </div>

        {/* Acciones de Impresión (Escondidas en Impresión) */}
        <div className="flex items-center gap-3 mt-8 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary text-xs cursor-pointer py-3 rounded-2xl select-none"
          >
            Cerrar Recibo
          </button>
          
          <button
            onClick={handlePrint}
            className="flex-1 btn-primary text-xs cursor-pointer py-3 rounded-2xl select-none"
          >
            <Printer className="h-4 w-4" />
            Imprimir / PDF
          </button>
        </div>
      </motion.div>
    </div>
  );
};
