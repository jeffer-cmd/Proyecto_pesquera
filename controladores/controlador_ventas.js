const {productos, compras, ventas,lotes,detalleVentas,movimientosInventario,usuarios}=require('../src/db/schema')
const  db  = require('../src/db/db'); 
const {validationResult}=require("express-validator")
const { eq } = require("drizzle-orm");
const { ExpressValidator } = require('express-validator');
const { ilike } = require("drizzle-orm");
const {  and, gte, lte, lt,gt,sql  } = require("drizzle-orm");

const mostrar_venta=async(req,res)=>{

        // res.render('ventas')
        try {
                const lista_ventas=await db.select({
                id: ventas.id,
                usuario:usuarios.nombre,
                metodoPago:ventas.metodoPago,
                cliente:ventas.cliente,
                total:ventas.total,
                estado:ventas.estado,
                createdAt: ventas.createdAt
                
                }).from(ventas)
                .innerJoin(
                usuarios,
                eq(ventas.usuarioId, usuarios.id) 
            ).where(eq(ventas.estado,"ACTIVA"))
                
                const ventas_formateadas = lista_ventas.map(venta => {
                return {
                    ...venta,
                    createdAt: new Date(venta.createdAt)
                        .toLocaleDateString('es-CO')
                }
    
                })
    
                res.render("ventas",{lista_ventas:ventas_formateadas})
            } catch (error) {
                console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_ventas/ventas')
            }
        }

        const form_registro_venta=async (req,res)=>{
        
                // const listaLotes = await db
                // .select()
                // .from(lotes);

                const listaProductos = await db
                .select()
                .from(productos);
        
            res.render('componentes/form_venta',{
                productos:listaProductos,
                // lotes:listaLotes
                
            })
        
        }

        const obtener_lotes = async (req, res) => {

        const productoId = Number(req.params.productoId);

            try {

                const data = await db
                    .select()
                    .from(lotes)
                    .where(
                        and(
                            eq(lotes.productoId, Number(productoId)),
                            eq(lotes.estado, 'disponible'),
                            gt(lotes.cantidadActual, 0) //mirar esto
                        )
                    );

                        return res.json(data);

                    } catch (error) {

                        console.error("Error obteniendo lotes:", error);

                        return res.status(500).json([]);

                    }
                };
                        


            const registrarVenta=async(req,res)=>{
                    
                    const errors=validationResult(req)
                        if(!errors.isEmpty()){
                            req.flash("mensajes",errors.array())
                            console.log(req.body.productos);
                            return res.redirect('/gestion_ventas/form_venta')
                        }

                    console.log(req.user);

                    const usuarioId = req.user.id;
                
                    try {
                        
                        let {cliente,metodoPago,lotes:productosVenta,precio} = req.body;

                        cliente =
                        req.body.cliente?.trim() || "Proceso";

                        metodoPago =
                            req.body.metodoPago?.trim() || "N/A";

                    

                        console.log(req.body)

                

                        if (
                            !productosVenta ||
                            productosVenta.length === 0
                        ) {
                            throw new Error(
                                "Debe agregar al menos un producto"
                            );
                        }

                        const lotesSeleccionados =
                            req.body.lotes.map(
                                lote => lote.loteId
                            );

                            const repetidos =
                            lotesSeleccionados.filter(
                                (item,index) =>
                                    lotesSeleccionados.indexOf(item)
                                    !== index
                            );

                            if(repetidos.length){

                            //     return res.render(
                            //         "componentes/form_venta",
                            //         {
                            //             error:
                            //             "No puede seleccionar el mismo lote varias veces"
                            //         }
                            //     );
                            // }

                            throw new Error(
                                "No puede seleccionar el mismo lote varias veces"
                            )};
            
                        await db.transaction(async (tx) => {
            
                        // ======================
                        // CREAR VENTA
                        // ======================
            
                        const nuevaVenta = await tx
                            .insert(ventas)
                            .values({
                                metodoPago,
                                cliente,
                                total: "0",
                                usuarioId: req.user.id
                                
                            })
                            .returning();
            
                        const ventaId = nuevaVenta[0].id;
            
                        let totalVenta = 0;
            
                        // ======================
                        // RECORRER PRODUCTOS
                        // ======================
            
                        for (const item of productosVenta) {

                            let precio = Number(item.precio || 0) ;

                            let cantidad;
            
                            if(Number(item.cajas)>0){

                                cantidad =
                                    Number(item.cajas) *
                                    Number(item.unidadesPorCaja);
                            }else{
                                cantidad=Number(item.unidadesPorCaja);
                            }
            
                        
                            const subtotal =
                                cantidad *
                                Number(item.precio);

                            totalVenta += subtotal;
                            // totalVenta += Number(item.precio);
            
                            await tx
                                .insert(detalleVentas)
                                .values({
            
                                    ventaId: ventaId,
            
                                    loteId: Number(item.loteId),
            
                                    cantidad:
                                        cantidad.toString(),
            
                                    precio:
                                        item.precio.toString(),
            
                                    observaciones:
                                        item.observaciones || null
                                });


                                let precioUnitario =  Number(item.precio)
                                    // Number(item.precio) / cantidad;
                                

                            
                            // await tx
                            //     .update(productos)
                            //     .set({

                            //         precioReferenciaVenta: (precioUnitario / 0.65).toString()
                            //     })
                            //     .where(eq(productos.id, Number(item.productoId)));
                        }
            
                        // ======================
                        // ACTUALIZAR TOTAL
                        // ======================
            
                            await tx
                                .update(ventas)
                                .set({
                                    total: totalVenta.toString()
                                })
                                .where(eq(ventas.id, ventaId));
                
                        })

                        
            
                    req.flash("mensajes", [
                        { msg: "Venta registrada" }
                    ]);
            
                    return res.redirect("/gestion_ventas/ventas");    
                    
                    } catch (error) {
                        
                        console.log(error);

                        req.flash("mensajes", [
                            { msg: "Error al registrar la venta, válida cantidad" }
                        ]);

                        return res.redirect(
                            "/gestion_ventas/form_venta"
                        );
                    }
                }

            const ver_detalle_venta=async(req,res)=>{
                        
                
                try {
                        const lista_detalle_ventas=await db.select({
                        detalleId: detalleVentas.id,
                        id: ventas.id,
                        usuario:usuarios.nombre,
                        producto:productos.nombre,
                        lote:lotes.codigoLote,
                        cantidad:detalleVentas.cantidad,
                        precio:detalleVentas.precio,
                        observaciones:detalleVentas.observaciones
                        
                        
                        }).from(detalleVentas)
                        .innerJoin(ventas, eq(detalleVentas.ventaId, ventas.id))
                        .innerJoin(usuarios, eq(ventas.usuarioId, usuarios.id))
                        .innerJoin(lotes, eq(detalleVentas.loteId, lotes.id))
                        .innerJoin(productos, eq(lotes.productoId, productos.id))
                        .where(eq(detalleVentas.ventaId, Number(req.params.id)));
                                    
                        
                        // const compras_formateadas = lista_compras.map(compra => {
                        // return {
                        //     ...compra,
                        //     createdAt: new Date(compra.createdAt)
                        //         .toLocaleDateString('es-CO')
                        // }
            
                        // })
            
                        res.render("ver_detalle_venta",{lista_detalle_ventas:lista_detalle_ventas})
                    } catch (error) {
                        console.log(error)
                        // res.send("algo fallo")
                        req.flash("mensajes",[{msg:error.message}])
                        return res.redirect('/gestion_ventas/ventas')
                    }
                }
            
            const editar_venta=async(req,res)=>{
                        const{id} = req.params
            
                        const listaProductos = await db
                            .select()
                            .from(productos);
                        
                        const listaUsuarios = await db
                            .select()
                            .from(usuarios);
                
                        try {
            
                                const detalle_venta = await db
                                .select({
                                    id: detalleVentas.id,
                                    ventaId: detalleVentas.ventaId,
                                    loteId: detalleVentas.loteId,
                                    productoId: lotes.productoId, 
                                    cantidad: detalleVentas.cantidad,
                                    precio: detalleVentas.precio,
                                    observaciones: detalleVentas.observaciones,
                                    
                                })
                                .from(detalleVentas)
                                .innerJoin(lotes, eq(detalleVentas.loteId, lotes.id))
                                .where(eq(detalleVentas.id, Number(id)));

                                console.log("ID recibido:", id);
                                console.log("RESULTADO:", detalle_venta);
            
                            res.render("componentes/form_editar_venta.hbs", {
                                detalle_venta: detalle_venta[0],
                                productos:listaProductos,
                                // proveedores:listaProveedores
                            });
                
                        } catch (error) {
                            req.flash("mensajes",[{msg:error.message}])
                            return res.redirect('/gestion_ventas/ventas')
                        }
                
                    }

                
            const form_editar_venta= async (req, res) => {

                // const errors=validationResult(req)
                //     if(!errors.isEmpty()){
                //         req.flash("mensajes",errors.array())
                //         return res.redirect(`/gestion_productos/form_editar_producto/${req.params.id}`)
                //     }

                const { id } = req.params;

                const {
                    id_producto,
                    cantidad_embalaje,
                    unidades_embalaje,
                    precio,
                    observaciones
                } = req.body;

                try {
                    await db.transaction(async (tx) => {

                    // ======================
                    // 1. OBTENER DETALLE
                    // ======================
                    const [detalle] = await tx
                        .select()
                        .from(detalleVentas)
                        .where(eq(detalleVentas.id, Number(id)));

                    if (!detalle) {
                        throw new Error("Detalle de venta no encontrado");
                    }

                    // ======================
                    // 2. CALCULAR CANTIDAD
                    // ======================
                    const cantidad = Number(unidades_embalaje || 0);

                    // ======================
                    // 3. ACTUALIZAR DETALLE VENTA
                    // ======================
                    await tx
                        .update(detalleVentas)
                        .set({
                        cantidad: cantidad,
                        precio: precio,
                        observaciones: observaciones
                        })
                        .where(eq(detalleVentas.id, Number(id)));

                    // ======================
                    // 4. ACTUALIZAR LOTE
                    // ======================
                    await tx
                        .update(lotes)
                        .set({
                        productoId: Number(id_producto),
                        
                        })
                        .where(eq(lotes.id, detalle.loteId));

                    // ======================
                    // 5. RECALCULAR PRECIO PRODUCTO
                    // ======================
                    const precioUnitario = Number(precio) / cantidad;

                    // await tx
                    //     .update(productos)
                    //     .set({
                    //     precioReferenciaVenta: precioUnitario.toString()
                    //     })
                    //     .where(eq(productos.id, Number(id_producto)));

                    // ======================
                    // 6. RECALCULAR TOTAL VENTA
                    // ======================
                    const detallesVenta = await tx
                        .select({
                        precio: detalleVentas.precio,
                        cantidad: detalleVentas.cantidad
                        })
                        .from(detalleVentas)
                        .where(eq(detalleVentas.ventaId, detalle.ventaId));

                    let totalVenta = 0;

                    

                    for (const item of detallesVenta) {

                        const subtotal =
                                cantidad *
                                Number(item.precio);

                            totalVenta += subtotal;
                        // totalVenta += Number(item.precio);
                        // totalVenta += subtotal;
                    }

                    await tx
                        .update(ventas)
                        .set({
                        total: totalVenta.toString()
                        })
                        .where(eq(ventas.id, detalle.ventaId));

                    });

                    req.flash("mensajes", [{ msg: "Venta actualizada correctamente" }]);
                    return res.redirect("/gestion_ventas/ventas");

                } catch (error) {
                    console.log(error);
                    req.flash("mensajes", [{ msg: error.message }]);
                    return res.redirect("/gestion_ventas/ventas");
                }
                };

                const filtrar_venta = async (req, res) => {
                    const { fechaInicio,fechaFin, usuario } = req.body;
    
                    try {
    
                        const filtros = [];
    
                        // Filtro por proveedor
                        if (usuario) {
                            filtros.push(
                                ilike(usuarios.nombre, `%${usuario}%`)
                            );
                        }
    
                    
    
                        if (fechaInicio && fechaFin) {
    
                            const inicio = new Date(`${fechaInicio}T00:00:00`);
    
                            const fin = new Date(`${fechaFin}T00:00:00`);
                            fin.setDate(fin.getDate() + 1);
    
                            filtros.push(
                                gte(ventas.createdAt, inicio),
                                lt(ventas.createdAt, fin)
                            );
    
                        } else if (fechaInicio) {
    
                            const inicio = new Date(`${fechaInicio}T00:00:00`);
    
                            filtros.push(
                                gte(ventas.createdAt, inicio)
                            );
    
                        } else if (fechaFin) {
    
                            const fin = new Date(`${fechaFin}T00:00:00`);
                            fin.setDate(fin.getDate() + 1);
    
                            filtros.push(
                                lt(ventas.createdAt, fin)
                            );
                        }
                        const lista_ventas = await db
                        .select({
                            id: ventas.id,
                            usuario: usuarios.nombre,
                            metodoPago:ventas.metodoPago,
                            cliente:ventas.cliente,
                            total: ventas.total,
                            createdAt: ventas.createdAt
                        })
                        .from(ventas)
                        .innerJoin(
                            usuarios,
                            eq(ventas.usuarioId, usuarios.id)
                        ).where(
                                filtros.length > 0
                                    ? and(...filtros)
                                    : undefined
                            );
    
                        const ventas_formateadas = lista_ventas.map(venta => ({
                        ...venta,
                        createdAt: new Date(venta.createdAt).toLocaleDateString('es-CO')
                        }));
    
                    
                        res.render("ventas.hbs", {
                        lista_ventas: ventas_formateadas
                        });
    
                    } catch (error) {
                        req.flash("mensajes", [{ msg: error.message }]);
                        return res.redirect('/gestion_ventas/ventas');
                    }
                    };

                    const eliminar_venta=async(req,res)=>{
                                
                        const {id}=req.params
    
                        
                        try {
                            //aqui agregar la condicion del lote y hacerlo en transaccion
    
                            await db.delete(detalleVentas)
                            .where(eq(detalleVentas.VentaId, id));
    
    
                            await db.delete(movimientosInventario)
                            .where(eq(movimientosInventario.VentaId, id));
    
                            await db.delete(lotes)
                            .where(eq(lotes.VentaId, id));
    
                            await db.delete(ventas).where(eq(ventas.id, id));
                            req.flash("mensajes",[{msg:"venta eliminada"}])
                            res.redirect("/gestion_ventas/ventas")
                        } catch (error) {
                            console.log(error)
                            // res.send("algo fallo")
                            req.flash("mensajes",[{msg:error.message}])
                            return res.redirect('/gestion_ventas/ventas')
                        }
                    }

                    const anularVenta = async (req, res) => {

                        const ventaId = Number(req.params.id);

                        try {

                            await db.transaction(async (tx) => {

                                const [venta] = await tx
                                    .select()
                                    .from(ventas)
                                    .where(eq(ventas.id, ventaId));

                                if (!venta) {
                                    throw new Error("Venta no encontrada");
                                }

                                if (venta.estado === "ANULADA") {
                                    throw new Error("La venta ya fue anulada");
                                }

                                const detalles = await tx
                                    .select()
                                    .from(detalleVentas)
                                    .where(eq(detalleVentas.ventaId, ventaId));

                                for (const detalle of detalles) {

                                    await tx
                                        .update(lotes)
                                        .set({
                                            cantidadActual:
                                                sql`${lotes.cantidadActual} + ${detalle.cantidad}`
                                        })
                                        .where(eq(lotes.id, detalle.loteId));
                                }

                                await tx
                                    .update(ventas)
                                    .set({
                                        estado: "ANULADA"
                                    })
                                    .where(eq(ventas.id, ventaId));

                            });

                            req.flash("mensajes", [
                                { msg: "Venta anulada correctamente" }
                            ]);

                            return res.redirect("/gestion_ventas/ventas");

                        } catch (error) {

                            req.flash("mensajes", [
                                { msg: error.message }
                            ]);

                            return res.redirect("/gestion_ventas/ventas");
                        }
                    };


                    const mostrar_anulados=async(req,res)=>{
                        
                        try {
                                const lista_anulados=await db.select({
                                id: ventas.id,
                                usuario:usuarios.nombre,
                                metodoPago:ventas.metodoPago,
                                cliente:ventas.cliente,
                                total:ventas.total,
                                estado:ventas.estado,
                                createdAt: ventas.createdAt
                
                                
                                }).from(ventas)
                                .innerJoin(
                                usuarios,
                                eq(ventas.usuarioId, usuarios.id) )
                                .where(eq(ventas.estado,"ANULADA"))
        
                                const ventas_formateadas = lista_anulados.map(venta => {
                                        return {
                                            ...venta,
                                            createdAt: new Date(venta.createdAt)
                                                .toLocaleDateString('es-CO')
                                        }})
                                
                
                                const agrupado = Object.values(
                                    ventas_formateadas.reduce((acc, item) => {
                
                                        if (!acc[item.usuario]) {
                                        acc[item.usuario] = {
                                            producto: item.usuario,
                                            ventas: []
                                        };
                                        }
                
                                        acc[item.usuario].ventas.push(item);
                
                                        return acc;
                
                                    }, {})
                                    );
        
        
                                
        
        
                                res.render("anuladas/ventas_anuladas",{agrupado})
                            } catch (error) {
                                console.log(error)
                                // res.send("algo fallo")
                                req.flash("mensajes",[{msg:error.message}])
                                return res.redirect('/gestion_ventas/ventas')
                            }
                        }





module.exports={
    mostrar_venta,
    form_registro_venta,
    obtener_lotes,
    registrarVenta,
    ver_detalle_venta,
    editar_venta,
    form_editar_venta,
    filtrar_venta,
    anularVenta,
    mostrar_anulados
}