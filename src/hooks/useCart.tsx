import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import confetti from 'canvas-confetti';

/**
 * Define la estructura de un producto dentro del carrito.
 */
export interface CartItem {
  id: string;
  nombre: string;
  precio_venta: number;
  imagen_url: string;
  cantidad: number;
  stock: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: { id: string; nombre: string; precio_venta: number; imagen_url: string; stock: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  checkout: () => Promise<string>;
  cartTotal: number;
  cartCount: number;
  loadingCheckout: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Proveedor de contexto para el Carrito de Compras.
 * Gestiona el almacenamiento en memoria y sincronización con localStorage para persistir la selección del cliente.
 */
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Cargar carrito persistido al arrancar
  useEffect(() => {
    const savedCart = localStorage.getItem('ideal_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error al restaurar carrito desde localStorage:', err);
      }
    }
  }, []);

  // Guardar cambios y sincronizar persistencia
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('ideal_cart', JSON.stringify(newCart));
  };

  // Añadir ítem al carrito con validación de stock
  const addToCart = (product: { id: string; nombre: string; precio_venta: number; imagen_url: string; stock: number }) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.cantidad < product.stock) {
        saveCart(
          cart.map(item =>
            item.id === product.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          )
        );
      }
    } else {
      saveCart([
        ...cart,
        {
          id: product.id,
          nombre: product.nombre,
          precio_venta: Number(product.precio_venta),
          imagen_url: product.imagen_url || '',
          cantidad: 1,
          stock: product.stock
        }
      ]);
    }
  };

  // Eliminar ítem
  const removeFromCart = (id: string) => {
    saveCart(cart.filter(item => item.id !== id));
  };

  // Actualizar cantidad con limitación de stock actual
  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    const item = cart.find(i => i.id === id);
    if (item && qty <= item.stock) {
      saveCart(
        cart.map(i =>
          i.id === id ? { ...i, cantidad: qty } : i
        )
      );
    }
  };

  // Vaciar carrito
  const clearCart = () => {
    saveCart([]);
  };

  // Checkout Blindado (Seguridad Anti-Hack)
  // Envía únicamente IDs de productos y cantidades a procesar en backend seguro
  const checkout = async (): Promise<string> => {
    if (cart.length === 0) throw new Error('El carrito está vacío');
    setLoadingCheckout(true);

    try {
      // 1. Aislamos exclusivamente IDs y cantidades, no enviamos montos
      const itemsPayload = cart.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad
      }));

      // 2. Ejecutar la función transaccional de Supabase (RPC)
      const { data: newPedidoId, error } = await supabase.rpc('crear_pedido', {
        items: itemsPayload
      });

      if (error) {
        throw new Error(error.message);
      }

      // 3. Limpiar carrito local
      clearCart();

      // 4. Celebrar feedback de compra exitosa con confeti premium
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0052cc', '#10b981', '#6366f1']
        });
      } catch (confettiErr) {
        // Ignorar si hay algún problema con canvas-confetti
      }

      return newPedidoId as string;
    } catch (err: any) {
      console.error('Fallo crítico en el proceso de Checkout:', err);
      throw err;
    } finally {
      setLoadingCheckout(false);
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.precio_venta * item.cantidad, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        cartTotal,
        cartCount,
        loadingCheckout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/**
 * Hook de acceso rápido al Carrito y sus operaciones seguras.
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser invocado dentro de un CartProvider');
  }
  return context;
};
