const {productos, compras, ventas,lotes,detalleVentas,movimientosInventario,usuarios}=require('../src/db/schema')
const  db  = require('../src/db/db'); 
const {validationResult}=require("express-validator")
const { eq } = require("drizzle-orm");
const { ExpressValidator } = require('express-validator');
const { ilike } = require("drizzle-orm");
const {  and, gte, lte, lt,gt  } = require("drizzle-orm");



const mostrar_lote=async(req,res)=>{

        
        try {
                const lista_lotes=await db.select({
                id: lotes.id,
                producto:productos.nombre,
                lote:lotes.codigoLote,
                estado:lotes.estado,
                fechaIngreso:lotes.fechaIngreso,
                fechaVencimiento:lotes.fechaVencimiento,
                cantidadActual:lotes.cantidadActual
                
                // createdAt:lotes.createdAt
                
                }).from(lotes)
                .innerJoin(
                productos,
                eq(lotes.productoId, productos.id) )
                .where(gt(lotes.cantidadActual,0))
                
            
                
                // const inventario_formateado = lista_inventario.map(inventario => {
                // return {
                //     ...inventario,
                //     fecha: new Date(inventario.fecha)
                //         .toLocaleDateString('es-CO')
                // }
    
                // })
    
                res.render("lotes",{lista_lotes:lista_lotes})
            } catch (error) {
                console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_lotes/lotes')
            }
        }


        const mostrar_lotes_viejos=async(req,res)=>{

        
        try {
                const lista_lotes_viejos=await db.select({
                id: lotes.id,
                producto:productos.nombre,
                lote:lotes.codigoLote,
                estado:lotes.estado,
                fechaIngreso:lotes.fechaIngreso,
                fechaVencimiento:lotes.fechaVencimiento,
                cantidadActual:lotes.cantidadActual

                
                }).from(lotes)
                .innerJoin(
                productos,
                eq(lotes.productoId, productos.id) )
                .where(eq(lotes.cantidadActual,0))
                

                const agrupado = Object.values(
                    lista_lotes_viejos.reduce((acc, item) => {

                        if (!acc[item.producto]) {
                        acc[item.producto] = {
                            producto: item.producto,
                            lotes: []
                        };
                        }

                        acc[item.producto].lotes.push(item);

                        return acc;

                    }, {})
                    );
                res.render("lotes_viejos",{agrupado})
            } catch (error) {
                console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_lotes/lotes')
            }
        }


        

module.exports={
    mostrar_lote,
    mostrar_lotes_viejos
}