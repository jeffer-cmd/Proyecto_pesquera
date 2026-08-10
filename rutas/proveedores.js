const express=require('express')
const verificarUser = require('../middleware/verificarUser')
const { eq } = require("drizzle-orm");
const {body}=require('express-validator')
const { mostrar_proveedor, form_registro_proveedor, registrarProveedor,eliminar_proveedor, editar_proveedor,
    editar_proveedor_lista,} = require('../controladores/controlador_proveedores');
const accesoAdmin = require('../middleware/accesoAdmin');
const router=express.Router()

    router.get("/proveedores",verificarUser,accesoAdmin,mostrar_proveedor)
    router.get("/form_proveedor",verificarUser,accesoAdmin,form_registro_proveedor)
    router.post("/form_proveedor",[
        body("nombre","Ingrese un nombre válido").trim().notEmpty(),
        body("email","Ingrese un email válido").trim().isEmail().normalizeEmail(),
        body("telefono","El teléfono debe tener entre 7 y 15 caracteres numericos").trim().isLength({ min: 7, max: 15 }).bail().isNumeric(),
        body("direccion","La dirección debe tener entre 5 y 100 caracteres").trim().isLength({ min: 5, max: 100 })
    ],verificarUser,accesoAdmin, registrarProveedor)
    router.get("/eliminar_proveedor/:id",verificarUser,accesoAdmin,eliminar_proveedor)
    router.get("/form_editar_proveedor/:id",verificarUser,accesoAdmin,editar_proveedor)
    router.post("/form_editar_proveedor/:id",verificarUser,accesoAdmin,[
        body("nombre","Ingrese un nombre válido").trim().notEmpty(),
        body("email","Ingrese un email válido").trim().isEmail().normalizeEmail(),
        body("telefono","El teléfono debe tener entre 7 y 15 caracteres numericos").trim().isLength({ min: 7, max: 15 }).bail().isNumeric(),
        body("direccion","La dirección debe tener entre 5 y 100 caracteres").trim().isLength({ min: 5, max: 100 })
    ],editar_proveedor_lista)


module.exports=router