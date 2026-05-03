const express=require('express')
const { loginForm, registerForm, registrarUsuario, confirmarCuenta, loginUser } = require('../controladores/controlador_sesion')
const router=express.Router()

router.get("/register",registerForm)
router.post("/register",registrarUsuario)
router.get("/confirmarCuenta/:token",confirmarCuenta)
router.get("/login",loginForm)
router.post("/login",loginUser)

  

module.exports=router