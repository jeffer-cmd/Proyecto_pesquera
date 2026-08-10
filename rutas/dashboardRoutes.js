const express=require('express');
const { dashboard } = require('../controladores/controlador_dashboard');
const verificarUser = require('../middleware/verificarUser')
const router=require("express").Router();



router.get(
"/dashboard",verificarUser,dashboard
);


module.exports=router;