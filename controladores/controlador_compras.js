const {productos, compras, proveedores,lotes,detalleCompras,movimientosInventario,detalleVentas,embalajes}=require('../src/db/schema')
const  db  = require('../src/db/db'); 
const {validationResult}=require("express-validator")
const { eq } = require("drizzle-orm");
const { ExpressValidator } = require('express-validator');
const { ilike } = require("drizzle-orm");
const {  and, gte, lte, lt, sql,gt, inArray,desc } = require("drizzle-orm");

const mostrar_compra=async(req,res)=>{

        // res.render('compras')
        try {
                const lista_compras=await db.select({
                id: compras.id,
                proveedor:proveedores.nombre,
                total:compras.total,
                estado:compras.estado,
                
                createdAt: compras.createdAt
                
                }).from(compras)
                .innerJoin(
                proveedores,
                eq(compras.proveedorId, proveedores.id)  //mirar si se agregar el producto aqui por ser tabla diferente
            ).where(eq(compras.estado,"ACTIVA"))
            .orderBy(
                desc(compras.createdAt)
            )
            .limit(5000);
                
                const compras_formateadas = lista_compras.map(compra => {
                return {
                    ...compra,
                    createdAt: new Date(compra.createdAt)
                        .toLocaleDateString('es-CO')
                }
    
                })
    
                res.render("compras",{lista_compras:compras_formateadas})
            } catch (error) {
                console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_compras/compras')
            }
        }


        const form_registro_compra=async (req,res)=>{
        
                const listaProveedores = await db
                .select()
                .from(proveedores);

                const listaProductos = await db
                .select()
                .from(productos);

                const listaEmbalajes = await db
                .select()
                .from(embalajes);
        
            res.render('componentes/form_compra',{
                productos:listaProductos,
                proveedores:listaProveedores,
                embalajes:listaEmbalajes
                
            })
        
        }
        
        const registrarCompra=async(req,res)=>{
            
            const errors=validationResult(req)
                if(!errors.isEmpty()){
                    req.flash("mensajes",errors.array())
                    console.log(req.body.productos);
                    return res.redirect('/gestion_compras/form_compra')
                }
        
            try {
                
                const {id_proveedor,fechaIngreso,productos:productosCompra} = req.body;

                console.log(req.body)
    
                await db.transaction(async (tx) => {
    
                // ======================
                // CREAR COMPRA
                // ======================
    
                const nuevaCompra = await tx
                    .insert(compras)
                    .values({
                        proveedorId: Number(id_proveedor),
                        total: "0",
                        // fecha: fechaIngreso
                    })
                    .returning();
    
                const compraId = nuevaCompra[0].id;
    
                let totalCompra = 0;
    
                // ======================
                // RECORRER PRODUCTOS
                // ======================
    
                for (const item of productosCompra) {

                    let cantidad;
    
                    if(Number(item.cajas)>0){

                        cantidad =
                            Number(item.cajas) *
                            Number(item.unidadesPorCaja);
                    }else{
                        cantidad=Number(item.unidadesPorCaja);
                    }
    
                
    
                    totalCompra += Number(item.precio);
    
                    // ======================
                    // CREAR LOTE
                    // ======================
    
                    // const nuevoLote = await tx
                    //     .insert(lotes)
                    //     .values({
    
                    //         productoId: Number(item.productoId),
    
                    //         compraId: compraId,
    
                    //         fechaIngreso: fechaIngreso,
    
                    //         fechaVencimiento:
                    //             item.fechaVencimiento || null,
    
                    //         cantidadActual:0,
                                
    
                    //     })
                    //     .returning();
    
                    // const loteId = nuevoLote[0].id;

                    // const fecha = fechaIngreso.replaceAll("-", "");

                    // const codigoLote =
                    // `LOT-${fecha}-${id_proveedor}-${item.productoId}`;

                    // await tx
                    //     .update(lotes)
                    //     .set({
                    //         codigoLote:codigoLote
                    //     })
                    //     .where(eq(lotes.id, loteId));

                    const fecha = fechaIngreso.replaceAll("-", "");
                    const codigoLote = `LOT-${fecha}-${id_proveedor}-${item.productoId}-${item.id_embalaje}`;

                    // Buscar lote existente
                    const loteExistente = await tx
                    .select()
                    .from(lotes)
                    .where(eq(lotes.codigoLote, codigoLote))
                    .limit(1);

                    let loteId;

                    if (loteExistente.length > 0) {
                    loteId = loteExistente[0].id;
                    } else {
                    const nuevoLote = await tx
                        .insert(lotes)
                        .values({
                        productoId: Number(item.productoId),
                        compraId,
                        codigoLote,
                        fechaIngreso,
                        fechaVencimiento: item.fechaVencimiento || null,
                        cantidadActual: 0,
                        })
                        .returning();

                    loteId = nuevoLote[0].id;
                    }

                    
                    
    
                    // ======================
                    // DETALLE COMPRA
                    // ======================
    
                    await tx
                        .insert(detalleCompras)
                        .values({
    
                            compraId: compraId,
    
                            loteId: loteId,

                            cantidad_embalaje: Number(item.cajas || 0),

                    
    
                            cantidad:
                                cantidad.toString(),
    
                            precio:
                                item.precio.toString(),

                            idEmbalaje: Number(item.id_embalaje),
    
                            observaciones:
                                item.observaciones || null
                        });


                        let precioUnitario =
                            Number(item.precio) / cantidad;

                    
                    await tx
                        .update(productos)
                        .set({

                            precioReferenciaCompra: precioUnitario.toFixed(2), //toString(),
                            precioReferenciaVenta: (precioUnitario*1.35).toFixed(2)
                        })
                        .where(eq(productos.id, Number(item.productoId)));
                }
    
                // ======================
                // ACTUALIZAR TOTAL
                // ======================
    
                    await tx
                        .update(compras)
                        .set({
                            total: totalCompra.toString()
                        })
                        .where(eq(compras.id, compraId));
        
                })

                
    
            req.flash("mensajes", [
                { msg: "Compra registrada" }
            ]);
    
            return res.redirect("/gestion_compras/compras");    
            
            } catch (error) {
                
                console.log(error);

                req.flash("mensajes", [
                    { msg: error.message }
                ]);

                return res.redirect(
                    "/gestion_compras/form_compra"
                );
            }
        }


                // const anularCompra = async (req, res) => {
        
                //     const compraId = Number(req.params.id);

                //     try {

                //         await db.transaction(async (tx) => {

                //             const [compra] = await tx
                //                 .select()
                //                 .from(compras)
                //                 .where(eq(compras.id, compraId));

                //             if (!compra) {
                //                 throw new Error("Compra no encontrada");
                //             }

                //             if (compra.estado === "ANULADA") {
                //                 throw new Error("La compra ya fue anulada");
                //             }

                //             const detalles = await tx
                //                 .select()
                //                 .from(detalleCompras)
                //                 .where(eq(detalleCompras.compraId, compraId));

                //             for (const detalle of detalles) {

                //                 await tx
                //                     .update(lotes)
                //                     .set({
                //                         cantidadActual:
                //                             sql`${lotes.cantidadActual} - ${detalle.cantidad}`
                //                     })
                //                     .where(eq(lotes.id, detalle.loteId));
                //             }

                //             await tx
                //                 .update(compras)
                //                 .set({
                //                     estado: "ANULADA"
                //                 })
                //                 .where(eq(compras.id, compraId));

                //         });

                //         req.flash("mensajes", [
                //             { msg: "Compra anulada correctamente" }
                //         ]);

                //         return res.redirect("/gestion_compras/compras");

                //     } catch (error) {

                //         req.flash("mensajes", [
                //             { msg: error.message }
                //         ]);

                //         return res.redirect("/gestion_compras/compras");
                //     }
                // };

                const anularCompra = async (req, res) => {

                    const compraId = Number(req.params.id);

                    try {

                        await db.transaction(async (tx) => {

                            const [compra] = await tx
                                .select()
                                .from(compras)
                                .where(eq(compras.id, compraId));

                            if (!compra) {
                                throw new Error("Compra no encontrada");
                            }

                            if (compra.estado === "ANULADA") {
                                throw new Error("La compra ya fue anulada");
                            }

                            const detalles = await tx
                                .select()
                                .from(detalleCompras)
                                .where(eq(detalleCompras.compraId, compraId));

                            const lotesIds = detalles.map(d => Number(d.loteId));

                            // 🔥 VALIDACIÓN PRO (recomendada)
                            if (lotesIds.length > 0) {

                                const ventasAsociadas = await tx
                                    .select()
                                    .from(detalleVentas)
                                    .where(
                                        inArray(detalleVentas.loteId, lotesIds)
                                    )
                                    .limit(1);

                                if (ventasAsociadas.length > 0) {
                                    throw new Error(
                                        "No se puede anular la compra porque ya existen ventas asociadas a sus lotes"
                                    );
                                }
                            }

                            // 🔁 reversa de stock
                            for (const detalle of detalles) {

                                await tx
                                    .update(lotes)
                                    .set({
                                        cantidadActual:
                                            sql`${lotes.cantidadActual} - ${detalle.cantidad}`
                                    })
                                    .where(eq(lotes.id, detalle.loteId));
                            }

                            await tx
                                .update(compras)
                                .set({
                                    estado: "ANULADA"
                                })
                                .where(eq(compras.id, compraId));

                        });

                        req.flash("mensajes", [
                            { msg: "Compra anulada correctamente" }
                        ]);

                        return res.redirect("/gestion_compras/compras");

                    } catch (error) {

                        req.flash("mensajes", [
                            { msg: error.message }
                        ]);

                        return res.redirect("/gestion_compras/compras");
                    }
                };
            

        const ver_detalle_compra=async(req,res)=>{

        
        try {
                const lista_detalle_compras=await db.select({
                detalleId: detalleCompras.id,
                id: compras.id,
                proveedor:proveedores.nombre,
                producto:productos.nombre,
                lote:lotes.codigoLote,
                cantidad:detalleCompras.cantidad,
                cantidad_embalaje:detalleCompras.cantidad_embalaje,
                precio:detalleCompras.precio,
                observaciones:detalleCompras.observaciones,
                embalaje:embalajes.nombre_embalaje
                
                
                }).from(detalleCompras)
                .innerJoin(compras, eq(detalleCompras.compraId, compras.id))
                .innerJoin(proveedores, eq(compras.proveedorId, proveedores.id))
                .innerJoin(lotes, eq(detalleCompras.loteId, lotes.id))
                .innerJoin(embalajes, eq(detalleCompras.idEmbalaje, embalajes.id_embalaje))
                .innerJoin(productos, eq(lotes.productoId, productos.id))
                .where(eq(detalleCompras.compraId, Number(req.params.id)));
            
                            
                
                // const compras_formateadas = lista_compras.map(compra => {
                // return {
                //     ...compra,
                //     createdAt: new Date(compra.createdAt)
                //         .toLocaleDateString('es-CO')
                // }
    
                // })
    
                res.render("ver_detalle_compra",{lista_detalle_compras:lista_detalle_compras})
            } catch (error) {
                console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_compras/compras')
            }
        }

        const editar_compra=async(req,res)=>{
                    const{id} = req.params
        
                    const listaProductos = await db
                        .select()
                        .from(productos);
                    
                    const listaProveedores = await db
                        .select()
                        .from(proveedores);

                    const listaEmbalajes = await db
                        .select()
                        .from(embalajes);
                                
                    try {
        
                            const detalle_compra = await db
                            .select({
                                id: detalleCompras.id,
                                compraId: detalleCompras.compraId,
                                loteId: detalleCompras.loteId,
                                productoId: lotes.productoId, 
                                cantidad: detalleCompras.cantidad,
                                precio: detalleCompras.precio,
                                observaciones: detalleCompras.observaciones,
                                fechaVencimiento:lotes.fechaVencimiento,
                                idEmbalaje: detalleCompras.idEmbalaje,
                            })
                            .from(detalleCompras)
                            .innerJoin(lotes, eq(detalleCompras.loteId, lotes.id))
                            .innerJoin(embalajes, eq(detalleCompras.idEmbalaje, embalajes.id_embalaje))
                            .where(eq(detalleCompras.id, Number(id)));

                            console.log("ID recibido:", id);
                            console.log("RESULTADO:", detalle_compra);
        
                        res.render("componentes/form_editar_compra.hbs", {
                            detalle_compra: detalle_compra[0],
                            productos:listaProductos,
                            embalajes: listaEmbalajes
                        });
            
                    } catch (error) {
                        req.flash("mensajes",[{msg:error.message}])
                        return res.redirect('/gestion_compras/compras')
                    }
            
                }

            
        const form_editar_compra= async (req, res) => {

            const errors=validationResult(req)
                if(!errors.isEmpty()){
                    req.flash("mensajes",errors.array())
                    return res.redirect(`/gestion_compras/form_editar_compra/${req.params.id}`)
                }

            const { id } = req.params;

            const {
                id_producto,
                cantidad_embalaje,
                unidades_embalaje,
                precio,
                id_embalaje,
                vencimiento,
                observaciones
            } = req.body;

            try {
                await db.transaction(async (tx) => {

                // ======================
                // 1. OBTENER DETALLE
                // ======================
                const [detalle] = await tx
                    .select()
                    .from(detalleCompras)
                    .where(eq(detalleCompras.id, Number(id)));

                if (!detalle) {
                    throw new Error("Detalle de compra no encontrado");
                }

                // ======================
                // 2. CALCULAR CANTIDAD
                // ======================
                const cantidad = Number(detalle.cantidad || 0);

                // ======================
                // 3. ACTUALIZAR DETALLE COMPRA
                // ======================
                    

                await tx
                    .update(detalleCompras)
                    .set({
                    // cantidad: cantidad,
                    precio: precio,
                    observaciones: observaciones,
                    idEmbalaje: Number(id_embalaje)
                    })
                    .where(eq(detalleCompras.id, Number(id)));

                // ======================
                // 4. ACTUALIZAR LOTE
                // ======================
                await tx
                    .update(lotes)
                    .set({
                    productoId: Number(id_producto),
                    fechaVencimiento: vencimiento || null
                    })
                    .where(eq(lotes.id, detalle.loteId));

                // ======================
                // 5. RECALCULAR PRECIO PRODUCTO
                // ======================
            
                
                const precioUnitario = Number(precio) / cantidad;
            


                await tx
                    .update(productos)
                    .set({
                    precioReferenciaCompra: precioUnitario.toString(),
                    precioReferenciaVenta: (precioUnitario*1.35).toFixed(2)
                    })
                    .where(eq(productos.id, Number(id_producto)));

                // ======================
                // 6. RECALCULAR TOTAL COMPRA
                // ======================
                const detallesCompra = await tx
                    .select({
                    precio: detalleCompras.precio,
                    cantidad: detalleCompras.cantidad
                    })
                    .from(detalleCompras)
                    .where(eq(detalleCompras.compraId, detalle.compraId));

                let totalCompra = 0;

                for (const item of detallesCompra) {
                    totalCompra += Number(item.precio);
                }

                await tx
                    .update(compras)
                    .set({
                    total: totalCompra.toString()
                    })
                    .where(eq(compras.id, detalle.compraId));

                });

                req.flash("mensajes", [{ msg: "Compra actualizada correctamente" }]);
                return res.redirect("/gestion_compras/compras");

            } catch (error) {
                console.log(error);
                req.flash("mensajes", [{ msg: error.message }]);
                return res.redirect("/gestion_compras/compras");
            }
            };

            const filtrar_compra = async (req, res) => {
                const { fechaInicio,fechaFin, proveedor } = req.body;

                try {

                    const filtros = [
                        eq(compras.estado, "ACTIVA")
                    ];

                    // Filtro por proveedor
                    if (proveedor) {
                        filtros.push(
                            ilike(proveedores.nombre, `%${proveedor}%`)
                        );
                    }

                    // // Fecha inicial
                    // if (fechaInicio) {
                    //     filtros.push(
                    //         gte(compras.createdAt, new Date(fechaInicio))
                    //     );
                    // }

                    // // Fecha final
                    // if (fechaFin) {
                    //     filtros.push(
                    //         lte(
                    //             compras.createdAt,
                    //             new Date(`${fechaFin}T23:59:59.999`)
                    //         )
                    //     );
                    // }

                    if (fechaInicio && fechaFin) {

                        const inicio = new Date(`${fechaInicio}T00:00:00`);

                        const fin = new Date(`${fechaFin}T00:00:00`);
                        fin.setDate(fin.getDate() + 1);

                        filtros.push(
                            gte(compras.createdAt, inicio),
                            lt(compras.createdAt, fin)
                        );

                    } else if (fechaInicio) {

                        const inicio = new Date(`${fechaInicio}T00:00:00`);

                        filtros.push(
                            gte(compras.createdAt, inicio)
                        );

                    } else if (fechaFin) {

                        const fin = new Date(`${fechaFin}T00:00:00`);
                        fin.setDate(fin.getDate() + 1);

                        filtros.push(
                            lt(compras.createdAt, fin)
                        );
                    }
                    const lista_compras = await db
                    .select({
                        id: compras.id,
                        proveedor: proveedores.nombre,
                        total: compras.total,
                        createdAt: compras.createdAt
                    })
                    .from(compras)
                    .innerJoin(
                        proveedores,
                        eq(compras.proveedorId, proveedores.id)
                    ).where(
                            filtros.length > 0
                                ? and(...filtros)
                                : undefined
                        ).orderBy(desc(compras.createdAt));
                

                    const compras_formateadas = lista_compras.map(compra => ({
                    ...compra,
                    createdAt: new Date(compra.createdAt).toLocaleDateString('es-CO')
                    }));

                
                    res.render("compras.hbs", {
                    lista_compras: compras_formateadas
                    });

                } catch (error) {
                    req.flash("mensajes", [{ msg: error.message }]);
                    return res.redirect('/gestion_compras/compras');
                }
                };

                const mostrar_anulados=async(req,res)=>{
                
                try {
                        const lista_anulados=await db.select({
                        id: compras.id,
                        proveedor:proveedores.nombre,
                        total:compras.total,
                        estado:compras.estado,
                
                        createdAt: compras.createdAt
        
                        
                        }).from(compras)
                        .innerJoin(
                        proveedores,
                        eq(compras.proveedorId, proveedores.id) )
                        .where(eq(compras.estado,"ANULADA"))
                        .orderBy(
                            desc(compras.createdAt)
                        )
                        .limit(5000);

                        const compras_formateadas = lista_anulados.map(compra => {
                                return {
                                    ...compra,
                                    createdAt: new Date(compra.createdAt)
                                        .toLocaleDateString('es-CO')
                                }})
                        
        
                        const agrupado = Object.values(
                            compras_formateadas.reduce((acc, item) => {
        
                                if (!acc[item.proveedor]) {
                                acc[item.proveedor] = {
                                    producto: item.proveedor,
                                    compras: []
                                };
                                }
        
                                acc[item.proveedor].compras.push(item);
        
                                return acc;
        
                            }, {})
                            );


                        


                        res.render("anuladas/compras_anuladas",{agrupado})
                    } catch (error) {
                        console.log(error)
                        // res.send("algo fallo")
                        req.flash("mensajes",[{msg:error.message}])
                        return res.redirect('/gestion_compras/compras')
                    }
                }
                
        

module.exports={
    mostrar_compra,
    form_registro_compra,
    registrarCompra,
    // eliminar_compra,
    ver_detalle_compra,
    editar_compra,
    form_editar_compra,
    filtrar_compra,
    anularCompra,
    mostrar_anulados
}