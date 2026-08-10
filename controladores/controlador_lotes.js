const {productos, compras, ventas,lotes,detalleVentas,movimientosInventario,usuarios, detalleCompras,embalajes}=require('../src/db/schema')
const  db  = require('../src/db/db'); 
const {validationResult}=require("express-validator")
const { eq } = require("drizzle-orm");
const { ExpressValidator } = require('express-validator');
const { ilike,sql,desc } = require("drizzle-orm");
const {  and, gte, lte, lt,gt ,ne } = require("drizzle-orm");
const backupService = require("../services/backupService")
const dump = require("../services/dump")
const databaseBackupService = require("../services/databaseBackupService")
const path = require("path");
const restoreService = require("../services/databaseRestoreService");
const fs = require("fs");



const mostrar_lote=async(req,res)=>{

        // const cantidad_empaques=await db.select({cantidad_embalaje:detalleCompras.cantidad_embalaje}).from(detalleCompras)
        // const cantidad_unidades=await db.select({cantidad_unidad:detalleCompras.cantidad}).from(detalleCompras)
        // const tipo_embalaje=await db.select({tipo_embalaje:embalajes.nombre_embalaje}).from(embalajes)

        // if(cantidad_empaques==cantidad_unidades){
        //     console.log(`Quedan ${cantidad_empaques} ${tipo_embalaje}`)
        // }
        
        try {
                const lista_lotes=await db.select({
                id: lotes.id,
                producto:productos.nombre,
                material:productos.codigoMaterial,
                lote:lotes.codigoLote,
                estado:lotes.estado,
                fechaIngreso:lotes.fechaIngreso,
                fechaVencimiento:lotes.fechaVencimiento,
                cantidadActual:lotes.cantidadActual,


                // cantidadEmbalaje: detalleCompras.cantidad_embalaje,
                // unidadesPorEmbalaje: detalleCompras.cantidad,

                cantidadEmbalaje: sql`SUM(${detalleCompras.cantidad_embalaje})`,
                unidadesPorEmbalaje: sql`SUM(${detalleCompras.cantidad})`,



                tipoEmbalaje: embalajes.nombre_embalaje,
                unidadMedida: productos.unidadMedida,
                
                }).from(lotes)
                .innerJoin(
                productos,
                eq(lotes.productoId, productos.id) )
                .innerJoin(
                detalleCompras,
                // eq(lotes.productoId, productos.id) )
                eq(lotes.id, detalleCompras.loteId))
                .innerJoin(
                embalajes,
                eq(detalleCompras.idEmbalaje, embalajes.id_embalaje)
                )
                .where(gt(lotes.cantidadActual,0))
                .groupBy(
                        lotes.id,
                        productos.nombre,
                        productos.codigoMaterial,
                        lotes.codigoLote,
                        lotes.estado,
                        lotes.fechaIngreso,
                        lotes.fechaVencimiento,
                        lotes.cantidadActual,
                        embalajes.nombre_embalaje,
                        productos.unidadMedida
                    ).orderBy(
                        desc(lotes.fechaIngreso)
                    )
                    .limit(5000);
                
            
            const lotes_formateados = lista_lotes.map(lote => {

            let cantidadMostrar;

            if(Number(lote.cantidadEmbalaje) > 0){

                cantidad_de_empaque= Number(lote.unidadesPorEmbalaje)/Number(lote.cantidadEmbalaje);

                residuo=Number(lote.cantidadActual) % cantidad_de_empaque

                cajas=Number(lote.cantidadActual)/
                    Number(cantidad_de_empaque);

                // cantidadMostrar =Math.floor(cajas)
                cajasEnteras=Math.floor(cajas)



            
                if (residuo===0) {
                        cantidadMostrar = `${cajasEnteras} ${lote.tipoEmbalaje}`;
                    } else {
                        cantidadMostrar = `Menos de ${cajasEnteras+1} ${lote.tipoEmbalaje}`;
                    }
            }else{

                cantidadMostrar =0;
                    

            }


            return {
                ...lote,
                cantidadMostrar
            };

        });

        const productosAgrupados = Object.values(
            lotes_formateados.reduce((acc, lote) => {

                const clave = `${lote.producto}-${lote.material}`;

                if (!acc[clave]) {
                    acc[clave] = {
                        producto: lote.producto,
                        material: lote.material,
                        lotes: []
                    };
                }

                acc[clave].lotes.push(lote);

                return acc;

            }, {})
        );

    
            
                res.render("lotes", {
                    // lista_lotes: lotes_formateados
                    lista_lotes: productosAgrupados
                });

            } catch (error) {
                console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_lotes/lotes')
            }
        }


        const mostrar_lotes_viejos=async(req,res)=>{

        
        try {

                await db
                .update(lotes)
                .set({ estado: "agotado" })
                .where(
                    and(
                        eq(lotes.cantidadActual, 0),
                        ne(lotes.estado, "agotado")
                        )
                )

                const lista_lotes_viejos=await db.select({
                id: lotes.id,
                producto:productos.nombre,
                lote:lotes.codigoLote,
                estado:lotes.estado,
                fechaIngreso:lotes.fechaIngreso,
                fechaVencimiento:lotes.fechaVencimiento,
                cantidadActual:lotes.cantidadActual,
                unidadMedida: productos.unidadMedida
                
                }).from(lotes)
                .innerJoin(
                productos,
                eq(lotes.productoId, productos.id) )
                .where(eq(lotes.cantidadActual,0))
                .orderBy(
                    desc(lotes.fechaIngreso)
                )
                .limit(5000);

                // for (const item of lista_lotes_viejos) {
                //     console.log("Actualizando lote:", item.id);
                //     const resultado=await db.update(lotes)
                //         .set({ estado: "agotado" })
                //         .where(eq(lotes.id, item.id));

                //         console.log("Resultado update:", resultado);
                // }

                // lista_lotes_viejos.forEach(item => {
                //     item.estado = "agotado";
                // });
                                

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


//         const generar_backup = async(req,res)=>{

//     try {

//         await backupService.generarBackup();


//         req.flash(
//             "mensajes",
//             [
//                 {
//                     msg:"Backup generado correctamente"
//                 }
//             ]
//         );


//         return res.redirect("/gestion_lotes/lotes");


//     } catch(error){

//         console.log(error);


//         req.flash(
//             "mensajes",
//             [
//                 {
//                     msg:"Error generando backup"
//                 }
//             ]
//         );


//         return res.redirect("/gestion_lotes/lotes");

//     }

// }

    const generar_backup = async(req,res)=>{

    try {

        // await databaseBackupService.generarBackup(); el de json
        await dump.generarBackup();

        // Genera el Excel
        await backupService.generarBackup();


        // Ubicación del archivo creado
        const archivo = path.join(
            __dirname,
            "../backups/inventario.xlsx"
        );


        // Descargar automáticamente
        res.download(
            archivo,
            "inventario.xlsx",
            (error)=>{

                if(error){

                    console.log(
                        "Error descargando archivo:",
                        error
                    );

                }

            }
        );


    } catch(error){

        console.log(error);


        req.flash(
            "mensajes",
            [
                {
                    msg:"Error generando backup"
                }
            ]
        );


        return res.redirect("/gestion_lotes/lotes");

        }

    };

//BD
    const generar_backup_bd = async(req,res)=>{


    try {


        const archivo =
            await databaseBackupService.generarBackup();



        res.download(
            archivo,
            "backup_base_datos.json"
        );



    } catch(error){


        console.log(error);


        req.flash(
            "mensajes",
            [
                {
                    msg:"Error generando backup de base de datos"
                }
            ]
        );


        return res.redirect(
            "/gestion_lotes/lotes"
        );


    }

};

const restaurar_backup_bd = async(req,res)=>{

    
    try {


        if(!req.file){


            req.flash(
                "mensajes",
                [
                    {
                        msg:"Debe seleccionar un archivo JSON"
                    }
                ]
            );


            return res.redirect(
                "/gestion_lotes/lotes"
            );


        }




        console.log(
            "Archivo recibido:",
            req.file.path
        );



        const resultado =
            await restoreService.restaurarBackup(
                req.file.path
            );




        /*
            Eliminar archivo temporal
            después de restaurar
        */


        fs.unlinkSync(
            req.file.path
        );



        req.flash(
            "mensajes",
            [
                {
                    msg:
                    `Restauración completada. Backup ${resultado.fecha}`
                }
            ]
        );



        return res.redirect(
            "/gestion_lotes/lotes"
        );



    }catch(error){


        console.log(
            error
        );



        req.flash(
            "mensajes",
            [
                {
                    msg:
                    "Error restaurando base de datos"
                }
            ]
        );



        return res.redirect(
            "/gestion_lotes/lotes"
        );


    }


};


        

module.exports={
    mostrar_lote,
    mostrar_lotes_viejos,
    generar_backup,
    generar_backup_bd,
    restaurar_backup_bd 
}