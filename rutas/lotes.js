const express=require('express')
const verificarUser = require('../middleware/verificarUser')
const { eq } = require("drizzle-orm");
const {body}=require('express-validator');
const { mostrar_lote, mostrar_lotes_viejos } = require('../controladores/controlador_lotes');




const router=express.Router()

router.get("/lotes",mostrar_lote)
router.get("/lotes_viejos",mostrar_lotes_viejos)



module.exports=router