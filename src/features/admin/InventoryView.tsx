import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Image as ImageIcon, Loader2, ShieldAlert } from 'lucide-react';

interface ProductoInventario {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  stock: number;
  precio_venta: number;
  fecha_ingreso: string;
  producto_costos: {
    precio_costo: number;
  } | null;
}

const MOCK_INVENTARIO: ProductoInventario[] = [
  {
    id: "prod-jun-1",
    nombre: "Kit Familiar Ideal (11 Productos)",
    descripcion: "Kit completo de higiene y limpieza familiar. Contiene: 1 Jabón Azul, 1 Jabón Líquido, 1 Detergente Rosita, 1 Detergente Polvo, 1 Champú, 2 Jabones Tocador, 1 Desodorante y 2 Cremas Dentales + Regalo.",
    imagen_url: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop",
    stock: 12,
    precio_venta: 30,
    fecha_ingreso: "2026-05-15",
    producto_costos: { precio_costo: 15.00 }
  },
  {
    id: "prod-jun-2",
    nombre: "Kit de Higiene Personal Ideal",
    descripcion: "Kit diario optimizado con 1 Jabón Tocador, 2 Cremas Dentales, 1 Desodorante, 1 Champú + 1 Alivio Ideal.",
    imagen_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
    stock: 6,
    precio_venta: 15,
    fecha_ingreso: "2026-05-15",
    producto_costos: { precio_costo: 7.50 }
  },
  {
    id: "prod-jun-3",
    nombre: "Alisador Orgánico Capilar",
    descripcion: "Fórmula profesional de alisado e hidratación profunda con brillo extremo.",
    imagen_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop",
    stock: 4,
    precio_venta: 20,
    fecha_ingreso: "2026-05-16",
    producto_costos: { precio_costo: 9.00 }
  },
  {
    id: "prod-jun-4",
    nombre: "Crema Corporal Ideal Plus",
    descripcion: "Crema hidratante corporal de rápida absorción con fragancia premium.",
    imagen_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop",
    stock: 3,
    precio_venta: 10,
    fecha_ingreso: "2026-05-14",
    producto_costos: { precio_costo: 5.00 }
  },
  {
    id: "prod-jun-5",
    nombre: "Protector Solar Ideal SPF 60+",
    descripcion: "Protección solar avanzada de amplio espectro UVA/UVB no grasa.",
    imagen_url: "https://images.unsplash.com/photo-1524432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
    stock: 2,
    precio_venta: 10,
    fecha_ingreso: "2026-05-18",
    producto_costos: { precio_costo: 4.50 }
  },
  {
    id: "prod-jun-6",
    nombre: "Jabón Facial Ideal (Glicerina / Azufre)",
    descripcion: "Jabones faciales de alta pureza para limpieza y control de oleosidad.",
    imagen_url: "https://images.unsplash.com/photo-1607006342411-91f11f888cc1?q=80&w=600&auto=format&fit=crop",
    stock: 6,
    precio_venta: 5,
    fecha_ingreso: "2026-05-18",
    producto_costos: { precio_costo: 2.00 }
  }
];

/**
 * Módulo de Inventario y Control de Costos.
 * Permite registrar mermas de inventario y actualizar el precio de costo confidencial mayorista.
 */
export const InventoryView: React.FC = () => {
  const [products, setProducts] = useState<ProductoInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [stock, setStock] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [precioCosto, setPrecioCosto] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  const fetchInventory = async () => {
    const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder-url');
    
    if (isDemo) {
      console.log('Inventario en Modo Demo (Carga inmediata)...');
      setProducts(MOCK_INVENTARIO);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Query relacional trayendo el producto y su costo confidencial
      const { data, error } = await supabase
        .from('productos')
        .select(`
          id,
          nombre,
          descripcion,
          imagen_url,
          stock,
          precio_venta,
          fecha_ingreso,
          producto_costos (
            precio_costo
          )
        `)
        .order('nombre', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Adaptar estructura relacional de Supabase
        const formatted = data.map((item: any) => ({
          ...item,
          producto_costos: item.producto_costos ? item.producto_costos[0] || item.producto_costos : null
        }));
        setProducts(formatted as ProductoInventario[]);
        setIsDemoMode(false);
      } else {
        setProducts(MOCK_INVENTARIO);
        setIsDemoMode(true);
      }
    } catch (err) {
      setProducts(MOCK_INVENTARIO);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Subida Directa de Imagen a Supabase Storage
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Generar nombre de archivo único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Subir archivo al bucket de almacenamiento público
      const { error: uploadError } = await supabase.storage
        .from('productos-imagenes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener URL de acceso público
      const { data: { publicUrl } } = supabase.storage
        .from('productos-imagenes')
        .getPublicUrl(filePath);

      setImagenUrl(publicUrl);
      alert('Imagen cargada exitosamente en Supabase Storage.');
    } catch (err: any) {
      alert(`Error al cargar imagen en el Bucket: ${err.message || err}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Guardar Producto
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !stock || !precioVenta || !precioCosto) return;

    setSavingProduct(true);

    const productPayload = {
      nombre,
      descripcion: descripcion || null,
      imagen_url: imagenUrl || null,
      stock: parseInt(stock, 10),
      precio_venta: parseFloat(precioVenta)
    };

    const costPayload = {
      precio_costo: parseFloat(precioCosto)
    };

    try {
      if (isDemoMode) {
        const localProduct: ProductoInventario = {
          id: `prod-${Date.now()}`,
          ...productPayload,
          fecha_ingreso: new Date().toISOString().split('T')[0],
          producto_costos: costPayload
        };
        setProducts([localProduct, ...products]);
      } else {
        // 1. Registrar producto en tabla principal
        const { data: newProd, error: prodErr } = await supabase
          .from('productos')
          .insert([productPayload])
          .select('id')
          .single();

        if (prodErr) throw prodErr;

        // 2. Registrar costo confidencial en la tabla 1:1 producto_costos
        const { error: costErr } = await supabase
          .from('producto_costos')
          .insert([{
            producto_id: newProd.id,
            ...costPayload
          }]);

        if (costErr) throw costErr;
        
        // 3. Registrar auditoría de reabastecimiento en la tabla de compras
        await supabase
          .from('compras')
          .insert([{
            producto_id: newProd.id,
            cantidad: parseInt(stock, 10),
            precio_costo: parseFloat(precioCosto)
          }]);

        await fetchInventory();
      }

      // Limpiar formulario
      setNombre('');
      setDescripcion('');
      setStock('');
      setPrecioVenta('');
      setPrecioCosto('');
      setImagenUrl('');
      setShowAddForm(false);
    } catch (err: any) {
      alert(`Error al registrar producto e inventario: ${err.message || err}`);
    } finally {
      setSavingProduct(false);
    }
  };

  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(valor);
  };

  return (
    <div className="space-y-8 text-left page-fade">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-title tracking-tight">
            Control de Inventario y Costos
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-sans">
            Gestión de catálogos y reabastecimiento de insumos comerciales con costos aislados.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary cursor-pointer select-none py-2.5 rounded-xl text-xs bg-ideal"
        >
          <Plus className="h-4.5 w-4.5" />
          Añadir Producto
        </button>
      </div>

      {/* Formulario */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-navy-800 border border-white/5 rounded-3xl p-6 overflow-hidden shadow-lg"
          >
            <h3 className="text-base font-bold text-white font-title mb-4">
              Registrar Insumo en Catálogo
            </h3>
            
            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Nombre Comercial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Café de Especialidad"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="input-premium py-2.5 rounded-xl border-white/10 bg-navy-900 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Carga de Imagen (Supabase Storage) *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    disabled={uploadingImage}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex-grow flex items-center justify-center gap-2 border border-dashed border-white/10 hover:border-white/20 p-2.5 rounded-xl cursor-pointer bg-navy-900 hover:bg-navy-950 transition-colors"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-ideal" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4 text-slate-400" />
                        {imagenUrl ? 'Imagen Lista ✅' : 'Subir Imagen'}
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400 font-medium">Descripción del Producto</label>
                <textarea
                  rows={2}
                  placeholder="Notas descriptivas, origen, detalles técnicos, etc..."
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  className="input-premium py-2.5 rounded-xl border-white/10 bg-navy-900 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Stock Inicial *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Ej: 10"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  className="input-premium py-2.5 rounded-xl border-white/10 bg-navy-900 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Precio de Venta (Público) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Ej: 12900"
                  value={precioVenta}
                  onChange={e => setPrecioVenta(e.target.value)}
                  className="input-premium py-2.5 rounded-xl border-white/10 bg-navy-900 text-white"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-indigo-400 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  Precio de Costo Confidencial (Aislado de Clientes) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Ej: 5800"
                  value={precioCosto}
                  onChange={e => setPrecioCosto(e.target.value)}
                  className="input-premium py-2.5 rounded-xl border-indigo-500/20 focus:border-indigo-500 bg-navy-900 text-white"
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
                  disabled={savingProduct || uploadingImage}
                  className="btn-primary py-2.5 rounded-xl bg-ideal hover:bg-ideal-hover cursor-pointer select-none"
                >
                  {savingProduct ? 'Guardando...' : 'Confirmar Ingreso'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listado de Inventario */}
      <div className="bg-navy-800 border border-white/5 rounded-3xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-ideal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : products.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-center">
            <Package className="h-10 w-10 text-slate-600 stroke-[1.2] mb-3" />
            <h4 className="font-bold text-slate-300 text-sm">Sin Productos en Inventario</h4>
            <p className="text-slate-500 text-xs mt-1">Presiona "Añadir Producto" para comenzar a poblar tu catálogo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-navy-900/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4 text-center">Existencias</th>
                  <th className="px-6 py-4 text-right">Costo Confidencial</th>
                  <th className="px-6 py-4 text-right">Precio de Venta</th>
                  <th className="px-6 py-4 text-right">Margen Neto (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-200">
                {products.map(prod => {
                  const costo = prod.producto_costos?.precio_costo || 0;
                  const venta = prod.precio_venta;
                  const margen = venta > 0 ? (((venta - costo) / venta) * 100).toFixed(1) : '0';

                  return (
                    <tr key={prod.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          {prod.imagen_url ? (
                            <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-800">
                              <Package className="h-4.5 w-4.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[13px]">{prod.nombre}</span>
                          <span className="text-[9.5px] text-slate-500 font-sans tracking-wide mt-0.5">ID: {prod.id.slice(0, 8)}...</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10.5px] font-bold ${
                          prod.stock === 0
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : prod.stock <= 5
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {prod.stock === 0 ? 'Sin existencias' : `${prod.stock} u.`}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right font-semibold font-mono text-indigo-400">
                        {costo > 0 ? formatearPrecio(costo) : '-'}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold font-mono text-white">
                        {formatearPrecio(venta)}
                      </td>

                      <td className="px-6 py-4 text-right font-bold font-mono text-emerald-400">
                        {margen}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nota de RLS */}
      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex items-center gap-3">
        <ShieldAlert className="h-5 w-5 text-indigo-400 flex-shrink-0" />
        <p className="text-slate-400 text-xs leading-normal">
          <strong>Aislamiento Relacional de Precios (Costo vs Venta)</strong>: Los precios de costo están restringidos por políticas RLS en la tabla <code>producto_costos</code>. Si un cliente inicia sesión, Supabase no les enviará este valor en ninguna circunstancia, resguardando el margen comercial empresarial.
        </p>
      </div>
    </div>
  );
};
