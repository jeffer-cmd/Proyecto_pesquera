const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const BACKUP_DIR = path.join(
    __dirname,
    "../backupsBDdump"
);

const HISTORY_DIR = path.join(
    BACKUP_DIR,
    "historial"
);

// URL de conexión a Neon
const DATABASE_URL = process.env.DATABASE_URL;

fs.mkdirSync(
    HISTORY_DIR,
    {
        recursive: true
    }
);


class dump {

    async generarBackup() {

        try {

            if (!DATABASE_URL) {

                throw new Error(
                    "DATABASE_URL no está definida"
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


            const archivoBackup = path.join(
                HISTORY_DIR,
                nombreArchivo
            );
            // const archivoBackup = path.join(
            //     BACKUP_DIR,
            //     nombreArchivo
            // );


            console.log(
                "Iniciando backup PostgreSQL..."
            );


            /*
             * Ejecutar pg_dump
             */
            // const PG_DUMP = "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe";
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
             * Verificar que realmente se creó
             */

            if (!fs.existsSync(archivoBackup)) {

                throw new Error(
                    "pg_dump terminó correctamente pero no se encontró el archivo"
                );

            }


            /*
             * Copiar al historial
             */

            // const archivoHistorial =
            //     path.join(
            //         HISTORY_DIR,
            //         nombreArchivo
            //     );


            // fs.copyFileSync(
            //     archivoBackup,
            //     archivoHistorial
            // );


            /*
             * Mantener solamente
             * los últimos 5 backups
             */

            this.limpiarHistorial(5);


            console.log(
                "✅ Backup PostgreSQL generado correctamente:"
            );

            console.log(
                archivoBackup
            );


            return archivoBackup;


        } catch (error) {

            console.error(
                "❌ Error generando backup PostgreSQL:"
            );

            console.error(
                // error
            );

            throw error;

        }

    }


    limpiarHistorial(maxArchivos = 5) {

        try {

            const archivos =
                fs.readdirSync(
                    HISTORY_DIR
                )
                .filter(
                    archivo =>
                        archivo.endsWith(".dump")
                )
                .map(
                    archivo => {

                        const ruta =
                            path.join(
                                HISTORY_DIR,
                                archivo
                            );

                        return {

                            nombre: archivo,

                            ruta,

                            fecha:
                                fs.statSync(
                                    ruta
                                ).mtime

                        };

                    }
                )
                .sort(
                    (a, b) =>
                        b.fecha - a.fecha
                );


            if (
                archivos.length <=
                maxArchivos
            ) {

                return;

            }


            const archivosEliminar =
                archivos.slice(
                    maxArchivos
                );


            archivosEliminar.forEach(
                archivo => {

                    fs.unlinkSync(
                        archivo.ruta
                    );

                    console.log(
                        `🗑 Backup eliminado: ${archivo.nombre}`
                    );

                }
            );


        } catch (error) {

            console.error(
                "Error limpiando historial de backups:",
                error
            );

        }

    }

}


module.exports =
    new dump();