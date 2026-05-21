import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, ShoppingBag } from 'lucide-react';

export interface Product {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  stock: number;
  precio_venta: number;
}

interface CardProps {
  product: Product;
  onOpenDetails?: (product: Product) => void;
}

/**
 * Tarjeta de Producto Premium E-Commerce.
 * Implementa bordes 3xl, sombras suaves, micro-interacciones al agregar al carrito,
 * y adaptabilidad responsiva.
 */
export const Card: React.FC<CardProps> = ({ product, onOpenDetails }) => {
  const { addToCart, cart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const cartItem = cart.find(item => item.id === product.id);
  const cantidadEnCarrito = cartItem?.cantidad || 0;
  const sinStock = product.stock <= 0;
  const limiteAlcanzado = cantidadEnCarrito >= product.stock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sinStock || limiteAlcanzado) return;

    addToCart({
      id: product.id,
      nombre: product.nombre,
      precio_venta: product.precio_venta,
      imagen_url: product.imagen_url || '',
      stock: product.stock
    });

    // Animación de éxito temporal
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
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
    <motion.div
      onClick={() => onOpenDetails?.(product)}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`glass-card rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl transition-shadow flex flex-col h-full group ${
        onOpenDetails ? 'cursor-pointer' : ''
      }`}
    >
      {/* Contenedor de Imagen con Bordes 3xl */}
      <div className="relative aspect-square m-3 rounded-2xl overflow-hidden bg-slate-100">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-shimmer" />
        )}
        
        {product.imagen_url ? (
          <img
            src={product.imagen_url}
            alt={product.nombre}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <ShoppingBag className="h-12 w-12 stroke-[1.2]" />
          </div>
        )}

        {/* Badge de Stock */}
        {sinStock ? (
          <span className="absolute top-3 left-3 bg-red-500 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
            Agotado
          </span>
        ) : product.stock <= 5 ? (
          <span className="absolute top-3 left-3 bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
            Pocas unidades ({product.stock})
          </span>
        ) : null}

        {/* Cantidad en Carrito Badge */}
        {cantidadEnCarrito > 0 && (
          <span className="absolute top-3 right-3 bg-ideal text-white font-bold text-[11px] px-2.5 py-1.5 rounded-full shadow-md shadow-ideal/20">
            En carrito: {cantidadEnCarrito}
          </span>
        )}
      </div>

      {/* Información del Producto */}
      <div className="p-5 pt-2 flex flex-col flex-grow text-left">
        <h3 className="font-bold text-slate-900 text-base leading-tight font-sans tracking-tight line-clamp-1">
          {product.nombre}
        </h3>
        
        <p className="text-slate-500 text-xs mt-1.5 font-sans leading-relaxed flex-grow line-clamp-2">
          {product.descripcion || 'Sin descripción detallada disponible.'}
        </p>

        {/* Sección de Precio e Interacción */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Precio Cliente
            </span>
            <span className="text-[18px] font-bold text-slate-900 tracking-tight mt-0.5">
              {formatearPrecio(product.precio_venta)}
            </span>
          </div>

          {/* Botón de Agregar (Con micro-animación de éxito) */}
          <motion.button
            onClick={handleAddToCart}
            disabled={sinStock || limiteAlcanzado}
            whileHover={!(sinStock || limiteAlcanzado) ? { scale: 1.05 } : {}}
            whileTap={!(sinStock || limiteAlcanzado) ? { scale: 0.95 } : {}}
            className={`p-3.5 rounded-2xl flex items-center justify-center transition-colors cursor-pointer select-none ${
              isAdded
                ? 'bg-emerald-500 text-white'
                : sinStock || limiteAlcanzado
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-ideal text-white hover:bg-ideal-hover'
            }`}
          >
            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.5, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Check className="h-4.5 w-4.5 stroke-[3]" />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <Plus className="h-4.5 w-4.5 stroke-[3]" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
