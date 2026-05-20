-- ====================================================================
-- PLATAFORMA DE E-COMMERCE Y ADMINISTRACIÓN PREMIUM - IDEAL
-- SCRIPT DE MIGRACIÓN Y CONFIGURACIÓN COMPLETA PARA SUPABASE
-- ====================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. LIMPIEZA DE TABLAS Y TRIGGERS (Opcional - Reinstalación)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.crear_pedido(JSONB);
DROP FUNCTION IF EXISTS public.obtener_metricas_financieras();
DROP TABLE IF EXISTS public.detalles_pedido CASCADE;
DROP TABLE IF EXISTS public.pedidos CASCADE;
DROP TABLE IF EXISTS public.compras CASCADE;
DROP TABLE IF EXISTS public.producto_costos CASCADE;
DROP TABLE IF EXISTS public.productos CASCADE;
DROP TABLE IF EXISTS public.proveedores CASCADE;
DROP TABLE IF EXISTS public.perfiles CASCADE;

-- 3. TABLA DE PERFILES (CLIENTES / ADMINISTRADORES)
-- Vinculada al sistema de autenticación de Supabase (auth.users)
CREATE TABLE public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nombre_completo TEXT,
    avatar_url TEXT,
    rol TEXT NOT NULL DEFAULT 'cliente' CHECK (rol IN ('cliente', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en perfiles
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 4. TABLA DE PROVEEDORES
CREATE TABLE public.proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    contacto_nombre TEXT,
    telefono TEXT,
    email TEXT,
    fecha_cobro DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en proveedores
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;

-- 5. TABLA DE PRODUCTOS (DATOS PÚBLICOS)
CREATE TABLE public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    precio_venta NUMERIC(12, 2) NOT NULL CHECK (precio_venta >= 0),
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en productos
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- 6. TABLA DE COSTOS DE PRODUCTOS (DATOS CONFIDENCIALES - SOLO ADMIN)
CREATE TABLE public.producto_costos (
    producto_id UUID PRIMARY KEY REFERENCES public.productos(id) ON DELETE CASCADE,
    precio_costo NUMERIC(12, 2) NOT NULL CHECK (precio_costo >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en costos
ALTER TABLE public.producto_costos ENABLE ROW LEVEL SECURITY;

-- 7. TABLA DE COMPRAS (REGISTRO DE INGRESO A INVENTARIO / COSTOS)
CREATE TABLE public.compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
    producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_costo NUMERIC(12, 2) NOT NULL CHECK (precio_costo >= 0),
    fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en compras
ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;

-- 8. TABLA DE PEDIDOS (CABECERA - CRM Y CLIENTES)
CREATE TABLE public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En camino', 'Entregado')),
    notas_crm TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en pedidos
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- 9. TABLA DE DETALLES DE PEDIDO (VENTAS - DETALLE MULTI-ÍTEM)
CREATE TABLE public.detalles_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12, 2) NOT NULL CHECK (precio_unitario >= 0)
);

-- Habilitar RLS en detalles_pedido
ALTER TABLE public.detalles_pedido ENABLE ROW LEVEL SECURITY;


-- ====================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ====================================================================

-- --- POLÍTICAS DE PERFILES ---
CREATE POLICY "Permitir a usuarios leer su propio perfil" ON public.perfiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Permitir a admins leer todos los perfiles" ON public.perfiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
    );

CREATE POLICY "Permitir a admins actualizar perfiles" ON public.perfiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
    );

-- --- POLÍTICAS DE PRODUCTOS ---
CREATE POLICY "Permitir a cualquiera ver catálogo de productos" ON public.productos
    FOR SELECT USING (true);

CREATE POLICY "Permitir solo a admins gestionar productos" ON public.productos
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
    );

-- --- POLÍTICAS DE PRODUCTO_COSTOS (ESTRICTO - CLIENTES NO TIENEN ACCESO) ---
CREATE POLICY "Permitir solo a admins ver y gestionar costos de productos" ON public.producto_costos
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
    );

-- --- POLÍTICAS DE PROVEEDORES (ESTRICTO - CLIENTES NO TIENEN ACCESO) ---
CREATE POLICY "Permitir solo a admins gestionar proveedores" ON public.proveedores
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
    );

-- --- POLÍTICAS DE COMPRAS (ESTRICTO - CLIENTES NO TIENEN ACCESO) ---
CREATE POLICY "Permitir solo a admins gestionar compras de inventario" ON public.compras
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
    );

-- --- POLÍTICAS DE PEDIDOS ---
CREATE POLICY "Permitir a clientes ver sus propios pedidos" ON public.pedidos
    FOR SELECT USING (auth.uid() = cliente_id);

-- Para permitir que los clientes inicien un pedido en la tabla pedidos (el RPC gestionará el resto)
CREATE POLICY "Permitir a clientes insertar sus propios pedidos" ON public.pedidos
    FOR INSERT WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Permitir a admins ver y gestionar todos los pedidos" ON public.pedidos
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
    );

-- --- POLÍTICAS DE DETALLES_PEDIDO ---
CREATE POLICY "Permitir a clientes ver detalles de sus propios pedidos" ON public.detalles_pedido
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pedidos 
            WHERE pedidos.id = detalles_pedido.pedido_id AND pedidos.cliente_id = auth.uid()
        )
    );

CREATE POLICY "Permitir a clientes insertar detalles de sus propios pedidos" ON public.detalles_pedido
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pedidos 
            WHERE pedidos.id = detalles_pedido.pedido_id AND pedidos.cliente_id = auth.uid()
        )
    );

CREATE POLICY "Permitir a admins ver y gestionar todos los detalles de pedido" ON public.detalles_pedido
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
    );


-- ====================================================================
-- TRIGGERS Y FUNCIONES DE AUTOMATIZACIÓN DE SEGURIDAD
-- ====================================================================

-- 1. TRIGGER PARA REGISTRO AUTOMÁTICO DE PERFIL DE GOOGLE AUTH / REGISTRO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_rol TEXT := 'cliente';
BEGIN
    -- Solo doriangonzalez2019@gmail.com es el administrador de esta aplicación
    IF new.email = 'doriangonzalez2019@gmail.com' THEN
        v_rol := 'admin';
    END IF;

    INSERT INTO public.perfiles (id, email, nombre_completo, avatar_url, rol)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Cliente Ideal'),
        COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
        v_rol
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. FUNCIÓN RPC PARA PROCESAMIENTO SEGURO DE PEDIDOS (CÁLCULO EXCLUSIVO EN EL SERVIDOR)
-- Evita manipulación de precios desde las peticiones http
CREATE OR REPLACE FUNCTION public.crear_pedido(items JSONB)
RETURNS UUID AS $$
DECLARE
    new_pedido_id UUID;
    item_record RECORD;
    v_producto_id UUID;
    v_cantidad INTEGER;
    v_precio_venta NUMERIC(12,2);
    v_stock_actual INTEGER;
    v_total_pedido NUMERIC(12,2) := 0;
BEGIN
    -- Validar que el usuario esté autenticado
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    -- 1. Crear la cabecera del pedido con total inicial 0
    INSERT INTO public.pedidos (cliente_id, total, estado)
    VALUES (auth.uid(), 0, 'Pendiente')
    RETURNING id INTO new_pedido_id;

    -- 2. Procesar el arreglo de ítems enviado
    -- Formato esperado: [{"producto_id": "...", "cantidad": 2}, ...]
    FOR item_record IN SELECT * FROM jsonb_to_recordset(items) AS x(producto_id UUID, cantidad INTEGER) LOOP
        v_producto_id := item_record.producto_id;
        v_cantidad := item_record.cantidad;

        -- Validar cantidad
        IF v_cantidad <= 0 THEN
            RAISE EXCEPTION 'La cantidad de producto debe ser mayor a cero';
        END IF;

        -- Obtener precio de venta oficial y stock actual desde la base de datos (seguridad blindada)
        SELECT precio_venta, stock INTO v_precio_venta, v_stock_actual
        FROM public.productos
        WHERE id = v_producto_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'El producto solicitado con ID % no existe', v_producto_id;
        END IF;

        -- Validar disponibilidad de stock
        IF v_stock_actual < v_cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto. Disponible: %, Solicitado: %', v_stock_actual, v_cantidad;
        END IF;

        -- 3. Descontar stock del inventario
        UPDATE public.productos
        SET stock = stock - v_cantidad
        WHERE id = v_producto_id;

        -- 4. Registrar el detalle del pedido con el precio verificado del servidor
        INSERT INTO public.detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES (new_pedido_id, v_producto_id, v_cantidad, v_precio_venta);

        -- 5. Acumular el total del pedido
        v_total_pedido := v_total_pedido + (v_precio_venta * v_cantidad);
    END LOOP;

    -- 6. Actualizar el total final de la cabecera del pedido
    UPDATE public.pedidos
    SET total = v_total_pedido
    WHERE id = new_pedido_id;

    RETURN new_pedido_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Ante cualquier error, PostgreSQL realiza un rollback automático de toda la transacción
        RAISE EXCEPTION '%', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. FUNCIÓN RPC PARA CÁLCULO DE MÉTRICAS FINANCIERAS EN TIEMPO REAL (DASHBOARD)
CREATE OR REPLACE FUNCTION public.obtener_metricas_financieras()
RETURNS TABLE (
    total_ventas NUMERIC(12,2),
    total_costos NUMERIC(12,2),
    utilidad_neta NUMERIC(12,2),
    margen_utilidad NUMERIC(5,2),
    pedidos_pendientes BIGINT,
    productos_bajo_stock BIGINT
) AS $$
DECLARE
    v_ventas NUMERIC(12,2) := 0;
    v_costos NUMERIC(12,2) := 0;
    v_utilidad NUMERIC(12,2) := 0;
    v_margen NUMERIC(5,2) := 0;
    v_pendientes BIGINT := 0;
    v_bajo_stock BIGINT := 0;
BEGIN
    -- Validar privilegios de administrador
    IF NOT EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin') THEN
        RAISE EXCEPTION 'Acceso denegado: Se requiere rol de Administrador';
    END IF;

    -- A. Sumar total de ventas cobradas/activas
    SELECT COALESCE(SUM(total), 0) INTO v_ventas
    FROM public.pedidos;

    -- B. Sumar costos de productos asociados a ventas
    SELECT COALESCE(SUM(dp.cantidad * pc.precio_costo), 0) INTO v_costos
    FROM public.detalles_pedido dp
    JOIN public.producto_costos pc ON dp.producto_id = pc.producto_id;

    -- C. Calcular Utilidad Neta
    v_utilidad := v_ventas - v_costos;

    -- D. Calcular Margen de Utilidad
    IF v_ventas > 0 THEN
        v_margen := ROUND((v_utilidad / v_ventas) * 100, 2);
    ELSE
        v_margen := 0;
    END IF;

    -- E. Obtener pedidos pendientes
    SELECT COUNT(*) INTO v_pendientes
    FROM public.pedidos
    WHERE estado = 'Pendiente';

    -- F. Obtener productos con stock menor a 5 unidades
    SELECT COUNT(*) INTO v_bajo_stock
    FROM public.productos
    WHERE stock <= 5;

    RETURN QUERY SELECT v_ventas, v_costos, v_utilidad, v_margen, v_pendientes, v_bajo_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ====================================================================
-- CONFIGURACIÓN DE ALMACENAMIENTO (SUPABASE STORAGE) Y POLÍTICAS
-- ====================================================================

-- 1. CREACIÓN DEL BUCKET 'productos-imagenes' (Si la base tiene permisos de inserción en storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos-imagenes', 'productos-imagenes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS DE ALMACENAMIENTO
DROP POLICY IF EXISTS "Acceso público de lectura a imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Solo administradores pueden subir imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Solo administradores pueden actualizar imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Solo administradores pueden eliminar imágenes" ON storage.objects;

-- Permitir a cualquiera visualizar las imágenes
CREATE POLICY "Acceso público de lectura a imágenes" ON storage.objects
    FOR SELECT USING (bucket_id = 'productos-imagenes');

-- Permitir solo a administradores subir archivos
CREATE POLICY "Solo administradores pueden subir imágenes" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'productos-imagenes' AND
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
    );

-- Permitir solo a administradores actualizar archivos
CREATE POLICY "Solo administradores pueden actualizar imágenes" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'productos-imagenes' AND
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
    );

-- Permitir solo a administradores eliminar archivos
CREATE POLICY "Solo administradores pueden eliminar imágenes" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'productos-imagenes' AND
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'admin')
    );
