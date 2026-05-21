import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Sparkles, CheckCircle2, ChevronRight, HelpCircle, FileText, ArrowLeft, Layers } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import type { Product } from './Card';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

// Estructura de Sub-Productos para Kits
interface SubProduct {
  id: string;
  nombre: string;
  cantidad: number;
  imagen_url: string;
  descripcion: string;
  paraQueSirve: string;
  comoAplicarlo: string;
}

// Datos detallados de todos los productos y kits
const DETAILED_PRODUCTS_INFO: Record<string, {
  paraQueSirve: string;
  comoAplicarlo: string;
  subproductos?: SubProduct[];
}> = {
  // Kit Familiar Ideal
  "Kit Familiar Ideal (11 Productos)": {
    paraQueSirve: "Higiene familiar y limpieza del hogar integral en una sola compra. Esta selección de 11 artículos premium cubre todas las necesidades esenciales de baño, cuidado capilar, salud dental y lavado de ropa con la máxima calidad y rendimiento del mercado.",
    comoAplicarlo: "Cada elemento de este kit cuenta con su propia indicación de uso profesional. Los detergentes y jabones de lavado optimizan el cuidado de tus prendas, mientras que los champús, jabones corporales y cremas dentales brindan un cuidado personal reconfortante.",
    subproductos: [
      {
        id: "sub-1-1",
        nombre: "Jabón Azul de Lavado (250g)",
        cantidad: 1,
        imagen_url: "https://images.unsplash.com/photo-1607006342411-91f11f888cc1?q=80&w=200&auto=format&fit=crop",
        descripcion: "Jabón de barra clásico azul de alto rendimiento para lavado de ropa y textiles.",
        paraQueSirve: "Eliminación profunda de manchas difíciles, suciedad adherida y lavado de prendas delicadas a mano. Conserva la textura de las fibras textiles.",
        comoAplicarlo: "Humedecer la prenda, frotar directamente con la barra de jabón azul sobre la mancha, restregar suavemente y enjuagar con abundante agua."
      },
      {
        id: "sub-1-2",
        nombre: "Jabón Líquido Multiuso (400ml)",
        cantidad: 1,
        imagen_url: "https://images.unsplash.com/photo-1528740564265-53041139422e?q=80&w=200&auto=format&fit=crop",
        descripcion: "Limpiador líquido concentrado biodegradable de uso general para superficies.",
        paraQueSirve: "Desengrasar vajillas, limpiar mesones, pisos y cualquier superficie lavable del hogar. Fórmula suave con las manos.",
        comoAplicarlo: "Diluir una pequeña cantidad en agua para limpiar superficies amplias, o aplicar directamente sobre una esponja para lavar platos."
      },
      {
        id: "sub-1-3",
        nombre: "Detergente Rosita (400ml)",
        cantidad: 1,
        imagen_url: "https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=200&auto=format&fit=crop",
        descripcion: "Detergente líquido premium para prendas delicadas y de color.",
        paraQueSirve: "Limpieza impecable cuidando el color y la suavidad de tus prendas favoritas. Previene el desgaste y la decoloración.",
        comoAplicarlo: "Añadir 50ml al cajetín de la lavadora para cargas normales, o diluir 25ml en agua para lavado de prendas finas a mano."
      },
      {
        id: "sub-1-4",
        nombre: "Detergente en Polvo 3en1 (400g)",
        cantidad: 1,
        imagen_url: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=200&auto=format&fit=crop",
        descripcion: "Detergente en polvo multiacción con suavizante y blanqueador activo.",
        paraQueSirve: "Lavado profundo de ropa blanca y de color, remoción de malos olores y suavizado en un solo ciclo de lavado.",
        comoAplicarlo: "Agregar una taza dosificadora (100g) en el cajetín de la lavadora por cada carga completa de ropa."
      },
      {
        id: "sub-1-5",
        nombre: "Champú Restaurador Ideal (295ml)",
        cantidad: 1,
        imagen_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=200&auto=format&fit=crop",
        descripcion: "Champú nutritivo familiar con extractos naturales para todo tipo de cabello.",
        paraQueSirve: "Higiene capilar diaria, restauración de la fibra capilar seca y aporte de brillo radiante y sedosidad.",
        comoAplicarlo: "Aplicar sobre el cabello mojado, masajear el cuero cabelludo suavemente con la yema de los dedos hasta hacer espuma y enjuagar."
      },
      {
        id: "sub-1-6",
        nombre: "Jabón de Tocador Ideal (113g)",
        cantidad: 2,
        imagen_url: "https://images.unsplash.com/photo-1546554137-f86b9593a222?q=80&w=200&auto=format&fit=crop",
        descripcion: "Jabón en barra humectante corporal perfumado.",
        paraQueSirve: "Limpieza corporal diaria manteniendo la hidratación natural de la piel. Sensación de frescura prolongada.",
        comoAplicarlo: "Frotar la barra entre las manos húmedas para generar una espuma cremosa y masajear por el cuerpo antes de aclarar con agua."
      },
      {
        id: "sub-1-7",
        nombre: "Desodorante Antitranspirante (50g)",
        cantidad: 1,
        imagen_url: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?q=80&w=200&auto=format&fit=crop",
        descripcion: "Desodorante en barra unisex de protección 48h sin alcohol.",
        paraQueSirve: "Controlar el sudor y evitar el mal olor, protegiendo la piel axilar sensible sin causar irritaciones.",
        comoAplicarlo: "Aplicar suavemente 2 o 3 pasadas sobre la axila completamente limpia y seca por las mañanas."
      },
      {
        id: "sub-1-8",
        nombre: "Crema Dental Protección Total (100g)",
        cantidad: 2,
        imagen_url: "https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=200&auto=format&fit=crop",
        descripcion: "Crema dental con flúor activo y micropartículas blanqueadoras.",
        paraQueSirve: "Prevención de caries, eliminación de placa bacteriana, fortalecimiento del esmalte dental y aliento fresco prolongado.",
        comoAplicarlo: "Colocar una porción del tamaño de un guisante sobre el cepillo y cepillar los dientes a fondo por 2 minutos después de comer."
      },
      {
        id: "sub-1-9",
        nombre: "Crema Corporal Ideal Plus (100g)",
        cantidad: 1,
        imagen_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=200&auto=format&fit=crop",
        descripcion: "Crema hidratante corporal intensiva de rápida absorción.",
        paraQueSirve: "Nutrición celular y suavidad extrema en la piel. Ideal para reponer la humedad cutánea después del baño.",
        comoAplicarlo: "Aplicar uniformemente sobre la piel limpia y seca mediante suaves masajes circulares hasta su total absorción."
      }
    ]
  },
  
  // Kit de Higiene Personal
  "Kit de Higiene Personal Ideal": {
    paraQueSirve: "Cuidado e higiene diaria para una persona de forma optimizada. Reúne los elementos de baño e higiene personal más valorados de nuestra marca en un formato compacto de alta gama, ideal para llevar de viaje o asegurar tu aseo personal.",
    comoAplicarlo: "Combina el champú de uso diario, el desodorante axilar y el jabón corporal humectante para una rutina de ducha vigorizante. Finaliza con la pasta dental protectora para una salud bucal impecable.",
    subproductos: [
      {
        id: "sub-2-1",
        nombre: "Champú Restaurador Ideal (295ml)",
        cantidad: 1,
        imagen_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=200&auto=format&fit=crop",
        descripcion: "Champú nutritivo familiar con extractos naturales para todo tipo de cabello.",
        paraQueSirve: "Higiene capilar diaria, restauración de la fibra capilar seca y aporte de brillo radiante y sedosidad.",
        comoAplicarlo: "Aplicar sobre el cabello mojado, masajear el cuero cabelludo suavemente con la yema de los dedos hasta hacer espuma y enjuagar."
      },
      {
        id: "sub-2-2",
        nombre: "Jabón de Tocador Ideal (113g)",
        cantidad: 1,
        imagen_url: "https://images.unsplash.com/photo-1546554137-f86b9593a222?q=80&w=200&auto=format&fit=crop",
        descripcion: "Jabón en barra humectante corporal perfumado.",
        paraQueSirve: "Limpieza corporal diaria manteniendo la hidratación natural de la piel. Sensación de frescura prolongada.",
        comoAplicarlo: "Frotar la barra entre las manos húmedas para generar una espuma cremosa y masajear por el cuerpo antes de aclarar con agua."
      },
      {
        id: "sub-2-3",
        nombre: "Desodorante Antitranspirante (50g)",
        cantidad: 1,
        imagen_url: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?q=80&w=200&auto=format&fit=crop",
        descripcion: "Desodorante en barra unisex de protección 48h sin alcohol.",
        paraQueSirve: "Controlar el sudor y evitar el mal olor, protegiendo la piel axilar sensible sin causar irritaciones.",
        comoAplicarlo: "Aplicar suavemente 2 o 3 pasadas sobre la axila completamente limpia y seca por las mañanas."
      },
      {
        id: "sub-2-4",
        nombre: "Crema Dental Protección Total (100g)",
        cantidad: 2,
        imagen_url: "https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=200&auto=format&fit=crop",
        descripcion: "Crema dental con flúor activo y micropartículas blanqueadoras.",
        paraQueSirve: "Prevención de caries, eliminación de placa bacteriana, fortalecimiento del esmalte dental y aliento fresco prolongado.",
        comoAplicarlo: "Colocar una porción del tamaño de un guisante sobre el cepillo y cepillar los dientes a fondo por 2 minutos después de comer."
      }
    ]
  },

  // Alisador Orgánico
  "Alisador Orgánico Capilar": {
    paraQueSirve: "Este alisador profesional de base orgánica está formulado libre de formol u otros agentes agresivos. Penetra en la cutícula capilar para reestructurar los puentes de hidrógeno, logrando un alisado natural de larga duración (3 a 4 meses), eliminando el molesto frizz, sellando las puntas abiertas y aportando un brillo tridimensional inigualable.",
    comoAplicarlo: "1. Lavar el cabello con champú antirresiduos y secar al 90%. 2. Aplicar el producto mechón por mechón respetando 1cm de la raíz. 3. Dejar actuar durante 40-50 minutos. 4. Enjuagar ligeramente con agua templada para retirar el exceso. 5. Secar el cabello con secador y planchar en secciones muy finas (15 a 20 pasadas por mechón a temperatura adecuada de 200°C)."
  },

  // Crema Corporal
  "Crema Corporal Ideal Plus": {
    paraQueSirve: "Hidratación molecular profunda que restaura de manera inmediata la barrera lipídica de la piel. Su fórmula premium, enriquecida con manteca de karité, vitamina E y ácido hialurónico, retiene la humedad celular por 24 horas y combate la resequedad extrema. Su fragancia exclusiva perfuma delicadamente la piel con notas florales y frutales de larga duración.",
    comoAplicarlo: "Aplicar diariamente por todo el cuerpo sobre la piel limpia y preferiblemente templada (justo después del baño para maximizar la absorción). Realizar masajes circulares ascendentes, haciendo énfasis especial en las zonas propensas a la resequedad como codos, talones y rodillas."
  },

  // Protector Solar
  "Protector Solar Ideal SPF 60+": {
    paraQueSirve: "Protección dermatológica avanzada de amplio espectro contra radiación solar UVA, UVB y luz azul. Enriquecido con antioxidantes y niacinamida, previene el daño celular, la aparición de manchas solares, el envejecimiento cutáneo prematuro y el eritema. De consistencia ultra fluida con efecto toque seco mate que no deja marcas blancas.",
    comoAplicarlo: "Aplicar uniformemente en rostro, cuello y zonas expuestas al sol al menos 20 minutos antes de salir a la intemperie. La cantidad recomendada es el equivalente a dos dedos de la mano. Reaplicar rigurosamente cada 2 horas de exposición directa, o después de nadar, sudar intensamente o secarse con toalla."
  },

  // Jabón Facial
  "Jabón Facial Ideal (Glicerina / Azufre)": {
    paraQueSirve: "Doble acción de tratamiento facial especializado. El Jabón de Glicerina es hipoalergénico y aporta una hidratación sublime, ideal para pieles secas y sensibles. El Jabón de Azufre está diseñado para pieles grasas o con tendencia acnéica, ya que regula la producción sebácea, desobstruye los poros obstruidos, combate bacterias y reduce imperfecciones.",
    comoAplicarlo: "Humedecer el rostro con agua tibia. Frotar el jabón seleccionado hasta crear una espuma suave. Aplicar en el rostro mediante masajes circulares durante 1 minuto, prestando atención a la zona T (frente, nariz y barbilla) y evitando el área delicada de los ojos. Retirar con abundante agua fría para cerrar los poros."
  }
};

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const { addToCart } = useCart();
  const [selectedSubProduct, setSelectedSubProduct] = useState<SubProduct | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  // Obtener info extendida
  const extendedInfo = DETAILED_PRODUCTS_INFO[product.nombre] || {
    paraQueSirve: "Este producto premium forma parte de nuestra exclusiva línea de Compra Ideal, formulado bajo rigurosos estándares de calidad internacional para garantizar los mejores resultados del cuidado diario.",
    comoAplicarlo: "Aplicar según la rutina de uso recomendada. Para dudas específicas de aplicación o alergias, puede consultar a nuestro soporte técnico oficial."
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      nombre: product.nombre,
      precio_venta: product.precio_venta,
      imagen_url: product.imagen_url || '',
      stock: product.stock
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white/95 border border-slate-100 shadow-2xl rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col z-10 relative text-left"
          >
            {/* Header del Modal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-white shadow-sm rounded-full border border-slate-100/50 flex items-center justify-center overflow-hidden w-9 h-9">
                  <img src="/logo.png" alt="Logo Ideal" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-title font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                    Detalle de Producto <Sparkles className="h-4 w-4 text-ideal" />
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-slate-150/50 cursor-pointer shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contenido con Scroll */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6 bg-slate-50/30">
              <AnimatePresence mode="wait">
                {!selectedSubProduct ? (
                  /* VISTA PRINCIPAL DEL PRODUCTO / KIT */
                  <motion.div
                    key="main-view"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    {/* Sección Superior: Imagen e Info Básica */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      <div className="md:col-span-5 aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm relative">
                        {product.imagen_url ? (
                          <img
                            src={product.imagen_url}
                            alt={product.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ShoppingBag className="h-16 w-16 stroke-[1.2]" />
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-7 space-y-4">
                        <div>
                          <span className="text-[10px] text-ideal font-bold uppercase tracking-widest bg-ideal/5 border border-ideal/10 px-3 py-1 rounded-full">
                            {extendedInfo.subproductos ? '🏆 Kit Exclusivo Premium' : '✨ Producto Premium'}
                          </span>
                          <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight font-title mt-2.5">
                            {product.nombre}
                          </h2>
                        </div>

                        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="text-left flex-1">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                              Precio de Venta
                            </span>
                            <span className="text-xl font-black text-slate-800">
                              {formatearPrecio(product.precio_venta)}
                            </span>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                              Disponibilidad
                            </span>
                            <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {product.stock > 0 ? `En Stock (${product.stock} ud)` : 'Agotado'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 font-sans leading-relaxed">
                          {product.descripcion || 'Sin descripción detallada disponible.'}
                        </p>
                      </div>
                    </div>

                    {/* Ficha Técnica: ¿Para qué sirve? y ¿Cómo aplicarlo? */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="h-4 w-4 text-ideal" /> ¿Para qué sirve?
                        </h4>
                        <p className="text-[12px] text-slate-600 font-sans leading-relaxed">
                          {extendedInfo.paraQueSirve}
                        </p>
                      </div>

                      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-ideal" /> Modo de Uso / Aplicación
                        </h4>
                        <p className="text-[12px] text-slate-600 font-sans leading-relaxed">
                          {extendedInfo.comoAplicarlo}
                        </p>
                      </div>
                    </div>

                    {/* SI ES UN KIT: Subproductos detallados en miniatura */}
                    {extendedInfo.subproductos && (
                      <div className="space-y-3">
                        <h4 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                          <Layers className="h-4 w-4 text-ideal" /> Productos incluidos en este Kit ({extendedInfo.subproductos.length})
                        </h4>
                        <p className="text-[10px] text-slate-450 font-sans">
                          Haz clic sobre cualquiera de los productos para ver para qué sirve y cómo aplicárselo.
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {extendedInfo.subproductos.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => setSelectedSubProduct(sub)}
                              className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center gap-2.5 hover:border-ideal hover:shadow-md transition-all text-left group cursor-pointer"
                            >
                              <img
                                src={sub.imagen_url}
                                alt={sub.nombre}
                                className="w-9 h-9 rounded-lg object-cover border border-slate-100 shadow-sm"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-[11px] font-bold text-slate-700 line-clamp-1 group-hover:text-ideal transition-colors">
                                  {sub.nombre}
                                </h5>
                                <span className="text-[9px] text-slate-400 font-semibold block">
                                  Cantidad: {sub.cantidad}x
                                </span>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-slate-350 shrink-0 group-hover:text-ideal transition-transform group-hover:translate-x-0.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* VISTA DETALLADA DE UN SUB-PRODUCTO DENTRO DE UN KIT */
                  <motion.div
                    key="subproduct-view"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    {/* Botón de Regreso */}
                    <button
                      type="button"
                      onClick={() => setSelectedSubProduct(null)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-ideal hover:text-ideal-hover cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" /> Regresar al Kit Completo
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-4 aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
                        <img
                          src={selectedSubProduct.imagen_url}
                          alt={selectedSubProduct.nombre}
                          className="w-full h-full object-cover animate-fade-in"
                        />
                      </div>

                      <div className="md:col-span-8 space-y-3">
                        <div>
                          <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
                            Elemento del Kit
                          </span>
                          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight font-title mt-2">
                            {selectedSubProduct.nombre}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500 font-sans leading-relaxed">
                          {selectedSubProduct.descripcion}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="h-4 w-4 text-rose-500" /> ¿Para qué sirve?
                        </h4>
                        <p className="text-[12px] text-slate-600 font-sans leading-relaxed">
                          {selectedSubProduct.paraQueSirve}
                        </p>
                      </div>

                      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-rose-500" /> Modo de Uso / Aplicación
                        </h4>
                        <p className="text-[12px] text-slate-600 font-sans leading-relaxed">
                          {selectedSubProduct.comoAplicarlo}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer con Botón de Compra */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[11px] text-slate-400 font-sans">
                {selectedSubProduct ? 'Visualizando detalle de componente' : 'Compra Ideal E-Commerce Premium'}
              </span>

              {!selectedSubProduct && (
                <motion.button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md select-none ${
                    isAdded
                      ? 'bg-emerald-500 text-white shadow-emerald-500/10'
                      : product.stock <= 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-ideal text-white hover:bg-ideal-hover shadow-ideal/10 hover:shadow-lg'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> ¡Añadido al Carrito!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" /> Agregar al Carrito
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
