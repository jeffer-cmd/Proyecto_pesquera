const {productos, compras, ventas,lotes,detalleVentas,movimientosInventario,usuarios}=require('../src/db/schema')
const  db  = require('../src/db/db'); 
const {validationResult}=require("express-validator")
const { eq } = require("drizzle-orm");
const { ExpressValidator } = require('express-validator');
const { ilike } = require("drizzle-orm");
const {  and, gte, lte, lt,gt,sql  } = require("drizzle-orm");



module.exports.formOperario=async(req,res)=>{

    console.log("entro a form operario")
    const listaProductos = await db
        .select()
        .from(productos);

        console.log("PRODUCTOS OPERARIO:", listaProductos);
    res.render("formulario_operario",{
                productos:listaProductos
})}

module.exports.AgregaInfoOperario=async(req,res)=>{
    // aqui va la logica de enviar los datos a la bd y que la muestre
    res.redirect("/")
}
