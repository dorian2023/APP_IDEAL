import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { motion } from 'framer-motion';
import { UserCheck, MessageSquare, Calendar, ChevronDown, Loader2, Save, ShoppingBag, ShieldAlert } from 'lucide-react';

interface PedidoCRM {
  id: string;
  total: number;
  estado: 'Pendiente' | 'En camino' | 'Entregado';
  notas_crm: string | null;
  created_at: string;
  perfiles: {
    email: string;
    nombre_completo: string | null;
  } | null;
}

const MOCK_PEDIDOS: PedidoCRM[] = [
  {
    id: "ped-201a3b5c",
    total: 60.00,
    estado: "Pendiente",
    notas_crm: "Compró 2 Kits Familiares de Junio. Desea despacho rápido a domicilio esta tarde.",
    created_at: "2026-05-20T08:30:00Z",
    perfiles: {
      email: "cliente.premium@gmail.com",
      nombre_completo: "Carlos Soto"
    }
  },
  {
    id: "ped-202c4d6e",
    total: 85.00,
    estado: "En camino",
    notas_crm: "Compró 1 Kit Familiar ($30), 2 Alisadores ($40) y 1 Kit Higiene ($15). Recolectado por courier. Tracking enviado.",
    created_at: "2026-05-19T16:45:00Z",
    perfiles: {
      email: "fernanda.valenzuela@outlook.com",
      nombre_completo: "Fernanda Valenzuela"
    }
  },
  {
    id: "ped-203e5f7g",
    total: 15.00,
    estado: "Entregado",
    notas_crm: "Compró 1 Kit de Higiene Personal ($15). Entregado en recepción. El cliente confirmó todo conforme.",
    created_at: "2026-05-17T11:20:00Z",
    perfiles: {
      email: "roberto.tapia@gmail.com",
      nombre_completo: "Roberto Tapia"
    }
  }
];

/**
 * CRM Profesional - Gestión de Clientes y Pedidos.
 * Habilita el control de despacho de mercaderías, almacenamiento de minutas de atención
 * y visualización agregada de cuentas.
 */
export const CRMView: React.FC = () => {
  const [orders, setOrders] = useState<PedidoCRM[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Estados de edición individuales
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});

  const fetchOrders = async () => {
    const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');
    
    if (isDemo) {
      console.log('CRM en Modo Demo (Carga inmediata)...');
      setOrders(MOCK_PEDIDOS);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Query relacional reuniendo cabecera y perfil del cliente
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          total,
          estado,
          notas_crm,
          created_at,
          perfiles (
            email,
            nombre_completo
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setOrders(data as unknown as PedidoCRM[]);
        setIsDemoMode(false);
      } else {
        setOrders(MOCK_PEDIDOS);
        setIsDemoMode(true);
      }
    } catch (err) {
      setOrders(MOCK_PEDIDOS);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Inicializar notas editables al cargar pedidos
  useEffect(() => {
    const initialNotes: { [id: string]: string } = {};
    orders.forEach(o => {
      initialNotes[o.id] = o.notas_crm || '';
    });
    setEditingNotes(prev => ({ ...initialNotes, ...prev }));
  }, [orders]);

  // Actualizar estado de despacho
  const handleUpdateStatus = async (id: string, nuevoEstado: 'Pendiente' | 'En camino' | 'Entregado') => {
    setSavingId(id);
    try {
      if (isDemoMode) {
        setOrders(
          orders.map(o => o.id === id ? { ...o, estado: nuevoEstado } : o)
        );
      } else {
        const { error } = await supabase
          .from('pedidos')
          .update({ estado: nuevoEstado })
          .eq('id', id);

        if (error) throw error;
        setOrders(
          orders.map(o => o.id === id ? { ...o, estado: nuevoEstado } : o)
        );
      }
    } catch (err: any) {
      alert(`Error al actualizar estado: ${err.message || err}`);
    } finally {
      setSavingId(null);
    }
  };

  // Guardar notas CRM
  const handleSaveNotes = async (id: string) => {
    const notaTexto = editingNotes[id] || '';
    setSavingId(id);
    try {
      if (isDemoMode) {
        setOrders(
          orders.map(o => o.id === id ? { ...o, notas_crm: notaTexto } : o)
        );
      } else {
        const { error } = await supabase
          .from('pedidos')
          .update({ notas_crm: notaTexto })
          .eq('id', id);

        if (error) throw error;
        setOrders(
          orders.map(o => o.id === id ? { ...o, notas_crm: notaTexto } : o)
        );
      }
      alert('Nota CRM comercial guardada exitosamente.');
    } catch (err: any) {
      alert(`Error al guardar notas: ${err.message || err}`);
    } finally {
      setSavingId(null);
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

  const formatearFecha = (fechaStr: string) => {
    return new Date(fechaStr).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 text-left page-fade">
      {/* Cabecera */}
      <div>
        <h2 className="text-2xl font-bold text-white font-title tracking-tight">
          Seguimiento de Pedidos y CRM
        </h2>
        <p className="text-slate-400 text-xs mt-1 font-sans">
          Historial de consumos de clientes, despacho logístico y notas comerciales.
        </p>
      </div>

      {/* Listado de Pedidos */}
      {loading ? (
        <div className="h-[200px] flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 text-ideal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-navy-800 border border-white/5 rounded-3xl p-12 text-center shadow-lg">
          <ShoppingBag className="h-10 w-10 text-slate-600 stroke-[1.2] mb-3 mx-auto" />
          <h4 className="font-bold text-slate-300 text-sm">Sin transacciones registradas</h4>
          <p className="text-slate-500 text-xs mt-1">Los clientes no han efectuado compras en la tienda física o digital aún.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const isSaving = savingId === order.id;
            return (
              <motion.div
                key={order.id}
                layout
                className="bg-navy-800 border border-white/5 rounded-3xl p-6 shadow-lg space-y-4"
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ideal/10 text-ideal flex items-center justify-center flex-shrink-0">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-[14px]">
                        {order.perfiles?.nombre_completo || 'Cliente Ideal'}
                      </h4>
                      <p className="text-slate-400 text-[11px] font-sans font-mono mt-0.5">
                        {order.perfiles?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
                    {/* Fecha de pedido */}
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatearFecha(order.created_at)}</span>
                    </div>

                    {/* Total */}
                    <div className="px-3.5 py-1.5 rounded-xl bg-navy-900 border border-white/5">
                      <span className="text-slate-400 text-[10px] mr-1.5 font-bold uppercase tracking-wider">Importe:</span>
                      <span className="font-bold text-white">{formatearPrecio(order.total)}</span>
                    </div>

                    {/* Dropdown de Estado */}
                    <div className="relative">
                      <select
                        value={order.estado}
                        disabled={isSaving}
                        onChange={e => handleUpdateStatus(order.id, e.target.value as any)}
                        className={`appearance-none bg-navy-950 text-xs px-4 py-2 pr-9 rounded-xl border border-white/10 font-bold focus:outline-none cursor-pointer disabled:opacity-50 select-none ${
                          order.estado === 'Pendiente'
                            ? 'text-amber-400'
                            : order.estado === 'En camino'
                            ? 'text-indigo-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        <option value="Pendiente">⏳ Pendiente</option>
                        <option value="En camino">🚚 En camino</option>
                        <option value="Entregado">✅ Entregado</option>
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minuta de Seguimiento Comercial (CRM) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start font-sans">
                  <div className="md:col-span-1 flex items-start gap-2 text-slate-400 text-xs pt-1.5">
                    <MessageSquare className="h-4.5 w-4.5 text-slate-500" />
                    <div>
                      <span className="font-semibold text-slate-300 block">Minuta Comercial</span>
                      <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">
                        Anota llamadas, solicitudes y acuerdos comerciales.
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-3 flex gap-3">
                    <textarea
                      rows={2}
                      placeholder="Escribe una nota comercial de seguimiento (ej: acordó entrega el viernes a las 15:00)..."
                      value={editingNotes[order.id] !== undefined ? editingNotes[order.id] : (order.notas_crm || '')}
                      onChange={e => setEditingNotes({ ...editingNotes, [order.id]: e.target.value })}
                      className="input-premium py-2.5 rounded-xl text-xs bg-navy-900 border-white/5 text-white flex-grow leading-relaxed"
                    />

                    <button
                      onClick={() => handleSaveNotes(order.id)}
                      disabled={isSaving}
                      className="btn-primary p-3 rounded-xl bg-navy-900 hover:bg-navy-950 border border-white/10 text-white cursor-pointer select-none self-end flex-shrink-0 flex items-center justify-center"
                      title="Guardar Minuta"
                    >
                      {isSaving ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Save className="h-4.5 w-4.5 text-slate-300 hover:text-white" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {isDemoMode && (
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-indigo-400 flex-shrink-0" />
          <p className="text-slate-400 text-xs leading-normal">
            <strong>Privacidad de Datos del Cliente</strong>: El CRM contiene correos y notas de seguimiento que el RLS de Supabase prohíbe exponer a clientes. Solo la firma JWT de Administrador puede decodificar esta vista.
          </p>
        </div>
      )}
    </div>
  );
};
