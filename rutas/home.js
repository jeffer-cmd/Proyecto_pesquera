const express=require('express')
const { leer_pescado, agregar_pescado, eliminar_pescado, editar_pescado, editar_categoria, agregar_embalaje, eliminar_embalaje, editar_embalaje, editar_empaque } = require('../controladores/controlador_home')
const verificarUser = require('../middleware/verificarUser')
const { formOperario, AgregaInfoOperario } = require('../controladores/controlador_operario')
const {body}=require('express-validator');
const accesoAdmin = require('../middleware/accesoAdmin')
const accesoOperario = require('../middleware/accesoOperario');
const { registrarVenta } = require('../controladores/controlador_ventas');
const router=express.Router()

    router.get("/",verificarUser,accesoAdmin,leer_pescado,)
    router.post("/",verificarUser,accesoAdmin,agregar_pescado)
    router.get("/eliminar/:id_categoria",verificarUser,accesoAdmin,eliminar_pescado)
    router.get("/editar/:id_categoria",verificarUser,accesoAdmin,editar_pescado)
    router.post("/editar/:id_categoria",verificarUser,accesoAdmin,editar_categoria)

    // router.get("/",verificarUser,accesoRol,leer_embalaje)
    router.post("/embalaje",verificarUser,accesoAdmin,agregar_embalaje)
    router.get("/embalaje/eliminar/:id_embalaje",verificarUser,accesoAdmin,eliminar_embalaje)
    router.get("/embalaje/editar/:id_embalaje",verificarUser,accesoAdmin,editar_embalaje)
    router.post("/embalaje/editar/:id_embalaje",verificarUser,accesoAdmin,editar_empaque)


    // router.get("/formulario_operario",formOperario)
    router.get("/formulario_operario",verificarUser,accesoOperario,formOperario)
    router.post("/formulario_operario",verificarUser,accesoOperario,[
                    body("lotes.*.loteId","Debe agregar al menos un lote").notEmpty().escape(),
                    body("lotes.*.productoId","Debe seleccionar al menos un producto").notEmpty().escape(),
                    body("lotes.*.unidadesPorCaja","Ingrese una cantidad de merma válida").notEmpty().trim().bail().isInt({ min: 1 }),
    ],registrarVenta)


module.exports=router