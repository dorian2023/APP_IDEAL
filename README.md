# 🚀 Portal Premium E-Commerce & Consola de Administración - Ideal

Bienvenido al ecosistema digital de alta gama de **Ideal** (conecaideal.com). Este portal web de alto rendimiento y seguridad blindada reúne un catálogo interactivo de clientes (E-Commerce boutique) y una potente Consola de Administración para controlar de forma integral inventarios, costos, balances contables en tiempo real, proveedores y relaciones de CRM comercial.

---

## 💎 Pilares de Diseño y Usabilidad Premium
1. **Identidad Visual de Vanguardia**: Diseñado con la paleta de colores azul corporativa de **Ideal** (`#0052cc`), combinado con una paleta abisal profunda (`#090d16`) para el panel de administración, logrando un contraste elegante y sofisticado.
2. **Tipografía Exclusiva**: Implementación híbrida de `Poppins` para títulos limpios y minimalistas, y `Inter` para cuerpos de texto legibles, inspirada en la tipografía oficial del menú de la marca.
3. **Micro-interacciones Fluidas**: Transiciones entre páginas, drawers y paneles dinámicos orquestados mediante **Framer Motion**, incluyendo respuestas hápticas visuales (animaciones con resortes spring, morphing de checks de éxito, unrolling de recibo digital en pantalla).
4. **Resistencia de Carga (Responsividad)**: Soporte completo para pantallas retina de smartphones, tablets, y monitores de escritorio con técnicas avanzadas de Glassmorphic CSS.

---

## 🛡️ Arquitectura de Seguridad Estricta (Anti-Hack)

La seguridad es el núcleo de este sistema. Para evitar la manipulación de precios y la fuga de información sensible, implementamos tres capas de protección blindada:

1. **Aislamiento Relacional de Precios (Costo vs Venta)**:
   - El precio de venta público reside en la tabla `productos` accesible para todos.
   - El precio de costo mayorista confidencial se aísla por completo en la tabla `producto_costos`.
   - Políticas RLS a nivel de base de datos prohíben estrictamente el envío del costo mayorista a cualquier usuario que no esté firmado bajo un token JWT con el rol `'admin'`.
2. **Checkout Seguro en el Servidor (RPC)**:
   - El cliente **nunca** calcula ni envía precios de compra ni montos totales al confirmar su pedido.
   - Envía únicamente una carga útil `{ producto_id, cantidad }`.
   - La base de datos invoca la función transaccional RPC `crear_pedido(items)`. Esta función consulta los precios directamente del almacenamiento de base de datos, valida existencias de stock, descuenta existencias en una transacción atómica, inserta registros de desglose y actualiza el total. Ante cualquier error o stock insuficiente, la transacción realiza un **Rollback automático**.
3. **Subida Directa a Supabase Storage**:
   - Integración nativa para la carga de fotos de productos desde la consola de administración hacia el bucket público `productos-imagenes` de Supabase Storage, protegido por políticas RLS de lectura pública y escritura administrativa exclusiva.

---

## 🛠️ Tecnologías y Requisitos

- **Core**: React 19, Vite 8, TypeScript 6.0
- **Estilos**: Tailwind CSS, PostCSS, Autoprefixer (con soporte para Glassmorphism y temas avanzados)
- **Animaciones**: Framer Motion
- **Base de Datos y Autenticación**: Supabase (PostgreSQL, Storage, Auth con Google OAuth)
- **Retroalimentación Visual**: Lucide Icons, Canvas Confetti

---

## 💾 Guía de Configuración de Base de Datos (Supabase)

Para aprovisionar la base de datos de tu proyecto, sigue estos pasos:

1. Ingresa a tu consola de [Supabase Dashboard](https://supabase.com).
2. Ve a la pestaña **SQL Editor** y crea una nueva consulta.
3. Abre el archivo local [supabase_schema.sql](file:///c:/Users/ASUS/APP_IDEAL/supabase_schema.sql), copia todo su contenido y pégalo en el editor de Supabase.
4. Presiona **Run** para ejecutar las migraciones. Esto creará:
   - Las tablas `perfiles`, `productos`, `producto_costos`, `proveedores`, `compras`, `pedidos` y `detalles_pedido`.
   - Las políticas RLS sobre cada tabla para aislar datos.
   - El disparador para crear perfiles automáticos al logearse con Google.
   - Las funciones de base de datos seguras `crear_pedido` y `obtener_metricas_financieras`.
   - El bucket de almacenamiento `productos-imagenes` para fotos de catálogo.

---

## 🚀 Instalación y Despliegue Local

1. **Clonar / Abrir Workspace**:
   Asegúrate de que estás en la ruta raíz del proyecto en `c:\Users\ASUS\APP_IDEAL`.

2. **Variables de Entorno**:
   - Edita tu archivo local `.env.local`.
   - Reemplaza los placeholders con la URL y la Anon Key de tu proyecto de Supabase:
     ```env
     VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
     VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
     ```

3. **Restaurar Dependencias**:
   ```bash
   npm install
   ```

4. **Ejecutar en Desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador para ver la aplicación web de alto rendimiento.

5. **Compilar para Producción**:
   ```bash
   npm run build
   ```

---

## 📝 Convenciones del Proyecto
- **Conventional Commits**: Mensajes de confirmación bajo el formato `feat:`, `fix:`, `docs:`, `chore:`.
- **Estructura de Directorios**: Modularidad estricta separando la lógica comercial (Hooks/Servicios) de los componentes de presentación (UI).
