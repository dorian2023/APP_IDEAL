import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { Card } from '../../components/Card';
import type { Product } from '../../components/Card';
import { ShoppingBag, Database, Sparkles } from 'lucide-react';

// Productos de Demostración de Alta Gama (Campaña de Junio)
const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-jun-1",
    nombre: "Kit Familiar Ideal (11 Productos)",
    descripcion: "Kit completo de higiene y limpieza familiar. Incluye: 1 Jabón Azul (250g), 1 Jabón Líquido Multiuso (400ml), 1 Detergente Rosita (400ml), 1 Detergente en Polvo 3en1 (400g), 1 Champú (295ml), 2 Jabones de Tocador (113g), 1 Desodorante Antitranspirante (50g), 2 Cremas Dentales (100g) + 1 Producto Ideal Plus de regalo por kit.",
    imagen_url: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop",
    stock: 12,
    precio_venta: 30
  },
  {
    id: "prod-jun-2",
    nombre: "Kit de Higiene Personal Ideal",
    descripcion: "Kit de cuidado personal diario optimizado. Incluye: 1 Jabón de Tocador, 2 Cremas Dentales, 1 Desodorante Antitranspirante, 1 Champú de uso diario + 1 Alivio Ideal incorporado dentro del kit para maximizar el cuidado personal.",
    imagen_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
    stock: 6,
    precio_venta: 15
  },
  {
    id: "prod-jun-3",
    nombre: "Alisador Orgánico Capilar",
    descripcion: "Fórmula profesional alisadora e hidratante orgánica. Nutre profundamente el cabello desde la raíz y proporciona un liso perfecto, natural y duradero con brillo extremo.",
    imagen_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop",
    stock: 4,
    precio_venta: 20
  },
  {
    id: "prod-jun-4",
    nombre: "Crema Corporal Ideal Plus",
    descripcion: "Crema hidratante corporal de rápida absorción con una exclusiva selección de nuevas fragancias premium. Aporta suavidad, elasticidad y frescura prolongada a la piel.",
    imagen_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop",
    stock: 3,
    precio_venta: 10
  },
  {
    id: "prod-jun-5",
    nombre: "Protector Solar Ideal SPF 60+",
    descripcion: "Protección solar avanzada de amplio espectro contra rayos UVA y UVB SPF 60+. Fórmula ligera, no grasa y resistente al agua, enriquecida con nutrientes e hidratantes.",
    imagen_url: "https://images.unsplash.com/photo-1524432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
    stock: 2,
    precio_venta: 10
  },
  {
    id: "prod-jun-6",
    nombre: "Jabón Facial Ideal (Glicerina / Azufre)",
    descripcion: "Jabones de tocador faciales especializados de alta pureza. Elige entre Glicerina (máxima hidratación y suavidad cutánea) o Azufre (control de oleosidad y limpieza profunda de poros).",
    imagen_url: "https://images.unsplash.com/photo-1607006342411-91f11f888cc1?q=80&w=600&auto=format&fit=crop",
    stock: 6,
    precio_venta: 5
  }
];

/**
 * Vista de Catálogo E-Commerce para Clientes.
 * Carga de forma segura los productos de Supabase (con RLS activo) o recurre 
 * a un fallback demostrativo premium si la base está vacía.
 */
export const CatalogView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');
      
      if (isDemo) {
        console.log('Catálogo en Modo Demo (Carga inmediata)...');
        setProducts(MOCK_PRODUCTS);
        setIsDemoMode(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Intentar consultar productos de Supabase
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .order('nombre', { ascending: true });

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setProducts(data as Product[]);
          setIsDemoMode(false);
        } else {
          // Si no hay productos en la tabla, activamos modo de demostración
          setProducts(MOCK_PRODUCTS);
          setIsDemoMode(true);
        }
      } catch (err) {
        console.warn('Conectando en Modo Demo (Base de datos remota no inicializada o inaccesible).');
        setProducts(MOCK_PRODUCTS);
        setIsDemoMode(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto page-fade">
      {/* Banner de Bienvenida / Eslogan */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
        <div>
          <span className="text-[11px] text-ideal font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
            <Sparkles className="h-4 w-4" /> Ideal Colección de Junio
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-title leading-tight">
            Cuidado y Bienestar
          </h1>
          <p className="text-slate-500 font-sans text-[15px] mt-2 max-w-[500px]">
            Descubre nuestra línea premium de higiene personal, cuidado capilar y limpieza para el hogar, formulada para ofrecer la máxima calidad al mejor precio.
          </p>
        </div>

        {/* Notificación de Modo Demostración Activo */}
        {isDemoMode && (
          <div className="flex items-center gap-3.5 bg-ideal/5 border border-ideal/10 rounded-2xl p-4 max-w-[420px] text-left">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-ideal text-white flex items-center justify-center">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 text-[12.5px] leading-tight flex items-center gap-1">
                Modo Demostración Activo
              </span>
              <p className="text-slate-500 text-[11px] leading-normal mt-0.5">
                Viendo datos estáticos locales. Para sincronizar la base de datos de Supabase, ejecuta las migraciones del archivo <code className="font-mono text-ideal font-semibold">supabase_schema.sql</code>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Productos */}
      {loading ? (
        /* Tarjetas de Esqueleto en Carga */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white border border-slate-100 rounded-3xl h-[420px] flex flex-col p-4">
              <div className="w-full aspect-square bg-slate-100 animate-shimmer rounded-2xl mb-4" />
              <div className="h-5 w-2/3 bg-slate-100 animate-shimmer rounded-md mb-2" />
              <div className="h-3.5 w-full bg-slate-100 animate-shimmer rounded-md mb-1.5" />
              <div className="h-3.5 w-3/4 bg-slate-100 animate-shimmer rounded-md flex-grow" />
              <div className="h-10 w-full bg-slate-100 animate-shimmer rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Estado vacío */
        <div className="h-[300px] flex flex-col items-center justify-center text-center">
          <ShoppingBag className="h-12 w-12 text-slate-300 stroke-[1.2] mb-3" />
          <h3 className="font-bold text-slate-800 text-[15px]">No se encontraron artículos</h3>
          <p className="text-slate-400 text-xs mt-1">El catálogo no contiene productos disponibles en este momento.</p>
        </div>
      ) : (
        /* Listado Oficial */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <Card key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
