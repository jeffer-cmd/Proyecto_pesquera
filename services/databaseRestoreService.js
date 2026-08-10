// // const fs = require("fs");

// // const db = require("../src/db/db");
// // const schema = require("../src/db/schema");
// // const { sql } = require("drizzle-orm");


// // class DatabaseRestoreService {


// //     async restaurarBackup(archivo){


// //         const contenido =
// //             fs.readFileSync(
// //                 archivo,
// //                 "utf-8"
// //             );


// //         const backup =
// //             JSON.parse(contenido);



// //         console.log(
// //             "Restaurando backup:",
// //             backup.fecha
// //         );

// //         const ordenBorrado = [

// //                     "detalleVentas",

// //                     "detalleCompras",

// //                     "movimientosInventario",

// //                     "lotes",

// //                     "ventas",

// //                     "compras",

// //                     "productos",

// //                     "usuarios",

// //                     "proveedores",

// //                     "embalajes",

// //                     "categorias"

// //                 ];


                
// //         const orden = [

// //             "categorias",

// //             "embalajes",

// //             "proveedores",

// //             "usuarios",

// //             "productos",

// //             "compras",

// //             "lotes",

// //             "detalleCompras",

// //             "ventas",

// //             "detalleVentas",

// //             "movimientosInventario"

// //         ];




// //         await db.transaction(async(tx)=>{


// //             try {

// //                 //borrar primero
// //             for(const nombreTabla of ordenBorrado){

// //                 const tabla = schema[nombreTabla];

// //                 if(!tabla){
// //                     console.log(
// //                         `Tabla no encontrada: ${nombreTabla}`
// //                     );
// //                     continue;
// //                 }


// //                 console.log(
// //                     "Eliminando:",
// //                     nombreTabla
// //                 );


// //                 await tx
// //                     .delete(tabla);

// //             }


// //                 /*
// //                     Insertamos respetando
// //                     relaciones FK
// //                 */


// //                 for(const tablaNombre of orden){



// //                     const tabla =
// //                         schema[tablaNombre];

// //                     if(!tabla){
// //                         console.log(
// //                             `Tabla no encontrada: ${tablaNombre}`
// //                         );
// //                         continue;
// //                     }

// //                     const datos =
// //                         backup.tablas[tablaNombre];



// //                     if(
// //                         !datos ||
// //                         datos.length === 0
// //                     ){

// //                         console.log(
// //                             `Sin datos: ${tablaNombre}`
// //                         );

// //                         continue;

// //                     }



// //                     console.log(
// //                         "Restaurando:",
// //                         tablaNombre,
// //                         datos.length,
// //                         "registros"
// //                     );



// //                     await tx
// //                         .insert(tabla)
// //                         .values(datos);



// //                 }



// //                 console.log(
// //                     "✅ Todas las tablas restauradas"
// //                 );

// //                 const secuencias = [

// //     "categorias_id_categoria_seq",

// //     "embalajes_id_embalaje_seq",

// //     "usuarios_id_seq",

// //     "productos_id_seq",

// //     "proveedores_id_seq",

// //     "compras_id_seq",

// //     "lotes_id_seq",

// //     "detalle_compras_id_seq",

// //     "ventas_id_seq",

// //     "detalle_ventas_id_seq",

// //     "movimientos_inventario_id_seq"

// // ];

// // for(const secuencia of secuencias){

// //     await tx.execute(
// //         sql.raw(`
// //             SELECT setval(
// //                 '${secuencia}',
// //                 COALESCE(
// //                     (SELECT MAX(id) FROM ${secuencia.replace("_id_seq","")}),
// //                     1
// //                 )
// //             );
// //         `)
// //     );

// // }



// //             }catch(error){


// //                 console.log(
// //                     "❌ Error restaurando backup"
// //                 );


// //                 console.log(error);



// //                 /*
// //                     Lanzar error provoca
// //                     rollback automático
// //                 */


// //                 throw error;


// //             }


// //         });



// //         console.log(
// //             "✅ Restauración completada correctamente"
// //         );


// //     }

    


// // }



// // module.exports =
// //     new DatabaseRestoreService();

// const fs = require("fs");

// const db = require("../src/db/db");
// const schema = require("../src/db/schema");

// const { sql } = require("drizzle-orm");

// console.log(schema.proveedores.createdAt);
// console.log(schema.proveedores.createdAt.config);
// console.dir(schema.proveedores.createdAt, { depth: 5 });
// console.log(require.resolve("../src/db/schema"));

// class DatabaseRestoreService {


//     async restaurarBackup(archivo){


//         try {


//             const contenido =
//                 fs.readFileSync(
//                     archivo,
//                     "utf-8"
//                 );


//             const backup =
//                 JSON.parse(contenido);



//             console.log(
//                 "Restaurando backup:",
//                 backup.fecha
//             );



//             /*
//                 Orden para eliminar datos

//                 Primero tablas hijas,
//                 luego tablas padres
//             */

//             const ordenBorrado = [

//                 "detalleVentas",

//                 "detalleCompras",

//                 "movimientosInventario",

//                 "lotes",

//                 "ventas",

//                 "compras",

//                 "productos",

//                 "usuarios",

//                 "proveedores",

//                 "embalajes",

//                 "categorias"

//             ];



//             /*
//                 Orden para insertar datos

//                 Primero padres,
//                 luego hijos
//             */

//             const ordenInsercion = [

//                 "categorias",

//                 "embalajes",

//                 "proveedores",

//                 "usuarios",

//                 "productos",

//                 "compras",

//                 "lotes",

//                 "detalleCompras",

//                 "ventas",

//                 "detalleVentas",

//                 "movimientosInventario"

//             ];




//             await db.transaction(async(tx)=>{


//                 /*
//                     1. LIMPIAR BASE DE DATOS
//                 */


//                 console.log(
//                     "🗑️ Eliminando datos actuales..."
//                 );


//                 for(
//                     const nombreTabla
//                     of ordenBorrado
//                 ){


//                     const tabla =
//                         schema[nombreTabla];



//                     if(!tabla){

//                         console.log(
//                             `Tabla no encontrada: ${nombreTabla}`
//                         );

//                         continue;

//                     }



//                     console.log(
//                         "Eliminando:",
//                         nombreTabla
//                     );



//                     await tx
//                         .delete(tabla);


//                 }





//                 /*
//                     2. INSERTAR BACKUP
//                 */


//                 console.log(
//                     "📥 Insertando información..."
//                 );



//                 for(
//                     const nombreTabla
//                     of ordenInsercion
//                 ){


//                     const tabla =
//                         schema[nombreTabla];



//                     if(!tabla){

//                         console.log(
//                             `Tabla no encontrada: ${nombreTabla}`
//                         );

//                         continue;

//                     }



//                     let datos =
//                         backup.tablas[nombreTabla];



//                     if(
//                         !datos ||
//                         datos.length === 0
//                     ){


//                         console.log(
//                             `Sin datos: ${nombreTabla}`
//                         );


//                         continue;

//                     }



//                     /*
//                         Limpiar datos temporales
//                     */

//                     const camposFecha = {
//                         usuarios: ["createdAt"],
//                         proveedores: ["createdAt"],
//                         productos: ["createdAt", "updatedAt"],
//                         compras: ["createdAt"],
//                         lotes: ["createdAt", "fechaIngreso", "fechaVencimiento"],
//                         ventas: ["fecha", "createdAt"],
//                         movimientosInventario: ["fecha"]
//                     };

//                     const fechas = camposFecha[nombreTabla] ?? [];


//                     datos =
//                         datos.map(registro=>{


//                             const copia = {
//                                 ...registro
//                             };

//                     for (const campo of fechas) {

//                         if (copia[campo]) {

//                             copia[campo] = new Date(copia[campo]).toISOString();

//                         }

//                     }

//                             delete copia.tokenConfirm;


//                             return copia;


//                         });




//                     console.log(

//                         "Restaurando:",
//                         nombreTabla,
//                         datos.length,
//                         "registros"

//                     );


//                     console.log("TABLA:", nombreTabla);

//                     console.log(datos[0]);

//                     console.log(Object.keys(datos[0]));

//                     console.log(
//                             "TIPO FECHA:",
//                             nombreTabla,
//                             typeof datos[0]?.fechaIngreso,
//                             datos[0]?.fechaIngreso instanceof Date
//                         );

//                         console.log(
//                                 nombreTabla,
//                                 datos[0]
//                                 );

                        

//                 await tx
//                         .insert(tabla)
//                         .values(datos);
                    


//                 }





//                 /*
//                     3. ACTUALIZAR SECUENCIAS SERIAL
//                 */


//                 console.log(
//                     "🔄 Actualizando secuencias..."
//                 );



//                 const secuencias = [


//                     {
//                         secuencia:
//                         "categorias_id_categoria_seq",

//                         tabla:
//                         "categorias",

//                         columna:
//                         "id_categoria"
//                     },


//                     {
//                         secuencia:
//                         "embalajes_id_embalaje_seq",

//                         tabla:
//                         "embalajes",

//                         columna:
//                         "id_embalaje"
//                     },


//                     {
//                         secuencia:
//                         "usuarios_id_seq",

//                         tabla:
//                         "usuarios",

//                         columna:
//                         "id"
//                     },


//                     {
//                         secuencia:
//                         "productos_id_seq",

//                         tabla:
//                         "productos",

//                         columna:
//                         "id"
//                     },


//                     {
//                         secuencia:
//                         "proveedores_id_seq",

//                         tabla:
//                         "proveedores",

//                         columna:
//                         "id"
//                     },


//                     {
//                         secuencia:
//                         "compras_id_seq",

//                         tabla:
//                         "compras",

//                         columna:
//                         "id"
//                     },


//                     {
//                         secuencia:
//                         "lotes_id_seq",

//                         tabla:
//                         "lotes",

//                         columna:
//                         "id"
//                     },


//                     {
//                         secuencia:
//                         "detalle_compras_id_seq",

//                         tabla:
//                         "detalle_compras",

//                         columna:
//                         "id"
//                     },


//                     {
//                         secuencia:
//                         "ventas_id_seq",

//                         tabla:
//                         "ventas",

//                         columna:
//                         "id"
//                     },


//                     {
//                         secuencia:
//                         "detalle_ventas_id_seq",

//                         tabla:
//                         "detalle_ventas",

//                         columna:
//                         "id"
//                     },


//                     {
//                         secuencia:
//                         "movimientos_inventario_id_seq",

//                         tabla:
//                         "movimientos_inventario",

//                         columna:
//                         "id"
//                     }


//                 ];





//                 for(
//                     const item
//                     of secuencias
//                 ){


//                     await tx.execute(

//                         sql.raw(`

//                             SELECT setval(
//                                 '${item.secuencia}',
//                                 COALESCE(
//                                     (
//                                         SELECT MAX(${item.columna})
//                                         FROM ${item.tabla}
//                                     ),
//                                     1
//                                 )
//                             );

//                         `)

//                     );


//                 }





//             });



//             console.log(
//                 "✅ Restauración completada correctamente"
//             );



//             return {

//                 ok:true,

//                 fecha:backup.fecha

//             };



//         }catch(error){


//             console.log(
//                 "❌ Error restaurando backup"
//             );


//             console.log(error);



//             throw error;


//         }



//     }



// }



// module.exports =
//     new DatabaseRestoreService();