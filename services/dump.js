// const fs = require("fs");
// const path = require("path");
// const { spawn } = require("child_process");

// const BACKUP_DIR = path.join(
//     __dirname,
//     "../backupsBDdump"
// );

// const HISTORY_DIR = path.join(
//     BACKUP_DIR,
//     "historial"
// );

// // URL de conexión a Neon
// const DATABASE_URL = process.env.DATABASE_URL;

// fs.mkdirSync(
//     HISTORY_DIR,
//     {
//         recursive: true
//     }
// );


// class dump {

//     async generarBackup() {

//         try {

//             if (!DATABASE_URL) {

//                 throw new Error(
//                     "DATABASE_URL no está definida"
//                 );

//             }


//             /*
//              * Fecha del backup
//              */

//             const fecha = new Date()
//                 .toISOString()
//                 .replace(/:/g, "-")
//                 .replace(/\..+/, "");


//             /*
//              * Nombre del archivo
//              */

//             const nombreArchivo =
//                 `neon_backup_${fecha}.dump`;


//             const archivoBackup = path.join(
//                 HISTORY_DIR,
//                 nombreArchivo
//             );
//             // const archivoBackup = path.join(
//             //     BACKUP_DIR,
//             //     nombreArchivo
//             // );


//             console.log(
//                 "Iniciando backup PostgreSQL..."
//             );


//             /*
//              * Ejecutar pg_dump
//              */
//             // const PG_DUMP = "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe";
//             const PG_DUMP = "pg_dump";
//             await new Promise(
//                 (resolve, reject) => {


//                     const pgDump = spawn(
//                         PG_DUMP,
//                         [
//                             "--format=custom",
//                             "--compress=6",
//                             "--file",
//                             archivoBackup,
//                             DATABASE_URL
//                         ],
//                         {
//                             windowsHide: true
//                         }
//                     );


//                     let errorOutput = "";


//                     pgDump.stderr.on(
//                         "data",
//                         (data) => {

//                             const mensaje =
//                                 data.toString();

//                             console.log(
//                                 mensaje
//                             );

//                             errorOutput += mensaje;

//                         }
//                     );


//                     pgDump.on(
//                         "error",
//                         (error) => {

//                             reject(error);

//                         }
//                     );


//                     pgDump.on(
//                         "close",
//                         (codigo) => {

//                             if (codigo === 0) {

//                                 resolve();

//                             } else {

//                                 reject(
//                                     new Error(
//                                         `pg_dump terminó con código ${codigo}\n${errorOutput}`
//                                     )
//                                 );

//                             }

//                         }
//                     );

//                 }
//             );


//             /*
//              * Verificar que realmente se creó
//              */

//             if (!fs.existsSync(archivoBackup)) {

//                 throw new Error(
//                     "pg_dump terminó correctamente pero no se encontró el archivo"
//                 );

//             }


//             /*
//              * Copiar al historial
//              */

//             // const archivoHistorial =
//             //     path.join(
//             //         HISTORY_DIR,
//             //         nombreArchivo
//             //     );


//             // fs.copyFileSync(
//             //     archivoBackup,
//             //     archivoHistorial
//             // );


//             /*
//              * Mantener solamente
//              * los últimos 5 backups
//              */

//             this.limpiarHistorial(5);


//             console.log(
//                 "✅ Backup PostgreSQL generado correctamente:"
//             );

//             console.log(
//                 archivoBackup
//             );


//             return archivoBackup;


//         } catch (error) {

//             console.error(
//                 "❌ Error generando backup PostgreSQL:"
//             );

//             console.error(
//                 // error
//             );

//             throw error;

//         }

//     }


//     limpiarHistorial(maxArchivos = 5) {

//         try {

//             const archivos =
//                 fs.readdirSync(
//                     HISTORY_DIR
//                 )
//                 .filter(
//                     archivo =>
//                         archivo.endsWith(".dump")
//                 )
//                 .map(
//                     archivo => {

//                         const ruta =
//                             path.join(
//                                 HISTORY_DIR,
//                                 archivo
//                             );

//                         return {

//                             nombre: archivo,

//                             ruta,

//                             fecha:
//                                 fs.statSync(
//                                     ruta
//                                 ).mtime

//                         };

//                     }
//                 )
//                 .sort(
//                     (a, b) =>
//                         b.fecha - a.fecha
//                 );


//             if (
//                 archivos.length <=
//                 maxArchivos
//             ) {

//                 return;

//             }


//             const archivosEliminar =
//                 archivos.slice(
//                     maxArchivos
//                 );


//             archivosEliminar.forEach(
//                 archivo => {

//                     fs.unlinkSync(
//                         archivo.ruta
//                     );

//                     console.log(
//                         `🗑 Backup eliminado: ${archivo.nombre}`
//                     );

//                 }
//             );


//         } catch (error) {

//             console.error(
//                 "Error limpiando historial de backups:",
//                 error
//             );

//         }

//     }

// }


// module.exports =
//     new dump();

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const {
    PutObjectCommand,
    ListObjectsV2Command,
    ListObjectVersionsCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");

const b2 = require("../src/db/backblaze");

const DATABASE_URL = process.env.DATABASE_URL;
const BUCKET_NAME = process.env.B2_BUCKET_NAME;

// Usamos /tmp porque Render no será nuestro almacenamiento permanente
const BACKUP_DIR = path.join("/tmp", "backupsBDdump");

fs.mkdirSync(BACKUP_DIR, {
    recursive: true
});


class dump {

    async generarBackup() {

        let archivoBackup = null;

        try {

            if (!DATABASE_URL) {
                throw new Error(
                    "DATABASE_URL no está definida"
                );
            }

            if (!BUCKET_NAME) {
                throw new Error(
                    "B2_BUCKET_NAME no está definido"
                );
            }


            /*
             * Fecha del backup
             */

            const fecha = new Date()
                .toISOString()
                .replace(/:/g, "-")
                .replace(/\..+/, "");


            /*
             * Nombre del archivo
             */

            const nombreArchivo =
                `neon_backup_${fecha}.dump`;


            archivoBackup = path.join(
                BACKUP_DIR,
                nombreArchivo
            );


            console.log(
                "🔄 Iniciando backup PostgreSQL..."
            );


            /*
             * Ejecutar pg_dump
             */

            const PG_DUMP = "pg_dump";

            await new Promise(
                (resolve, reject) => {

                    const pgDump = spawn(
                        PG_DUMP,
                        [
                            "--format=custom",
                            "--compress=6",
                            "--file",
                            archivoBackup,
                            DATABASE_URL
                        ],
                        {
                            windowsHide: true
                        }
                    );


                    let errorOutput = "";


                    pgDump.stderr.on(
                        "data",
                        (data) => {

                            const mensaje =
                                data.toString();

                            console.log(
                                mensaje
                            );

                            errorOutput += mensaje;

                        }
                    );


                    pgDump.on(
                        "error",
                        (error) => {

                            reject(error);

                        }
                    );


                    pgDump.on(
                        "close",
                        (codigo) => {

                            if (codigo === 0) {

                                resolve();

                            } else {

                                reject(
                                    new Error(
                                        `pg_dump terminó con código ${codigo}\n${errorOutput}`
                                    )
                                );

                            }

                        }
                    );

                }
            );


            /*
             * Verificar que se creó
             */

            if (!fs.existsSync(archivoBackup)) {

                throw new Error(
                    "pg_dump terminó correctamente pero no se encontró el archivo"
                );

            }


            console.log(
                `✅ Backup generado: ${nombreArchivo}`
            );


            /*
             * Subir a Backblaze B2
             */

            console.log(
                "☁️ Subiendo backup a Backblaze B2..."
            );


            await b2.send(
                new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: nombreArchivo,
                    Body: fs.createReadStream(
                        archivoBackup
                    ),
                    ContentType:
                        "application/octet-stream"
                })
            );


            console.log(
                "✅ Backup subido correctamente a Backblaze B2"
            );


            /*
             * Eliminar archivo temporal
             */

            fs.unlinkSync(
                archivoBackup
            );

            console.log(
                "🗑️ Archivo temporal eliminado"
            );


            /*
             * Mantener solamente
             * los últimos 5 backups
             */

            await this.limpiarHistorial(3);


            console.log(
                "✅ Backup PostgreSQL completado correctamente"
            );


            return nombreArchivo;


        } catch (error) {

            console.error(
                "❌ Error generando backup PostgreSQL:"
            );

            console.error(
                error
            );


            /*
             * Si algo falló y quedó
             * un archivo temporal,
             * intentamos eliminarlo.
             */

            if (
                archivoBackup &&
                fs.existsSync(archivoBackup)
            ) {

                try {

                    fs.unlinkSync(
                        archivoBackup
                    );

                } catch (errorEliminar) {

                    console.error(
                        "No se pudo eliminar el archivo temporal:",
                        errorEliminar
                    );

                }

            }


            throw error;

        }

    }


    // async limpiarHistorial(maxArchivos = 3) {

    //     try {

    //         /*
    //          * Obtener archivos del bucket
    //          */

    //         const respuesta =
    //             await b2.send(
    //                 new ListObjectsV2Command({
    //                     Bucket: BUCKET_NAME
    //                 })
    //             );


    //         const archivos =
    //             (respuesta.Contents || [])
    //                 .filter(
    //                     archivo =>
    //                         archivo.Key &&
    //                         archivo.Key.endsWith(".dump")
    //                 )
    //                 .sort(
    //                     (a, b) =>
    //                         new Date(b.LastModified) -
    //                         new Date(a.LastModified)
    //                 );


    //         /*
    //          * Si tenemos 5 o menos,
    //          * no hacemos nada.
    //          */

    //         if (
    //             archivos.length <=
    //             maxArchivos
    //         ) {

    //             return;

    //         }


    //         /*
    //          * Los que están después
    //          * de los primeros 5
    //          * se eliminan.
    //          */

    //         const archivosEliminar =
    //             archivos.slice(
    //                 maxArchivos
    //             );


    //         for (
    //             const archivo
    //             of archivosEliminar
    //         ) {

    //             await b2.send(
    //                 new DeleteObjectCommand({
    //                     Bucket: BUCKET_NAME,
    //                     Key: archivo.Key
    //                 })
    //             );


    //             console.log(
    //                 `🗑 Backup eliminado de B2: ${archivo.Key}`
    //             );

    //         }


    //     } catch (error) {

    //         console.error(
    //             "Error limpiando historial de backups:",
    //             error
    //         );

    //     }

    // }

    async limpiarHistorial(maxArchivos = 3) {

    try {

        /*
         * Obtener objetos actuales del bucket
         */

        const respuesta =
            await b2.send(
                new ListObjectsV2Command({
                    Bucket: BUCKET_NAME,
                    Prefix: "neon_backup_"
                })
            );


        const archivos =
            (respuesta.Contents || [])
                .filter(
                    archivo =>
                        archivo.Key &&
                        archivo.Key.endsWith(".dump")
                )
                .sort(
                    (a, b) =>
                        new Date(b.LastModified) -
                        new Date(a.LastModified)
                );


        /*
         * Mantener los últimos X backups
         */

        if (
            archivos.length <=
            maxArchivos
        ) {

            console.log(
                `ℹ️ Hay ${archivos.length} backups. No es necesario limpiar.`
            );

            return;

        }


        /*
         * Los objetos antiguos
         */

        const archivosEliminar =
            archivos.slice(
                maxArchivos
            );


        console.log(
            `🧹 Se encontraron ${archivosEliminar.length} backups antiguos para eliminar.`
        );


        /*
         * Para cada objeto antiguo,
         * buscamos TODAS sus versiones.
         */

        for (
            const archivo
            of archivosEliminar
        ) {

            console.log(
                `🗑️ Procesando: ${archivo.Key}`
            );


            const versiones =
                await b2.send(
                    new ListObjectVersionsCommand({
                        Bucket: BUCKET_NAME,
                        Prefix: archivo.Key
                    })
                );


            /*
             * Versiones normales
             */

            const objectVersions =
                (versiones.Versions || [])
                    .filter(
                        version =>
                            version.Key ===
                            archivo.Key &&
                            version.VersionId
                    );


            /*
             * Delete markers
             */

            const deleteMarkers =
                (versiones.DeleteMarkers || [])
                    .filter(
                        marker =>
                            marker.Key ===
                            archivo.Key &&
                            marker.VersionId
                    );


            /*
             * Eliminar todas las versiones
             */

            for (
                const version
                of objectVersions
            ) {

                await b2.send(
                    new DeleteObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: version.Key,
                        VersionId: version.VersionId
                    })
                );


                console.log(
                    `   🗑 Versión eliminada: ${version.VersionId}`
                );

            }


            /*
             * Eliminar también los delete markers
             */

            for (
                const marker
                of deleteMarkers
            ) {

                await b2.send(
                    new DeleteObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: marker.Key,
                        VersionId: marker.VersionId
                    })
                );


                console.log(
                    `   🗑 Delete marker eliminado: ${marker.VersionId}`
                );

            }


            console.log(
                `✅ Backup eliminado completamente: ${archivo.Key}`
            );

        }


    } catch (error) {

        console.error(
            "❌ Error limpiando historial de backups:",
            error
        );

    }

}

}


module.exports =
    new dump();