const express=require('express')
const { leer_pescado, agregar_pescado, eliminar_pescado, editar_pescado, editar_categoria } = require('../controladores/controlador_home')
const router=express.Router()

    router.get("/",leer_pescado)
    router.post("/",agregar_pescado)
    router.get("/eliminar/:id_categoria",eliminar_pescado)
    router.get("/editar/:id_categoria",editar_pescado)
    router.post("/editar/:id_categoria",editar_categoria)


module.exports=router