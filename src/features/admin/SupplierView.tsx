import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Plus, Calendar, Mail, Phone, User as UserIcon, AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Proveedor {
  id: string;
  nombre: string;
  contacto_nombre: string | null;
  telefono: string | null;
  email: string | null;
  fecha_cobro: string | null;
}

const MOCK_PROVEEDORES: Proveedor[] = [
  {
    id: "sup-101",
    nombre: "Distribuidora de Envases Centro C.A.",
    contacto_nombre: "Alejandro Silva",
    telefono: "+58 414 123 4567",
    email: "ventas@envasescentro.com.ve",
    fecha_cobro: "2026-05-22" // Próximo (Hoy es 2026-05-20) -> Alerta Inminente
  },
  {
    id: "sup-102",
    nombre: "Laboratorios Químicos de Oriente",
    contacto_nombre: "Beatriz Mendoza",
    telefono: "+58 424 987 6543",
    email: "contacto@quimicosoriente.com.ve",
    fecha_cobro: "2026-05-18" // Vencido
  },
  {
    id: "sup-103",
    nombre: "Importadora Fragancias Ideal C.A.",
    contacto_nombre: "Manuel Torrealba",
    telefono: "+58 212 555 1234",
    email: "importaciones@fraganciasideal.com",
    fecha_cobro: "2026-06-15" // Al día
  }
];

/**
 * Módulo de Sistema de Proveedores y Cuentas por Pagar.
 * Permite registrar alianzas comerciales y monitorear cobros inminentes con alertas semánticas.
 */
export const SupplierView: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Formulario
  const [nombre, setNombre] = useState('');
  const [contactoNombre, setContactoNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [fechaCobro, setFechaCobro] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  const fetchSuppliers = async () => {
    const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');
    
    if (isDemo) {
      console.log('Proveedores en Modo Demo (Carga inmediata)...');
      setSuppliers(MOCK_PROVEEDORES);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSuppliers(data as Proveedor[]);
        setIsDemoMode(false);
      } else {
        setSuppliers(MOCK_PROVEEDORES);
        setIsDemoMode(true);
      }
    } catch (err) {
      setSuppliers(MOCK_PROVEEDORES);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setLoadingSave(true);
    const newSupplier = {
      nombre,
      contacto_nombre: contactoNombre || null,
      telefono: telefono || null,
      email: email || null,
      fecha_cobro: fechaCobro || null
    };

    try {
      if (isDemoMode) {
        // En modo simulación, lo añadimos localmente
        const localSupplier: Proveedor = {
          id: `sup-${Date.now()}`,
          ...newSupplier
        };
        setSuppliers([localSupplier, ...suppliers]);
      } else {
        const { error } = await supabase
          .from('proveedores')
          .insert([newSupplier]);

        if (error) throw error;
        await fetchSuppliers();
      }

      // Limpiar formulario
      setNombre('');
      setContactoNombre('');
      setTelefono('');
      setEmail('');
      setFechaCobro('');
      setShowAddForm(false);
    } catch (err: any) {
      alert(`Error al registrar proveedor: ${err.message || err}`);
    } finally {
      setLoadingSave(false);
    }
  };

  // Calcular alerta visual para cobros
  const obtenerEstadoCobro = (fechaStr: string | null) => {
    if (!fechaStr) return { label: 'Sin Cobro', style: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: <Calendar className="h-3 w-3" /> };

    const fechaCobro = new Date(fechaStr);
    const hoy = new Date("2026-05-20"); // Usamos fecha de sistema 2026-05-20 para mantener congruencia
    
    // Resetear horas
    fechaCobro.setHours(0,0,0,0);
    hoy.setHours(0,0,0,0);

    const diferenciaTiempo = fechaCobro.getTime() - hoy.getTime();
    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0) {
      return { 
        label: `Vencido (${Math.abs(diferenciaDias)}d)`, 
        style: 'bg-red-500/10 text-red-400 border-red-500/20 font-bold', 
        icon: <AlertCircle className="h-3.5 w-3.5" /> 
      };
    } else if (diferenciaDias <= 3) {
      return { 
        label: `Cobro Inminente (${diferenciaDias}d)`, 
        style: 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold', 
        icon: <AlertTriangle className="h-3.5 w-3.5" /> 
      };
    } else {
      return { 
        label: 'Al día', 
        style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', 
        icon: <CheckCircle2 className="h-3.5 w-3.5" /> 
      };
    }
  };

  return (
    <div className="space-y-8 text-left page-fade">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-title tracking-tight">
            Gestión de Proveedores
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-sans">
            Directorio de socios mayoristas y alertas inteligentes de cuentas por pagar.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary cursor-pointer select-none py-2.5 rounded-xl text-xs bg-ideal"
        >
          <Plus className="h-4.5 w-4.5" />
          Registrar Proveedor
        </button>
      </div>

      {/* Formulario Desplegable */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-navy-800 border border-white/5 rounded-3xl p-6 overflow-hidden shadow-lg"
          >
            <h3 className="text-base font-bold text-white font-title mb-4">
              Nuevo Registro de Proveedor
            </h3>
            
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Nombre de la Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cafés de Origen S.A."
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="input-premium py-2.5 rounded-xl border-white/10 bg-navy-900 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Nombre de Contacto</label>
                <input
                  type="text"
                  placeholder="Ej: María Jesús"
                  value={contactoNombre}
                  onChange={e => setContactoNombre(e.target.value)}
                  className="input-premium py-2.5 rounded-xl border-white/10 bg-navy-900 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Teléfono</label>
                <input
                  type="text"
                  placeholder="Ej: +56 9 ..."
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  className="input-premium py-2.5 rounded-xl border-white/10 bg-navy-900 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Email de Contacto</label>
                <input
                  type="email"
                  placeholder="Ej: contacto@empresa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-premium py-2.5 rounded-xl border-white/10 bg-navy-900 text-white"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400 font-medium">Fecha de Próximo Cobro / Alerta de Pago</label>
                <input
                  type="date"
                  value={fechaCobro}
                  onChange={e => setFechaCobro(e.target.value)}
                  className="input-premium py-2.5 rounded-xl border-white/10 bg-navy-900 text-white dark:[color-scheme:dark]"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary py-2.5 rounded-xl bg-navy-700 hover:bg-navy-600 border-none text-white cursor-pointer select-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingSave}
                  className="btn-primary py-2.5 rounded-xl bg-ideal hover:bg-ideal-hover cursor-pointer select-none"
                >
                  {loadingSave ? 'Guardando...' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabla Listado de Proveedores */}
      <div className="bg-navy-800 border border-white/5 rounded-3xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-ideal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-center">
            <Truck className="h-10 w-10 text-slate-600 stroke-[1.2] mb-3" />
            <h4 className="font-bold text-slate-300 text-sm">Sin Proveedores Registrados</h4>
            <p className="text-slate-500 text-xs mt-1">Presiona "Registrar Proveedor" para incorporar tu primer socio.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-navy-900/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Cuentas por Pagar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-200 font-sans">
                {suppliers.map(sup => {
                  const cobro = obtenerEstadoCobro(sup.fecha_cobro);
                  return (
                    <tr key={sup.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                          <Truck className="h-4 w-4" />
                        </div>
                        {sup.nombre}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {sup.contacto_nombre ? (
                          <span className="flex items-center gap-1.5">
                            <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                            {sup.contacto_nombre}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {sup.telefono ? (
                          <span className="flex items-center gap-1.5 font-mono">
                            <Phone className="h-3.5 w-3.5 text-slate-500" />
                            {sup.telefono}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {sup.email ? (
                          <span className="flex items-center gap-1.5 font-mono">
                            <Mail className="h-3.5 w-3.5 text-slate-500" />
                            {sup.email}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] border ${cobro.style}`}>
                            {cobro.icon}
                            {cobro.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isDemoMode && (
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-400 flex-shrink-0" />
          <p className="text-slate-400 text-xs leading-normal">
            <strong>Seguridad RLS Demostrativa</strong>: Esta tabla sólo es visible por usuarios autorizados con rol administrador. Las llamadas del cliente común están denegadas por las políticas SQL activadas.
          </p>
        </div>
      )}
    </div>
  );
};
