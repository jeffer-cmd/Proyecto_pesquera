const express=require('express')
const verificarUser = require('../middleware/verificarUser')
const { eq } = require("drizzle-orm");
const {body}=require('express-validator');
const { mostrar_inventario, mostrar_anulados } = require('../controladores/controlador_inventario');
const accesoAdmin = require('../middleware/accesoAdmin');



const router=express.Router()

router.get("/inventario",verificarUser,accesoAdmin,mostrar_inventario,)
router.get("/inventario_anulado",verificarUser,accesoAdmin,mostrar_anulados)



module.exports=router