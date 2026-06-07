const express=require('express')
const verificarUser = require('../middleware/verificarUser')
const { eq } = require("drizzle-orm");
const {body}=require('express-validator');
const { mostrar_producto, form_registro_productos, registrarProducto, eliminar_producto, editar_producto, editar_producto_lista, filtrar_producto, } = require('../controladores/controlador_productos');
const router=express.Router()

router.get("/productos",mostrar_producto)
router.get("/form_producto",form_registro_productos)
router.post("/productos",filtrar_producto)
router.post("/form_producto", [
        body("nombre","Ingrese un nombre válido").trim().notEmpty().escape().isLength({min:4}),
        body("codigoMaterial","Ingrese un código de material válido de 5 números").trim().notEmpty().isLength({min:5, max: 5 }).isNumeric().escape(),
        body("precioReferenciaCompra","El precio de compra debe ser un número válido").notEmpty().isInt({ min: 0 }).isLength({min:5 }).escape(),
        body("precioReferenciaVenta","El precio de venta debe ser un número válido").notEmpty().isInt({ min: 0 }).isLength({min:5}).escape(), 
        body("id_categoria","Debe seleccionar al menos una categoría").notEmpty().escape(),
        body("precioReferenciaVenta", "El precio de venta no puede ser menor al de compra").custom((value, { req }) => {
            if (Number(value) < Number(req.body.precioReferenciaCompra)) {
                throw new Error("El precio de venta no puede ser menor al de compra");
            }
            return true;
            })
        ],registrarProducto)

router.get("/eliminar_producto/:id",eliminar_producto)
router.get("/form_editar_producto/:id",verificarUser,editar_producto)
router.post("/form_editar_producto/:id",verificarUser,[
        body("nombre","Ingrese un nombre válido").trim().notEmpty().escape().isLength({min:4}),
        body("precioReferenciaCompra","El precio de compra debe ser un número válido").notEmpty().isInt({ min: 0 }).isLength({min:5 }).escape(),
        body("precioReferenciaVenta","El precio de venta debe ser un número válido").notEmpty().isInt({ min: 0 }).isLength({min:5}).escape(), 
        body("id_categoria","Debe seleccionar al menos una categoría").notEmpty().escape(),
        body("precioReferenciaVenta", "El precio de venta no puede ser menor al de compra").custom((value, { req }) => {
            if (Number(value) < Number(req.body.precioReferenciaCompra)) {
                throw new Error("El precio de venta no puede ser menor al de compra");
            }
            return true;
            })
        
    ],editar_producto_lista)



module.exports=router