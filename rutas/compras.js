const express=require('express')
const verificarUser = require('../middleware/verificarUser')
const { eq } = require("drizzle-orm");
const {body}=require('express-validator');
const { mostrar_compra, form_registro_compra, registrarCompra, eliminar_compra, ver_detalle_compra, editar_compra, form_editar_compra, filtrar_compra, anularCompra, mostrar_anulados} = require('../controladores/controlador_compras');

const router=express.Router()

router.get("/compras",mostrar_compra)
router.get("/form_compra",form_registro_compra)
router.post("/form_compra",[
            body("id_proveedor","Debe seleccionar al menos un proveedor").notEmpty().escape(),
            body("fechaIngreso","Debe seleccionar al menos una fecha de ingreso").notEmpty().escape(),
            body("productos","Debe agregar al menos un producto").isArray({min:1}),
            body("productos.*.productoId","Debe seleccionar al menos un producto").notEmpty().escape(),
            body("productos.*.unidadesPorCaja","Ingrese una cantidad en unidades por embalaje válida").notEmpty().trim().isInt({ min: 1 }),
            body("productos.*.precio","El precio de compra debe ser un número válido").notEmpty().isInt({ min: 0 }).isLength({min:4 }).escape(),
            body("productos.*.fechaVencimiento","Debe seleccionar una fecha de vencimiento").notEmpty().custom((value, { req }) => {

            const fechaIngreso = new Date(req.body.fechaIngreso);
            const fechaVencimiento = new Date(value);

            if (fechaVencimiento <= fechaIngreso) {
                throw new Error("La fecha de vencimiento debe ser mayor a la fecha de ingreso");
            }

            return true;
        }),
],registrarCompra)
router.post("/compras",filtrar_compra)


router.get("/anular_compra/:id",anularCompra)
router.get("/ver_detalle_compra/:id",ver_detalle_compra)
router.get("/form_editar_compra/:id",editar_compra)
router.post("/form_editar_compra/:id",[
            // body("productoId","Debe seleccionar al menos un producto").notEmpty().escape(),
            // body("unidades_embalaje","Ingrese una cantidad en unidades por embalaje válida").notEmpty().trim().isInt({ min: 1 }),
            body("precio","El precio de compra debe ser un número válido").notEmpty().isInt({ min: 0 }).isLength({min:4 }).escape(),

],form_editar_compra)

router.get("/compras_anuladas",mostrar_anulados)




module.exports=router