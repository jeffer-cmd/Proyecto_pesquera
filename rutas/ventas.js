const express=require('express')
const verificarUser = require('../middleware/verificarUser')
const { eq } = require("drizzle-orm");
const {body}=require('express-validator');
const { mostrar_venta, form_registro_venta, obtener_lotes, registrarVenta, ver_detalle_venta, editar_venta, form_editar_venta, filtrar_venta, anularVenta, mostrar_anulados } = require('../controladores/controlador_ventas');


const router=express.Router()

router.get("/ventas",mostrar_venta)
router.get("/form_venta",form_registro_venta)
router.get("/obtener_lotes/:productoId",obtener_lotes)
router.post("/form_venta",[
            // body("cliente","Debe ingresar un cliente para continuar").notEmpty().escape(),
            // body("metodoPago","Debe seleccionar al menos un método de pago").notEmpty().escape(),
            body("lotes.*.loteId","Debe agregar al menos un lote").notEmpty().escape(),
            body("lotes.*.productoId","Debe seleccionar al menos un producto").notEmpty().escape(),
            body("lotes.*.unidadesPorCaja","Ingrese una cantidad en unidades por embalaje válida").notEmpty().trim().isInt({ min: 1 }),
            // body("lotes.*.precio","El precio de compra debe ser un número válido").notEmpty().isInt({ min: 0 }).isLength({min:4 }).escape(),



],registrarVenta)
router.get("/ver_detalle_venta/:id",ver_detalle_venta)
router.get("/form_editar_venta/:id",editar_venta)
router.post("/form_editar_venta/:id",[
            body("productoId","Debe seleccionar al menos un producto").notEmpty().escape(),
            body("unidades_embalaje","Ingrese una cantidad en unidades por embalaje válida").notEmpty().trim().isInt({ min: 1 }),
            body("precio","El precio de compra debe ser un número válido").notEmpty().isInt({ min: 0 }).isLength({min:4 }).escape(),

],form_editar_venta)
router.post("/ventas",filtrar_venta),
router.get("/anular_venta/:id", anularVenta);
router.get("/ventas_anuladas",mostrar_anulados)




module.exports=router