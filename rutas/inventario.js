const express=require('express')
const verificarUser = require('../middleware/verificarUser')
const { eq } = require("drizzle-orm");
const {body}=require('express-validator');
const { mostrar_inventario, mostrar_anulados } = require('../controladores/controlador_inventario');



const router=express.Router()

router.get("/inventario",mostrar_inventario)
router.get("/inventario_anulado",mostrar_anulados)



module.exports=router