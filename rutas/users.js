const express=require('express')
const verificarUser = require('../middleware/verificarUser')
const { leer_usuario, eliminar_usuario, editar_usuario, editar_usuario_lista } = require('../controladores/controlador_users')
const { eq } = require("drizzle-orm");
const {body}=require('express-validator')
const router=express.Router()

    router.get("/users",verificarUser,leer_usuario)
    router.get("/eliminar_users/:id",verificarUser,eliminar_usuario)
    router.get("/form_editar_user/:id",verificarUser,editar_usuario)
    router.post("/form_editar_user/:id",verificarUser,[
    body("nombre","Ingrese un nombre válido").trim().notEmpty().escape(),

    // body("password","Ingrese una contraseña de mínimo 6 caracteres").optional({ checkFalsy: true }).isLength({ min: 6 }).escape()

    body("passwordHash").trim().isLength({ min: 0 }).custom((value) => {
    if (!value) return true;
    if (value.length < 6) {
        throw new Error("La contraseña debe tener mínimo 6 caracteres");
    }
    return true;
    })
],editar_usuario_lista)


module.exports=router