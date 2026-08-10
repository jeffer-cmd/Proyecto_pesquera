const express=require('express')
const verificarUser = require('../middleware/verificarUser')
const { eq } = require("drizzle-orm");
const {body}=require('express-validator');
const { mostrar_lote, mostrar_lotes_viejos,generar_backup, generar_backup_bd, restaurar_backup_bd } = require('../controladores/controlador_lotes');
const uploadBackup =require("../middleware/uploadBackup")

const csrf = require("csurf");
const accesoAdmin = require('../middleware/accesoAdmin');

const csrfProtection = csrf();




const router=express.Router()

router.get("/lotes",verificarUser,mostrar_lote)
router.get("/lotes_viejos",verificarUser,accesoAdmin,mostrar_lotes_viejos)
router.post("/generar-backup",verificarUser,accesoAdmin, generar_backup);
router.post("/generar-backup-bd",verificarUser,accesoAdmin, generar_backup_bd);
// router.post("/restaurar-backup-bd",verificarUser,accesoAdmin,uploadBackup.single("backup"),csrfProtection,restaurar_backup_bd);



module.exports=router