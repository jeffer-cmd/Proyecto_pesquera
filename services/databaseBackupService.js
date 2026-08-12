// const fs = require("fs");
// const path = require("path");
// const archiver = require("archiver");
// const db = require("../src/db/db");
// const schema = require("../src/db/schema")


// class BackupService {


//     constructor(){

//         this.backupDir = path.join(
//             __dirname,
//             "../backupsBD"
//         );

//         fs.mkdirSync(
//             this.backupDir,
//             {
//                 recursive:true
//             }
//         );

//     }



//     async generarBackup(){


//         const fecha = new Date()
//             .toISOString()
//             .replace(/:/g,"-")
//             .split(".")[0];



//         const carpetaTemporal = path.join(
//             this.backupDir,
//             `backup_temporal_${fecha}`
//         );



//         const dataDir = path.join(
//             carpetaTemporal,
//             "data"
//         );



//         fs.mkdirSync(
//             dataDir,
//             {
//                 recursive:true
//             }
//         );



//         const metadata = {

//             fecha,

//             motor:"PostgreSQL",

//             tablas:[]

//         };



//         /*
//             Recorremos automáticamente
//             todas las tablas exportadas
//             desde schema.js
//         */

//         for(const [nombreExportado, tabla] 
//             of Object.entries(schema)){



//             console.log(
//                 "Backup tabla:",
//                 nombreExportado
//             );



//             const datos = await db
//                 .select()
//                 .from(tabla);



//             const archivo = path.join(
//                 dataDir,
//                 `${nombreExportado}.json`
//             );



//             fs.writeFileSync(

//                 archivo,

//                 JSON.stringify(
//                     datos,
//                     null,
//                     2
//                 )

//             );



//             metadata.tablas.push({

//                 tabla:nombreExportado,

//                 registros:datos.length

//             });


//         }



//         fs.writeFileSync(

//             path.join(
//                 carpetaTemporal,
//                 "metadata.json"
//             ),

//             JSON.stringify(
//                 metadata,
//                 null,
//                 2
//             )

//         );



//         const zipDestino = path.join(

//             this.backupDir,

//             `backup_empresa_${fecha}.zip`

//         );



//         await this.crearZip(

//             carpetaTemporal,

//             zipDestino

//         );



//         fs.rmSync(

//             carpetaTemporal,

//             {
//                 recursive:true,
//                 force:true
//             }

//         );



//         console.log(
//             "Backup terminado:",
//             zipDestino
//         );


//         return zipDestino;


//     }





//     crearZip(origen,destino){


//         return new Promise(

//             (resolve,reject)=>{


//                 const output =
//                     fs.createWriteStream(
//                         destino
//                     );


//                 const zip =
//                     archiver(
//                         "zip",
//                         {
//                             zlib:{
//                                 level:9
//                             }
//                         }
//                     );



//                 output.on(
//                     "close",
//                     resolve
//                 );



//                 zip.on(
//                     "error",
//                     reject
//                 );



//                 zip.pipe(
//                     output
//                 );



//                 zip.directory(
//                     origen,
//                     false
//                 );



//                 zip.finalize();


//             }

//         );


//     }


// }


// module.exports =
//     new BackupService();

const fs = require("fs");
const path = require("path");

const db = require("../src/db/db");
const schema = require("../src/db/schema");


const BACKUP_DIR = path.join(
    __dirname,
    "../backupsBD"
);


const HISTORY_DIR = path.join(
    BACKUP_DIR,
    "historial"
);


const DATABASE_FILE = path.join(
    BACKUP_DIR,
    "base_datos.json"
);



fs.mkdirSync(
    HISTORY_DIR,
    {
        recursive:true
    }
);



class DatabaseBackupService {


    async generarBackup(){


        try {


            const fecha = new Date()
                .toISOString()
                .replace(/:/g,"-")
                .split(".")[0];



            const backupCompleto = {

                fecha,

                motor:"PostgreSQL",

                tablas:{}

            };



            for(
                const [nombreTabla, tabla]
                of Object.entries(schema)
            ){


                console.log(
                    `Respaldando ${nombreTabla}...`
                );



                const registros = await db
                    .select()
                    .from(tabla);



                const registrosLimpios =
                    registros.map(registro=>{


                        const copia = {
                            ...registro
                        };


                        // eliminar información sensible

                        // delete copia.passwordHash;
                        delete copia.tokenConfirm;


                        return copia;

                    });



                backupCompleto.tablas[nombreTabla] =
                    registrosLimpios;


            }




            /*
                Guardar backup actual
            */

            fs.writeFileSync(

                DATABASE_FILE,

                JSON.stringify(
                    backupCompleto,
                    null,
                    2
                )

            );



            /*
                Guardar historial
            */


            const copiaHistorial = path.join(

                HISTORY_DIR,

                `base_datos-${fecha}.json`

            );



            fs.copyFileSync(

                DATABASE_FILE,

                copiaHistorial

            );


            // this.limpiarHistorial(5);

            console.log(
                "✅ Backup BD generado correctamente"
            );


            return DATABASE_FILE;



        } catch(error){


            console.log(
                "❌ Error generando backup BD"
            );


            console.log(error);


            throw error;


        }


    }

    limpiarHistorial(maxArchivos = 5) {

    try {

        const archivos = fs.readdirSync(HISTORY_DIR)
            .filter(file => file.endsWith(".json"))
            .map(file => {

                const ruta = path.join(HISTORY_DIR, file);

                return {
                    nombre: file,
                    ruta,
                    fecha: fs.statSync(ruta).mtime
                };

            })
            .sort((a, b) => b.fecha - a.fecha);

        if (archivos.length <= maxArchivos) {
            return;
        }

        const archivosEliminar = archivos.slice(maxArchivos);

        archivosEliminar.forEach(archivo => {

            fs.unlinkSync(archivo.ruta);

            console.log(`🗑 Backup eliminado: ${archivo.nombre}`);

        });

    } catch (error) {

        console.error(
            "Error limpiando historial de backups:",
            error
        );

    }

}


}



module.exports =
    new DatabaseBackupService();