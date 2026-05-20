import React, { useState } from 'react';
import { FinancialView } from './FinancialView';
import { InventoryView } from './InventoryView';
import { SupplierView } from './SupplierView';
import { CRMView } from './CRMView';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Package, Truck, UserCheck, ShieldAlert, Store } from 'lucide-react';

interface AdminDashboardProps {
  setView: (view: 'catalog' | 'admin') => void;
}

type AdminSubView = 'finanzas' | 'inventario' | 'proveedores' | 'crm';

/**
 * Panel de Administración Integral - Ideal Enterprise.
 * Diseñado con una paleta de colores oscura (Neutral Luxury) de alta fidelidad 
 * para separar semánticamente el área corporativa de la tienda pública.
 */
export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState<AdminSubView>('finanzas');

  const tabs = [
    { id: 'finanzas', label: 'Estadísticas y Finanzas', icon: <BarChart3 className="h-4.5 w-4.5" /> },
    { id: 'inventario', label: 'Inventario de Productos', icon: <Package className="h-4.5 w-4.5" /> },
    { id: 'proveedores', label: 'Socios Proveedores', icon: <Truck className="h-4.5 w-4.5" /> },
    { id: 'crm', label: 'Seguimiento CRM', icon: <UserCheck className="h-4.5 w-4.5" /> },
  ];

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 pt-24 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Layout Principal de Grid Lateral */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Barra Lateral Izquierda de Navegación */}
          <div className="lg:col-span-1 space-y-6">
            {/* Branding del Panel */}
            <div className="bg-navy-800 border border-white/5 rounded-3xl p-6 text-left">
              <span className="text-[10px] text-ideal font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2 select-none">
                <ShieldAlert className="h-4 w-4" /> Consola Autorizada
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white font-title">
                Ideal Enterprise
              </h1>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-normal">
                Sistemas operativos y contables de alto rendimiento.
              </p>

              {/* Botón rápido para volver a Tienda */}
              <button
                onClick={() => setView('catalog')}
                className="w-full mt-5 flex items-center justify-center gap-2 bg-ideal text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-ideal/10 hover:bg-ideal-hover hover:shadow-lg transition-all cursor-pointer select-none"
              >
                <Store className="h-4 w-4" />
                Volver a Tienda
              </button>
            </div>

            {/* Lista de Pestañas de Navegación de Administración */}
            <div className="bg-navy-800 border border-white/5 rounded-3xl p-3 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminSubView)}
                    className={`flex items-center gap-3 px-4.5 py-3 rounded-xl font-medium text-xs tracking-wide transition-all duration-200 select-none cursor-pointer flex-shrink-0 lg:flex-shrink ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/2'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Área de Visualización de Contenidos a la Derecha */}
          <div className="lg:col-span-3 bg-navy-800/40 border border-white/5 rounded-3xl p-6 md:p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {activeTab === 'finanzas' && <FinancialView />}
                {activeTab === 'inventario' && <InventoryView />}
                {activeTab === 'proveedores' && <SupplierView />}
                {activeTab === 'crm' && <CRMView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
