import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Wallet, ShieldAlert, BarChart3, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Finanzas {
  total_ventas: number;
  total_costos: number;
  utilidad_neta: number;
  margen_utilidad: number;
  pedidos_pendientes: number;
  productos_bajo_stock: number;
}

const MOCK_FINANZAS: Finanzas = {
  total_ventas: 160.00,
  total_costos: 78.00,
  utilidad_neta: 82.00,
  margen_utilidad: 51.25,
  pedidos_pendientes: 1,
  productos_bajo_stock: 2
};

/**
 * Módulo de Estadísticas y Finanzas.
 * Consume la función RPC segura para calcular e-commerce ROI, costos de inventario,
 * márgenes de ganancia y alertas en tiempo real.
 */
export const FinancialView: React.FC = () => {
  const [metrics, setMetrics] = useState<Finanzas | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');
      
      if (isDemo) {
        console.log('Métricas financieras en Modo Demo (Carga inmediata)...');
        setMetrics(MOCK_FINANZAS);
        setIsDemoMode(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Invocar la función RPC del servidor de base de datos
        const { data, error } = await supabase.rpc('obtener_metricas_financieras');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const raw = data[0];
          setMetrics({
            total_ventas: Number(raw.total_ventas),
            total_costos: Number(raw.total_costos),
            utilidad_neta: Number(raw.utilidad_neta),
            margen_utilidad: Number(raw.margen_utilidad),
            pedidos_pendientes: Number(raw.pedidos_pendientes),
            productos_bajo_stock: Number(raw.productos_bajo_stock)
          });
          setIsDemoMode(false);
        } else {
          setMetrics(MOCK_FINANZAS);
          setIsDemoMode(true);
        }
      } catch (err) {
        // Fallback defensivo ante base no provisionada
        setMetrics(MOCK_FINANZAS);
        setIsDemoMode(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(valor);
  };

  if (loading || !metrics) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-ideal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left page-fade">
      {/* Encabezado e indicador RLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-title tracking-tight">
            Balances y Métricas Comerciales
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-sans">
            Cálculos transaccionales procesados en tiempo real con aislamiento criptográfico RLS.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold select-none">
          <CheckCircle2 className="h-4 w-4" />
          Seguridad Financiera Activa
        </div>
      </div>

      {/* Grid de Tarjetas / Balance Financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ventas Brutas */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-navy-800 border border-white/5 rounded-3xl p-6 flex items-start justify-between shadow-lg"
        >
          <div className="space-y-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Ventas Brutas
            </span>
            <span className="text-2xl font-extrabold text-white tracking-tight block">
              {formatearPrecio(metrics.total_ventas)}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold block">
              +100% de ingresos captados
            </span>
          </div>
          <div className="p-3 bg-ideal/10 rounded-2xl text-ideal">
            <DollarSign className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Costos de Mercadería */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-navy-800 border border-white/5 rounded-3xl p-6 flex items-start justify-between shadow-lg"
        >
          <div className="space-y-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Costo de Ventas
            </span>
            <span className="text-2xl font-extrabold text-white tracking-tight block">
              {formatearPrecio(metrics.total_costos)}
            </span>
            <span className="text-[10px] text-indigo-400 font-semibold block">
              Costo total del catálogo vendido
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
            <Wallet className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Utilidad Neta */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-navy-800 border border-white/5 rounded-3xl p-6 flex items-start justify-between shadow-lg"
        >
          <div className="space-y-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Utilidad Neta
            </span>
            <span className="text-2xl font-extrabold text-white tracking-tight block">
              {formatearPrecio(metrics.utilidad_neta)}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold block">
              Retorno neto del ejercicio
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
            <TrendingUp className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Margen Operativo */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-navy-800 border border-white/5 rounded-3xl p-6 flex items-start justify-between shadow-lg"
        >
          <div className="space-y-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Margen Comercial
            </span>
            <span className="text-2xl font-extrabold text-white tracking-tight block">
              {metrics.margen_utilidad}%
            </span>
            <span className="text-[10px] text-purple-400 font-semibold block">
              Eficiencia operativa de costos
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
            <BarChart3 className="h-6 w-6" />
          </div>
        </motion.div>
      </div>

      {/* Fila Inferior: Gráficos de barra CSS y Alertas Operativas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Desglose de Gastos en CSS */}
        <div className="bg-navy-800 border border-white/5 rounded-3xl p-6 lg:col-span-2 space-y-6">
          <h3 className="text-base font-bold text-white font-title tracking-tight">
            Distribución de Flujo Financiero
          </h3>
          
          <div className="space-y-5 font-sans">
            {/* Barra de Costos */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Costo de Producción / Adquisición</span>
                <span className="text-slate-400">
                  {metrics.total_ventas > 0 
                    ? ((metrics.total_costos / metrics.total_ventas) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="h-3.5 bg-navy-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${metrics.total_ventas > 0 
                      ? (metrics.total_costos / metrics.total_ventas) * 100
                      : 0}%` 
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
            </div>

            {/* Barra de Utilidad */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Margen de Ganancia Neta</span>
                <span className="text-slate-400">{metrics.margen_utilidad}%</span>
              </div>
              <div className="h-3.5 bg-navy-900 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.margen_utilidad}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Glosa explicativa */}
          <div className="bg-navy-900/60 rounded-2xl p-4 text-[11px] text-slate-400 font-sans leading-relaxed">
            * El balance financiero ilustra de forma transparente la retención de valor generada por las transacciones de los clientes. El total del costo se actualiza dinámicamente cada vez que se efectúa un despacho oficial.
          </div>
        </div>

        {/* Alertas de Operaciones Críticas */}
        <div className="bg-navy-800 border border-white/5 rounded-3xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white font-title tracking-tight">
            Monitoreo Operativo
          </h3>

          <div className="space-y-4 font-sans text-xs">
            {/* Alerta de Despachos Pendientes */}
            <div className="flex items-center gap-3.5 bg-navy-900 p-4 rounded-2xl">
              <div className={`p-2.5 rounded-xl ${
                metrics.pedidos_pendientes > 0
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <span className="font-semibold text-slate-200">
                  {metrics.pedidos_pendientes > 0
                    ? `${metrics.pedidos_pendientes} Pedidos Pendientes`
                    : 'Despachos al día'}
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {metrics.pedidos_pendientes > 0
                    ? 'Requieren verificación en módulo CRM.'
                    : 'No existen pedidos rezagados.'}
                </p>
              </div>
            </div>

            {/* Alerta de Productos sin Stock */}
            <div className="flex items-center gap-3.5 bg-navy-900 p-4 rounded-2xl">
              <div className={`p-2.5 rounded-xl ${
                metrics.productos_bajo_stock > 0
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <span className="font-semibold text-slate-200">
                  {metrics.productos_bajo_stock > 0
                    ? `${metrics.productos_bajo_stock} Crítico sin Stock`
                    : 'Inventario abastecido'}
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {metrics.productos_bajo_stock > 0
                    ? 'Productos con stock menor o igual a 5 unidades.'
                    : 'Todas las mermas están cubiertas.'}
                </p>
              </div>
            </div>
          </div>

          {isDemoMode && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3.5 rounded-2xl text-[10.5px] font-sans text-center">
              ⚠️ Visualizando datos estáticos del simulador debido a credenciales no inicializadas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
