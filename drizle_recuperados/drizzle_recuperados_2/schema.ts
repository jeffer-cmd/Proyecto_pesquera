import { pgTable, foreignKey, unique, serial, text, varchar, integer, numeric, timestamp, date, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const estadoLote = pgEnum("estado_lote", ['disponible', 'agotado', 'vencido'])
export const rolUsuario = pgEnum("rol_usuario", ['admin', 'empleado'])
export const tipoMovimiento = pgEnum("tipo_movimiento", ['entrada', 'salida'])
export const unidadMedida = pgEnum("unidad_medida", ['kg', 'g', 'unidad', 'litro'])


export const productos = pgTable("productos", {
	id: serial().primaryKey().notNull(),
	nombreProducto: text("nombre_producto").notNull(),
	codigoMaterial: varchar("codigo_material", { length: 50 }),
	unidad: unidadMedida().notNull(),
	idCategoria: integer("id_categoria").notNull(),
	precioReferenciaCompra: numeric("precio_referencia_compra", { precision: 10, scale:  2 }),
	precioReferenciaVenta: numeric("precio_referencia_venta", { precision: 10, scale:  2 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	idProveedor: integer("id_proveedor"),
}, (table) => [
	foreignKey({
			columns: [table.idCategoria],
			foreignColumns: [categorias.idCategoria],
			name: "productos_id_categoria_categorias_id_categoria_fk"
		}),
	foreignKey({
			columns: [table.idProveedor],
			foreignColumns: [proveedores.id],
			name: "productos_id_proveedor_proveedores_id_fk"
		}),
	unique("productos_codigo_material_unique").on(table.codigoMaterial),
]);

export const categorias = pgTable("categorias", {
	idCategoria: serial("id_categoria").primaryKey().notNull(),
	nombreCategoria: text("nombre_categoria").notNull(),
}, (table) => [
	unique("categorias_nombre_categoria_unique").on(table.nombreCategoria),
]);

export const proveedores = pgTable("proveedores", {
	id: serial().primaryKey().notNull(),
	nombre: text().notNull(),
	telefono: text(),
	direccion: text(),
	email: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("proveedores_email_unique").on(table.email),
]);

export const lotes = pgTable("lotes", {
	id: serial().primaryKey().notNull(),
	productoId: integer("producto_id").notNull(),
	compraId: integer("compra_id").notNull(),
	fechaIngreso: date("fecha_ingreso").notNull(),
	fechaVencimiento: date("fecha_vencimiento"),
	cantidadActual: numeric("cantidad_actual", { precision: 10, scale:  2 }).notNull(),
	estado: estadoLote().default('disponible'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	codigoLote: varchar("codigo_lote", { length: 50 }),
}, (table) => [
	foreignKey({
			columns: [table.productoId],
			foreignColumns: [productos.id],
			name: "lotes_producto_id_productos_id_fk"
		}),
	foreignKey({
			columns: [table.compraId],
			foreignColumns: [compras.id],
			name: "lotes_compra_id_compras_id_fk"
		}),
]);

export const detalleCompras = pgTable("detalle_compras", {
	id: serial().primaryKey().notNull(),
	compraId: integer("compra_id").notNull(),
	loteId: integer("lote_id").notNull(),
	cantidad: numeric({ precision: 10, scale:  2 }).notNull(),
	precio: numeric({ precision: 10, scale:  2 }).notNull(),
	observaciones: text(),
}, (table) => [
	foreignKey({
			columns: [table.compraId],
			foreignColumns: [compras.id],
			name: "detalle_compras_compra_id_compras_id_fk"
		}),
	foreignKey({
			columns: [table.loteId],
			foreignColumns: [lotes.id],
			name: "detalle_compras_lote_id_lotes_id_fk"
		}),
]);

export const compras = pgTable("compras", {
	id: serial().primaryKey().notNull(),
	proveedorId: integer("proveedor_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	total: numeric({ precision: 12, scale:  2 }).notNull(),
	estado: varchar({ length: 20 }).default('ACTIVA'),
}, (table) => [
	foreignKey({
			columns: [table.proveedorId],
			foreignColumns: [proveedores.id],
			name: "compras_proveedor_id_proveedores_id_fk"
		}),
]);

export const movimientosInventario = pgTable("movimientos_inventario", {
	id: serial().primaryKey().notNull(),
	loteId: integer("lote_id").notNull(),
	tipo: tipoMovimiento().notNull(),
	cantidad: numeric({ precision: 10, scale:  2 }).notNull(),
	compraId: integer("compra_id"),
	ventaId: integer("venta_id"),
	fecha: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.loteId],
			foreignColumns: [lotes.id],
			name: "movimientos_inventario_lote_id_lotes_id_fk"
		}),
	foreignKey({
			columns: [table.compraId],
			foreignColumns: [compras.id],
			name: "movimientos_inventario_compra_id_compras_id_fk"
		}),
	foreignKey({
			columns: [table.ventaId],
			foreignColumns: [ventas.id],
			name: "movimientos_inventario_venta_id_ventas_id_fk"
		}),
]);

export const usuarios = pgTable("usuarios", {
	id: serial().primaryKey().notNull(),
	nombre: text().notNull(),
	email: text().notNull(),
	passwordHash: text().notNull(),
	rol: rolUsuario().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	token: text(),
	cuentaConfirmada: boolean("cuenta_confirmada").default(false),
}, (table) => [
	unique("usuarios_email_unique").on(table.email),
]);

export const ventas = pgTable("ventas", {
	id: serial().primaryKey().notNull(),
	usuarioId: integer("usuario_id"),
	fecha: timestamp({ mode: 'string' }).defaultNow(),
	metodoPago: text("metodo_pago"),
	cliente: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	total: numeric({ precision: 12, scale:  2 }).notNull(),
	estado: varchar({ length: 20 }).default('ACTIVA'),
}, (table) => [
	foreignKey({
			columns: [table.usuarioId],
			foreignColumns: [usuarios.id],
			name: "ventas_usuario_id_usuarios_id_fk"
		}),
]);

export const detalleVentas = pgTable("detalle_ventas", {
	id: serial().primaryKey().notNull(),
	ventaId: integer("venta_id").notNull(),
	loteId: integer("lote_id").notNull(),
	cantidad: numeric({ precision: 10, scale:  2 }).notNull(),
	precio: numeric({ precision: 10, scale:  2 }).notNull(),
	observaciones: text(),
}, (table) => [
	foreignKey({
			columns: [table.ventaId],
			foreignColumns: [ventas.id],
			name: "detalle_ventas_venta_id_ventas_id_fk"
		}),
	foreignKey({
			columns: [table.loteId],
			foreignColumns: [lotes.id],
			name: "detalle_ventas_lote_id_lotes_id_fk"
		}),
]);
