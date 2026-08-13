const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const db = require("../src/db/db");
const schema = require("../src/db/schema")

const BACKUP_DIR = path.join(__dirname, "../backups");
const HISTORY_DIR = path.join(BACKUP_DIR, "historial");
const EXCEL_FILE = path.join(BACKUP_DIR, "inventario.xlsx");
const { desc } = require("drizzle-orm");
const {
    productos,
    categorias,
    proveedores,
    lotes,
    detalleCompras,
    compras,
    movimientosInventario,
    usuarios,
    ventas,
    detalleVentas,
    embalajes
} = require("../src/db/schema");

// Crear carpetas automáticamente
fs.mkdirSync(HISTORY_DIR, { recursive: true });

class BackupService {

    async generarBackup() {

        try {

            const workbook = new ExcelJS.Workbook();

            // Abrir si existe
            if (fs.existsSync(EXCEL_FILE)) {

                console.log("📂 Abriendo backup existente...");
                await workbook.xlsx.readFile(EXCEL_FILE);

            } else {

                console.log("📄 Creando nuevo backup...");
            }

            const ORDEN_TABLAS = {
            productos: productos.createdAt,
            categorias: categorias.id_categoria,
            proveedores: proveedores.createdAt,
            lotes: lotes.createdAt,
            detalleCompras: detalleCompras.id,
            compras: compras.createdAt,
            movimientosInventario: movimientosInventario.fecha,
            usuarios: usuarios.createdAt,
            ventas: ventas.fecha,
            detalleVentas: detalleVentas.id,
            embalajes: embalajes.id_embalaje
            };

            const MAX_REGISTROS = 5000;

        

            // Recorrer todas las tablas exportadas en schema.js
            for (const [nombreTabla, tabla] of Object.entries(schema)) {

                console.log(`Respaldando ${nombreTabla}...`);

                const columnaOrden = ORDEN_TABLAS[nombreTabla];

                const registros = await db
                    .select()
                    .from(tabla)
                    .orderBy(desc(columnaOrden))
                    .limit(MAX_REGISTROS);

                // let hoja = workbook.getWorksheet(nombreTabla);

                // if (!hoja) {
                //     hoja = workbook.addWorksheet(nombreTabla);
                // }

                let hoja = workbook.getWorksheet(nombreTabla);

                if (hoja) {

                    workbook.removeWorksheet(hoja.id);

                }

                hoja = workbook.addWorksheet(nombreTabla);

                // Si no hay registros
                if (registros.length === 0) {

                    hoja.spliceRows(2, hoja.rowCount);

                    continue;

                }

                // Crear columnas automáticamente
                const columnas = Object.keys(registros[0])
                    .filter(col => ![
                        "passwordHash",
                        "tokenConfirm"
                    ].includes(col));

                hoja.columns = columnas.map(col => ({
                    header: col,
                    key: col,
                    width: 25
                }));

                // Limpiar datos anteriores
                if (hoja.rowCount > 1) {

                    hoja.spliceRows(2, hoja.rowCount - 1);

                }

                // Insertar datos
                registros.forEach(registro => {

                    const fila = {};

                    columnas.forEach(col => {

                        fila[col] = registro[col];

                    });

                    hoja.addRow(fila);

                });

            }

            // Guardar archivo principal
            await workbook.xlsx.writeFile(EXCEL_FILE);

            // Crear copia histórica
            const fecha = new Date()
                .toISOString()
                .replace(/:/g, "-")
                .split(".")[0];

            const copia = path.join(
                HISTORY_DIR,
                `inventario-${fecha}.xlsx`
            );

            fs.copyFileSync(EXCEL_FILE, copia);


            this.limpiarHistorial(5);

            console.log("✅ Backup generado correctamente.");


        } catch (error) {

            console.error("❌ Error al generar el backup:");
            console.error(error);

        }

    }

     limpiarHistorial(maxArchivos = 5) {

        try {

            const archivos = fs.readdirSync(HISTORY_DIR)
                .filter(file => file.endsWith(".xlsx"))
                .map(file => {

                    const ruta = path.join(HISTORY_DIR, file);

                    return {
                        nombre: file,
                        ruta,
                        fecha: fs.statSync(ruta).mtime
                    };

                })
                .sort((a, b) => b.fecha - a.fecha); // Más recientes primero

            if (archivos.length <= maxArchivos) {
                return;
            }

            const archivosEliminar = archivos.slice(maxArchivos);

            archivosEliminar.forEach(archivo => {

                fs.unlinkSync(archivo.ruta);

                console.log(`🗑 Backup eliminado: ${archivo.nombre}`);

            });

        } catch (error) {

            console.error("Error limpiando historial:", error);

        }

    }

}

module.exports = new BackupService();