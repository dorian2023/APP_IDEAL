import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Key, Calendar, ShoppingBag, CheckCircle, Clock, Truck, ShieldAlert, Sparkles } from 'lucide-react';
import { supabase } from '../config/supabase';
import type { Perfil } from '../auth/AuthProvider';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  perfil: Perfil | null;
  userEmail: string;
  onProfileUpdated?: () => void;
}

interface OrderHistoryItem {
  id: string;
  total: number;
  estado: string;
  created_at: string;
  detalles?: Array<{
    id: string;
    cantidad: number;
    precio_unitario: number;
    producto?: {
      nombre: string;
      imagen_url: string;
    }
  }>;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  perfil,
  userEmail,
  onProfileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'security'>('info');
  const [nombre, setNombre] = useState(perfil?.nombre_completo || '');
  const [telefono, setTelefono] = useState(perfil?.telefono || '');
  const [direccion, setDireccion] = useState(perfil?.direccion || '');
  const [avatarUrl, setAvatarUrl] = useState(perfil?.avatar_url || '');
  
  // Security
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status states
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Orders
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Sync state when profile changes
  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombre_completo || '');
      setTelefono(perfil.telefono || '');
      setDireccion(perfil.direccion || '');
      setAvatarUrl(perfil.avatar_url || '');
    }
  }, [perfil]);

  // Load orders history
  useEffect(() => {
    if (isOpen && perfil?.id) {
      fetchOrderHistory();
    }
  }, [isOpen, perfil]);

  const fetchOrderHistory = async () => {
    const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');
    if (isDemo) {
      // Mock orders for high-end preview
      setOrders([
        {
          id: 'ped-8092-2026',
          total: 120.00,
          estado: 'Entregado',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          detalles: [
            {
              id: 'det-1',
              cantidad: 1,
              precio_unitario: 120.00,
              producto: {
                nombre: 'Kit Familiar Ideal (11 Productos)',
                imagen_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=300&auto=format&fit=crop'
              }
            }
          ]
        },
        {
          id: 'ped-7712-2026',
          total: 85.50,
          estado: 'En camino',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          detalles: [
            {
              id: 'det-2',
              cantidad: 2,
              precio_unitario: 42.75,
              producto: {
                nombre: 'Kit de Higiene Personal Ideal',
                imagen_url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=300&auto=format&fit=crop'
              }
            }
          ]
        }
      ]);
      return;
    }

    try {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          total,
          estado,
          created_at,
          detalles_pedido (
            id,
            cantidad,
            precio_unitario,
            productos (
              nombre,
              imagen_url
            )
          )
        `)
        .eq('cliente_id', perfil?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map details properly
        const mappedOrders: OrderHistoryItem[] = data.map((o: any) => ({
          id: o.id,
          total: Number(o.total),
          estado: o.estado,
          created_at: o.created_at,
          detalles: o.detalles_pedido?.map((d: any) => ({
            id: d.id,
            cantidad: d.cantidad,
            precio_unitario: Number(d.precio_unitario),
            producto: d.productos ? {
              nombre: d.productos.nombre,
              imagen_url: d.productos.imagen_url
            } : undefined
          }))
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');

    if (isDemo) {
      setTimeout(() => {
        setSaving(false);
        setMessage({ text: 'Perfil actualizado con éxito (Modo Demo)', type: 'success' });
        if (onProfileUpdated) onProfileUpdated();
      }, 800);
      return;
    }

    try {
      // 1. Update the perfiles table
      const { error } = await supabase
        .from('perfiles')
        .update({
          nombre_completo: nombre,
          telefono: telefono,
          direccion: direccion,
          avatar_url: avatarUrl
        })
        .eq('id', perfil?.id);

      if (error) {
        // En caso de que las columnas telefono o direccion no existan en la tabla física de perfiles todavía,
        // intentamos guardar solo nombre_completo y avatar_url para no romper el flujo
        console.warn('Fallo al actualizar perfil completo, reintentando con campos mínimos...', error.message);
        const { error: retryError } = await supabase
          .from('perfiles')
          .update({
            nombre_completo: nombre,
            avatar_url: avatarUrl
          })
          .eq('id', perfil?.id);
        
        if (retryError) throw retryError;

        // Intentamos guardar tlf y direccion en la metadata de autenticación de Supabase como fallback
        await supabase.auth.updateUser({
          data: {
            phone: telefono,
            address: direccion,
            full_name: nombre,
            avatar_url: avatarUrl
          }
        });
      } else {
        // Si sale bien, también actualizamos la metadata de Supabase Auth
        await supabase.auth.updateUser({
          data: {
            full_name: nombre,
            avatar_url: avatarUrl
          }
        });
      }

      setMessage({ text: '¡Perfil actualizado exitosamente!', type: 'success' });
      if (onProfileUpdated) onProfileUpdated();
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      setMessage({ text: err.message || 'Error al guardar los cambios.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Las contraseñas nuevas no coinciden.', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ text: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');

    if (isDemo) {
      setTimeout(() => {
        setSaving(false);
        setMessage({ text: 'Contraseña cambiada con éxito (Modo Demo)', type: 'success' });
        setNewPassword('');
        setConfirmPassword('');
      }, 800);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ text: '¡Contraseña actualizada con éxito!', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error al cambiar contraseña:', err);
      setMessage({ text: err.message || 'Error al cambiar la contraseña.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Selector rápido de avatar premium (Demo)
  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=150&auto=format&fit=crop'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop con blur profundo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Contenedor Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white/95 border border-slate-100 shadow-2xl rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col z-10 relative"
          >
            {/* Header con el Logo Ideal oficial de Compra Ideal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-white shadow-sm rounded-full border border-slate-100/50 flex items-center justify-center overflow-hidden w-11 h-11">
                  <img src="/logo.png" alt="Logo Ideal" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-title font-extrabold text-slate-800 text-lg flex items-center gap-1.5">
                    Perfil del Cliente <Sparkles className="h-4 w-4 text-ideal" />
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans tracking-wide">
                    Gestiona tus datos, compras y seguridad en Compra Ideal
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-slate-150/50 cursor-pointer shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Pestañas de Navegación */}
            <div className="flex border-b border-slate-100 bg-white p-2 gap-1.5">
              <button
                onClick={() => { setActiveTab('info'); setMessage(null); }}
                className={`flex-1 py-3 px-4 rounded-2xl text-[12px] font-bold tracking-wide uppercase transition-all duration-250 flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'info'
                    ? 'bg-ideal text-white shadow-md shadow-ideal/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <User className="h-4.5 w-4.5" /> Mi Información
              </button>
              <button
                onClick={() => { setActiveTab('orders'); setMessage(null); }}
                className={`flex-1 py-3 px-4 rounded-2xl text-[12px] font-bold tracking-wide uppercase transition-all duration-250 flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-ideal text-white shadow-md shadow-ideal/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <ShoppingBag className="h-4.5 w-4.5" /> Mis Compras
              </button>
              <button
                onClick={() => { setActiveTab('security'); setMessage(null); }}
                className={`flex-1 py-3 px-4 rounded-2xl text-[12px] font-bold tracking-wide uppercase transition-all duration-250 flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-ideal text-white shadow-md shadow-ideal/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Key className="h-4.5 w-4.5" /> Seguridad
              </button>
            </div>

            {/* Cuerpo del Modal (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
              {/* Notificaciones */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl text-xs font-semibold mb-6 flex items-center gap-2.5 ${
                    message.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                      : 'bg-red-50 text-red-700 border border-red-200/50'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  {message.text}
                </motion.div>
              )}

              {/* TAB 1: MI INFORMACIÓN */}
              {activeTab === 'info' && (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Foto de Perfil / Selector de Avatar */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-white border border-slate-100 rounded-3xl">
                    <div className="relative group">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full object-cover border-2 border-ideal shadow-md"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-ideal/5 text-ideal border-2 border-dashed border-ideal/20 flex flex-col items-center justify-center gap-1">
                          <User className="h-10 w-10 opacity-40" />
                          <span className="text-[10px] text-slate-400">Sin Foto</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 w-full text-center sm:text-left space-y-2">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Personaliza tu Imagen de Perfil
                      </label>
                      <input
                        type="url"
                        placeholder="Pega la URL de tu imagen..."
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200/70 rounded-xl focus:outline-none focus:border-ideal focus:bg-white transition-all font-sans text-slate-600"
                      />
                      
                      {/* Presets Rápidos */}
                      <div className="space-y-1">
                        <span className="block text-[9px] text-slate-450 font-semibold">O elige un avatar preestablecido:</span>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                          {PRESET_AVATARS.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setAvatarUrl(url)}
                              className={`w-8 h-8 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                                avatarUrl === url ? 'border-ideal scale-110 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={url} alt="preset" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campos de texto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Nombre Completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 text-xs bg-white border border-slate-200/70 rounded-2xl focus:outline-none focus:border-ideal focus:ring-1 focus:ring-ideal/20 transition-all font-sans text-slate-700"
                          placeholder="Tu Nombre"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        disabled
                        value={userEmail}
                        className="w-full px-4 py-3.5 text-xs bg-slate-100 border border-slate-200/50 rounded-2xl font-sans text-slate-400 cursor-not-allowed"
                        title="El correo no se puede modificar"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Número de Teléfono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 text-xs bg-white border border-slate-200/70 rounded-2xl focus:outline-none focus:border-ideal focus:ring-1 focus:ring-ideal/20 transition-all font-sans text-slate-700"
                          placeholder="Ej: +58 412 1234567"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Rol asignado
                      </label>
                      <span className={`block px-4 py-3.5 text-xs rounded-2xl font-bold uppercase tracking-wider border font-title ${
                        perfil?.rol === 'admin' 
                          ? 'bg-amber-500/5 border-amber-250/20 text-amber-600' 
                          : 'bg-indigo-500/5 border-indigo-250/20 text-indigo-600'
                      }`}>
                        {perfil?.rol === 'admin' ? '👑 Administrador Comercial' : '👤 Cliente Preferencial'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Dirección de Entrega
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 text-xs bg-white border border-slate-200/70 rounded-2xl focus:outline-none focus:border-ideal focus:ring-1 focus:ring-ideal/20 transition-all font-sans text-slate-700"
                        placeholder="Ej: Calle Principal, Res. El Parral, Torre A, Apto 5B"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-3.5 rounded-2xl bg-ideal text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md shadow-ideal/10 hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </motion.button>
                  </div>
                </form>
              )}

              {/* TAB 2: MIS COMPRAS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {loadingOrders ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <svg className="animate-spin h-8 w-8 text-ideal mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs text-slate-400 font-sans">Consultando historial comercial...</span>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-12 px-6 bg-white border border-slate-100 rounded-3xl text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-350">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <h4 className="font-title font-bold text-slate-800 text-sm">Aún no tienes compras registradas</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans leading-relaxed">
                        Explora nuestro catálogo premium y realiza tu primer pedido. ¡Te encantará nuestra rapidez y calidad!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-200 transition-colors">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 pb-3">
                            <div className="space-y-0.5 text-left">
                              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">ID PEDIDO</span>
                              <span className="font-mono text-xs text-slate-700 font-bold">{order.id}</span>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="space-y-0.5 text-right sm:text-left">
                                <span className="text-[10px] font-bold text-slate-400 tracking-wider block">FECHA</span>
                                <span className="text-xs text-slate-600 font-sans flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  {new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>

                              <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                                order.estado === 'Entregado'
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                  : order.estado === 'En camino'
                                  ? 'bg-sky-50 border-sky-100 text-sky-600'
                                  : 'bg-amber-50 border-amber-100 text-amber-600'
                              }`}>
                                {order.estado === 'Entregado' && <CheckCircle className="h-3 w-3" />}
                                {order.estado === 'En camino' && <Truck className="h-3 w-3" />}
                                {order.estado === 'Pendiente' && <Clock className="h-3 w-3" />}
                                {order.estado}
                              </span>
                            </div>
                          </div>

                          {/* Productos en el Pedido */}
                          <div className="space-y-2">
                            {order.detalles?.map((det) => (
                              <div key={det.id} className="flex items-center gap-3">
                                {det.producto?.imagen_url ? (
                                  <img
                                    src={det.producto.imagen_url}
                                    alt={det.producto.nombre}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                    <ShoppingBag className="h-4.5 w-4.5" />
                                  </div>
                                )}
                                <div className="flex-1 text-left">
                                  <h5 className="text-xs font-bold text-slate-700 line-clamp-1">{det.producto?.nombre || 'Producto Ideal'}</h5>
                                  <span className="text-[10px] text-slate-400 font-sans">
                                    {det.cantidad} {det.cantidad > 1 ? 'unidades' : 'unidad'} x ${det.precio_unitario.toFixed(2)}
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-slate-800">
                                  ${(det.cantidad * det.precio_unitario).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Total General */}
                          <div className="flex justify-between items-center bg-slate-50/50 rounded-2xl px-4 py-3 border border-slate-100/50">
                            <span className="text-xs text-slate-500 font-sans">Total abonado</span>
                            <span className="text-sm font-extrabold text-slate-800">${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CAMBIAR CLAVE / SEGURIDAD */}
              {activeTab === 'security' && (
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <div className="bg-amber-50/60 border border-amber-200/50 rounded-3xl p-4 flex gap-3 text-left">
                    <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Protege tu Cuenta</h4>
                      <p className="text-[11px] text-amber-700/80 font-sans leading-relaxed">
                        Te sugerimos utilizar una clave segura que contenga letras, números y caracteres especiales. Nunca compartas tus claves con terceros.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Contraseña Nueva
                      </label>
                      <div className="relative">
                        <Key className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 text-xs bg-white border border-slate-200/70 rounded-2xl focus:outline-none focus:border-ideal focus:ring-1 focus:ring-ideal/20 transition-all font-sans text-slate-700"
                          placeholder="Clave nueva (mínimo 6 caracteres)"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Confirmar Contraseña Nueva
                      </label>
                      <div className="relative">
                        <Key className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 text-xs bg-white border border-slate-200/70 rounded-2xl focus:outline-none focus:border-ideal focus:ring-1 focus:ring-ideal/20 transition-all font-sans text-slate-700"
                          placeholder="Reescribe tu nueva clave"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-3.5 rounded-2xl bg-ideal text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md shadow-ideal/10 hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                      {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
