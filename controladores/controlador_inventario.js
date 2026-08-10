const {productos, compras, ventas,lotes,detalleVentas,movimientosInventario,usuarios}=require('../src/db/schema')
const  db  = require('../src/db/db'); 
const {validationResult}=require("express-validator")
const { eq ,desc } = require("drizzle-orm");
const { ExpressValidator } = require('express-validator');
const { ilike } = require("drizzle-orm");
const {  and, gte, lte, lt,gt,or  } = require("drizzle-orm");



const mostrar_inventario=async(req,res)=>{

        // res.render('inventario')
        try {
                const lista_inventario=await db.select({
                id: movimientosInventario.id,
                producto:productos.nombre,
                lote:lotes.codigoLote,
                estado:lotes.estado,
                tipo:movimientosInventario.tipo,
                cantidad:movimientosInventario.cantidad,
                fecha: movimientosInventario.fecha,
                estado_compra:compras.estado,
                estado_venta:ventas.estado
                
                }).from(movimientosInventario)
                .innerJoin(
                lotes,
                eq(movimientosInventario.loteId, lotes.id) )
                .innerJoin(
                    productos,
                    eq(lotes.productoId, productos.id)
                ) .leftJoin(
                    ventas,
                    eq(movimientosInventario.ventaId, ventas.id)
                )  .leftJoin(
                    compras,
                    eq(movimientosInventario.compraId, compras.id)
                ).orderBy(
                    desc(movimientosInventario.fecha)
                )
                .limit(5000);
                // ).where(
                //     or(
                //         and(
                //             eq(movimientosInventario.tipo, "salida"),
                //             eq(ventas.estado, "ACTIVA")
                //         ),
                //         and(
                //             eq(movimientosInventario.tipo, "entrada"),
                //             eq(compras.estado, "ACTIVA")
                //         )
                //     )
                // )
                
                const inventario_formateado = lista_inventario.map(inventario => {
                return {
                    ...inventario,
                    fecha: new Date(inventario.fecha)
                        .toLocaleDateString('es-CO')
                }
    
                })
    
                res.render("inventario",{lista_inventario:inventario_formateado})
            } catch (error) {
                console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_inventario/inventario')
            }
        }


        const mostrar_anulados=async(req,res)=>{
                                
            try {
                const lista_anulados=await db.select({
                id: movimientosInventario.id,
                producto:productos.nombre,
                lote:lotes.codigoLote,
                estado:lotes.estado,
                tipo:movimientosInventario.tipo,
                cantidad:movimientosInventario.cantidad,
                fecha: movimientosInventario.fecha,
                estado_compra:compras.estado,
                estado_venta:ventas.estado
                
                }).from(movimientosInventario)
                .innerJoin(
                lotes,
                eq(movimientosInventario.loteId, lotes.id) )
                .innerJoin(
                    productos,
                    eq(lotes.productoId, productos.id)
                ) .leftJoin(
                    ventas,
                    eq(movimientosInventario.ventaId, ventas.id)
                )  .leftJoin(
                    compras,
                    eq(movimientosInventario.compraId, compras.id)
                ).where(
                    or(
                        and(
                            eq(movimientosInventario.tipo, "salida"),
                            eq(ventas.estado, "ANULADA")
                        ),
                        and(
                            eq(movimientosInventario.tipo, "entrada"),
                            eq(compras.estado, "ANULADA")
                        )
                    )
                )
                
                const inventario_formateado = lista_anulados.map(inventario => {
                return {
                    ...inventario,
                    fecha: new Date(inventario.fecha)
                        .toLocaleDateString('es-CO')
                }
    
                })

                // const agrupado = Object.values(
                //     inventario_formateado.reduce((acc, item) => {

                //         if (!acc[item.tipo]) {
                //         acc[item.tipo] = {
                //             producto: item.tipo,
                //             inventario: []
                //         };
                //         }

                //         acc[item.usuario].ventas.push(item);

                //         return acc;

                //     }, {})
                //     );



                    res.render("anuladas/inventario_anulado",{inventario_formateado})
                } catch (error) {
                    console.log(error)
                    // res.send("algo fallo")
                    req.flash("mensajes",[{msg:error.message}])
                    return res.redirect('/gestion_inventario/inventario')
                }
            }

        

module.exports={
    mostrar_inventario,
    mostrar_anulados
}