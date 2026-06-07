const express=require('express')
const { leer_pescado, agregar_pescado, eliminar_pescado, editar_pescado, editar_categoria } = require('../controladores/controlador_home')
const verificarUser = require('../middleware/verificarUser')
const accesoRol = require('../middleware/accesoRol')
const { formOperario, AgregaInfoOperario } = require('../controladores/controlador_operario')
const router=express.Router()

    router.get("/",verificarUser,accesoRol,leer_pescado)
    router.post("/",verificarUser,agregar_pescado)
    router.get("/eliminar/:id_categoria",verificarUser,eliminar_pescado)
    router.get("/editar/:id_categoria",verificarUser,editar_pescado)
    router.post("/editar/:id_categoria",verificarUser,editar_categoria)

    router.get("/formulario_operario",verificarUser,formOperario)
    router.post("/formulario_operario",verificarUser,AgregaInfoOperario)


module.exports=router