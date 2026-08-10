import { relations } from "drizzle-orm/relations";
import { categorias, productos, proveedores, lotes, compras, detalleCompras, movimientosInventario, ventas, usuarios, detalleVentas } from "./schema";

export const productosRelations = relations(productos, ({one, many}) => ({
	categoria: one(categorias, {
		fields: [productos.idCategoria],
		references: [categorias.idCategoria]
	}),
	proveedore: one(proveedores, {
		fields: [productos.idProveedor],
		references: [proveedores.id]
	}),
	lotes: many(lotes),
}));

export const categoriasRelations = relations(categorias, ({many}) => ({
	productos: many(productos),
}));

export const proveedoresRelations = relations(proveedores, ({many}) => ({
	productos: many(productos),
	compras: many(compras),
}));

export const lotesRelations = relations(lotes, ({one, many}) => ({
	producto: one(productos, {
		fields: [lotes.productoId],
		references: [productos.id]
	}),
	compra: one(compras, {
		fields: [lotes.compraId],
		references: [compras.id]
	}),
	detalleCompras: many(detalleCompras),
	movimientosInventarios: many(movimientosInventario),
	detalleVentas: many(detalleVentas),
}));

export const comprasRelations = relations(compras, ({one, many}) => ({
	lotes: many(lotes),
	detalleCompras: many(detalleCompras),
	proveedore: one(proveedores, {
		fields: [compras.proveedorId],
		references: [proveedores.id]
	}),
	movimientosInventarios: many(movimientosInventario),
}));

export const detalleComprasRelations = relations(detalleCompras, ({one}) => ({
	compra: one(compras, {
		fields: [detalleCompras.compraId],
		references: [compras.id]
	}),
	lote: one(lotes, {
		fields: [detalleCompras.loteId],
		references: [lotes.id]
	}),
}));

export const movimientosInventarioRelations = relations(movimientosInventario, ({one}) => ({
	lote: one(lotes, {
		fields: [movimientosInventario.loteId],
		references: [lotes.id]
	}),
	compra: one(compras, {
		fields: [movimientosInventario.compraId],
		references: [compras.id]
	}),
	venta: one(ventas, {
		fields: [movimientosInventario.ventaId],
		references: [ventas.id]
	}),
}));

export const ventasRelations = relations(ventas, ({one, many}) => ({
	movimientosInventarios: many(movimientosInventario),
	usuario: one(usuarios, {
		fields: [ventas.usuarioId],
		references: [usuarios.id]
	}),
	detalleVentas: many(detalleVentas),
}));

export const usuariosRelations = relations(usuarios, ({many}) => ({
	ventas: many(ventas),
}));

export const detalleVentasRelations = relations(detalleVentas, ({one}) => ({
	venta: one(ventas, {
		fields: [detalleVentas.ventaId],
		references: [ventas.id]
	}),
	lote: one(lotes, {
		fields: [detalleVentas.loteId],
		references: [lotes.id]
	}),
}));