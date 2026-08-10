const express=require('express')
const {body}=require('express-validator')
const { loginForm, registerForm, registrarUsuario, confirmarCuenta, loginUser, cerrarSesion } = require('../controladores/controlador_sesion')
const router=express.Router()

router.get("/register",registerForm)
router.post("/register",[
    body("nombre","Ingrese un nombre válido").trim().notEmpty().escape(),
    body("email","Ingrese un email válido").trim().isEmail().normalizeEmail(),
    body("rol", "Debe seleccionar un rol").notEmpty().bail().isIn(["admin", "empleado"]),
    body("password","Ingrese una contraseña de minimo 6 carácteres").trim().isLength({min:4}).escape().custom((value,{req})=>{
        if(value!== req.body.passwordRepit){
            throw new Error("No coinciden las contraseñas")

        }else{
            return value
        }
    })
],registrarUsuario)
router.get("/confirmarCuenta/:token",confirmarCuenta)
router.get("/login",loginForm)
router.post("/login",[
    // body("email","Ingrese un email válido").trim().isEmail().normalizeEmail(),
    body("password","Ingrese una contraseña de minimo 6 carácteres").trim().isLength({min:4}).escape()
],loginUser)

router.get('/logout',cerrarSesion)

module.exports=router
