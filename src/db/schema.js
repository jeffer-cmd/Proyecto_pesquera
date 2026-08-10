const { boolean } = require("drizzle-orm/gel-core");
const { pgTable, serial, text,varchar,numeric,integer,date,pgEnum, timestamp } = require("drizzle-orm/pg-core");

// ENUMS
// =====================

const rolUsuarioEnum = pgEnum("rol_usuario", [
  "administrador",
  "operario",
]);

const estadoLoteEnum = pgEnum("estado_lote", [
  "disponible",
  "agotado",
  "vencido",
]);

const tipoMovimientoEnum = pgEnum("tipo_movimiento", [
  "entrada",
  "salida",
]);

const unidadMedidaEnum = pgEnum("unidad_medida", [
  "kg",
  "libra",
  "caja",
  "bolsa"
]);

// TABLAS

const categorias = pgTable("categorias", {
  id_categoria: serial("id_categoria").primaryKey(),
  nombre_categoria: text("nombre_categoria").notNull().unique()
});

const embalajes = pgTable("embalajes", {
  id_embalaje: serial("id_embalaje").primaryKey(),
  nombre_embalaje: text("nombre_embalaje").notNull().unique()
});


const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  rol: rolUsuarioEnum("rol").notNull(), 
  tokenConfirm:text("token"),
  cuentaConfirmada:boolean("cuenta_confirmada").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});


const productos = pgTable("productos", {
  id: serial("id").primaryKey(),

  nombre: text("nombre_producto").notNull(),

  codigoMaterial: varchar("codigo_material", { length: 50 }).unique(),

  unidadMedida: unidadMedidaEnum("unidad").notNull(),

  idCategoria: integer("id_categoria")
    .notNull()
    .references(() => categorias.id_categoria),

  idProveedor:integer("id_proveedor").references(()=>proveedores.id),

  precioReferenciaCompra: numeric("precio_referencia_compra", {
    precision: 10,
    scale: 2,
  }),

  precioReferenciaVenta: numeric("precio_referencia_venta", {
    precision: 10,
    scale: 2,
  }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at" ,{ withTimezone: true }).defaultNow(),
});


// ---------------------

const proveedores = pgTable("proveedores", {
  id: serial("id").primaryKey(),

  nombre: text("nombre").notNull(),
  telefono: text("telefono"),
  direccion: text("direccion"),
  email: text("email").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});



// ---------------------

const compras = pgTable("compras", {
  id: serial("id").primaryKey(),

  proveedorId: integer("proveedor_id")
    .notNull()
    .references(() => proveedores.id),

    total: numeric("total", { precision: 12, scale: 2 }).notNull(),

    estado:varchar("estado", { length: 20 }).default("ACTIVA"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});


// ---------------------

const lotes = pgTable("lotes", {
  id: serial("id").primaryKey(),

  productoId: integer("producto_id")
    .notNull()
    .references(() => productos.id),

  compraId: integer("compra_id")
    .notNull()
    .references(() => compras.id),


    codigoLote: varchar("codigo_lote", { length: 50 }),

    fechaIngreso: date("fecha_ingreso").notNull(),
    fechaVencimiento: date("fecha_vencimiento"),

    cantidadActual: numeric("cantidad_actual", {
      precision: 10,
      scale: 2,
    }).notNull(),

    estado: estadoLoteEnum("estado").default("disponible"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});


// ---------------------

const detalleCompras = pgTable("detalle_compras", {
  id: serial("id").primaryKey(),

  compraId: integer("compra_id")
    .notNull()
    .references(() => compras.id),

  loteId: integer("lote_id")
    .notNull()
    .references(() => lotes.id),

  idEmbalaje: integer("id_embalaje")
    .references(() => embalajes.id_embalaje),

  cantidad: numeric("cantidad", { precision: 10, scale: 2 }).notNull(),
  
  cantidad_embalaje: integer("cantidad_embalaje"),

  precio: numeric("precio", { precision: 10, scale: 2 }).notNull(),

  observaciones: text("observaciones"),

});


// ---------------------

const ventas = pgTable("ventas", {
  id: serial("id").primaryKey(),

  usuarioId: integer("usuario_id")
    .references(() => usuarios.id),

  fecha: timestamp("fecha").defaultNow(),

  metodoPago: text("metodo_pago"),
  cliente: text("cliente"),

  estado:varchar("estado", { length: 20 }).default("ACTIVA"),

  total: numeric("total", { precision: 12, scale: 2 }).notNull(),


  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});


// ---------------------

const detalleVentas = pgTable("detalle_ventas", {
  id: serial("id").primaryKey(),

  ventaId: integer("venta_id")
    .notNull()
    .references(() => ventas.id),

  loteId: integer("lote_id")
    .notNull()
    .references(() => lotes.id),

  cantidad: numeric("cantidad", { precision: 10, scale: 2 }).notNull(),

  cantidad_embalaje: integer("cantidad_embalaje"),

  precio: numeric("precio", { precision: 10, scale: 2 }).notNull(),

  observaciones: text("observaciones"),
});


// ---------------------

const movimientosInventario = pgTable("movimientos_inventario", {
  id: serial("id").primaryKey(),

  loteId: integer("lote_id")
    .notNull()
    .references(() => lotes.id),

  tipo: tipoMovimientoEnum("tipo").notNull(),

  cantidad: numeric("cantidad", { precision: 10, scale: 2 }).notNull(),

  compraId: integer("compra_id")
    .references(() => compras.id),

  ventaId: integer("venta_id")
    .references(() => ventas.id),

  fecha: timestamp("fecha", { withTimezone: true }).defaultNow(),
});


// =====================
// EXPORTS
// =====================

module.exports = {
  productos,
  proveedores,
  usuarios,
  compras,
  lotes,
  detalleCompras,
  ventas,
  detalleVentas,
  movimientosInventario,
  categorias,
  embalajes
};

