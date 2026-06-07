const {productos, categorias, proveedores}=require('../src/db/schema')
const  db  = require('../src/db/db'); 
const {validationResult}=require("express-validator")
const { eq } = require("drizzle-orm");
const { ExpressValidator } = require('express-validator');
const { ilike } = require("drizzle-orm");

const mostrar_producto=async(req,res)=>{
        try {
                const lista_productos=await db.select({
                id: productos.id,
                nombre: productos.nombre,
                proveedor:proveedores.nombre,
                codigoMaterial: productos.codigoMaterial,
                unidadMedida: productos.unidadMedida,
                categoria: categorias.nombre_categoria,
                precioReferenciaCompra: productos.precioReferenciaCompra,
                precioReferenciaVenta: productos.precioReferenciaVenta,
                createdAt: productos.createdAt
                }).from(productos)
                .innerJoin(
                categorias,
                eq(productos.idCategoria, categorias.id_categoria)
            ).leftJoin(
                proveedores,
                eq(productos.idProveedor, proveedores.id))
                
                const productos_formateados = lista_productos.map(producto => {
                return {
                    ...producto,
                    createdAt: new Date(producto.createdAt)
                        .toLocaleDateString('es-CO')
                }
    
                })
    
                res.render("productos",{lista_productos:productos_formateados})
            } catch (error) {
                // console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_productos/productos')
            }
        }
//     // res.render('proveedores')
    
// }


const form_registro_productos=async (req,res)=>{
    const listaCategorias = await db
        .select()
        .from(categorias);

        const listaProveedores = await db
        .select()
        .from(proveedores);
      
    res.render('componentes/form_producto',{
        categorias:listaCategorias,
        proveedores:listaProveedores
        
    })
  
}

const registrarProducto=async(req,res)=>{
    
    const errors=validationResult(req)
        if(!errors.isEmpty()){
            req.flash("mensajes",errors.array())
            return res.redirect('/gestion_productos/form_producto')
        }

    const {nombre,codigoMaterial,id_proveedor,unidadMedida,id_categoria,precioReferenciaCompra,precioReferenciaVenta}=req.body
    try {
    let productoExistente = await db
        .select()
        .from(productos)
        .where(eq(productos.codigoMaterial,codigoMaterial))
        

    if (productoExistente.length > 0) {
        throw new Error("Ya existe el producto");
        
    }

    // console.log(req.body);

    const nuevoProducto = await db
    .insert(productos)
    .values({
        nombre,
        codigoMaterial,
        idProveedor:Number(id_proveedor),
        unidadMedida,
        idCategoria: Number(id_categoria),
        precioReferenciaCompra:Number(precioReferenciaCompra),
        precioReferenciaVenta:Number(precioReferenciaVenta),
        
    })

        req.flash("mensajes",[{msg:"producto agregado"}])
        return res.redirect("/gestion_productos/productos")
    // .returning();

    // res.json(nuevoUsuario[0]);

    } catch (error) {
        
        req.flash("mensajes",[{msg:error.message}])
        return res.redirect('/gestion_productos/form_producto')
        // console.log(error)
        // res.json({error:error.message})
    }
    
}

    const eliminar_producto=async(req,res)=>{
    
            const {id}=req.params
            
            
            try {
                await db.delete(productos).where(eq(productos.id, id));
                req.flash("mensajes",[{msg:"producto eliminado"}])
                res.redirect("/gestion_productos/productos")
            } catch (error) {
                console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_productos/productos')
            }
        }
    
        const editar_producto=async(req,res)=>{
            const{id} = req.params

            const listaCategorias = await db
                .select()
                .from(categorias);
            
            const listaProveedores = await db
                .select()
                .from(proveedores);
    
            try {

                    const producto = await db
                    .select()
                    .from(productos)
                    .where(eq(productos.id, Number(id)));

                res.render("componentes/form_editar_producto.hbs", {
                    producto: producto[0],
                    categorias:listaCategorias,
                    proveedores:listaProveedores
                });
    
            } catch (error) {
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_productos/productos')
            }
    
        }
    
        const editar_producto_lista=async(req,res)=>{

            const errors=validationResult(req)
            if(!errors.isEmpty()){
                req.flash("mensajes",errors.array())
                return res.redirect(`/gestion_productos/form_editar_producto/${req.params.id}`)
            }

            const{id} = req.params
            const {nombre,unidadMedida,id_proveedor,id_categoria,precioReferenciaCompra,precioReferenciaVenta}=req.body

            try {
                const lista_productos=await db.update(productos) .set({
                    nombre,
                    idProveedor:Number(id_proveedor),
                    unidadMedida,
                    idCategoria:Number(id_categoria),
                    precioReferenciaCompra:Number(precioReferenciaCompra),
                    precioReferenciaVenta:Number(precioReferenciaVenta),
                })
                .where(eq(productos.id, Number(id)));
                req.flash("mensajes",[{msg:"producto editado"}])
                res.redirect("/gestion_productos/productos")
    
    
            } catch (error) {
                // console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect(`/gestion_productos/form_editar_producto/${req.params.id}`)
            }
    
        }   


        const filtrar_producto = async (req, res) => {

            const { nombre } = req.body;

            try {
                
                const lista_productos = await db
                    .select({
                    id: productos.id,
                    nombre: productos.nombre,
                    proveedor:proveedores.nombre,
                    codigoMaterial: productos.codigoMaterial,
                    unidadMedida: productos.unidadMedida,
                    categoria: categorias.nombre_categoria,
                    precioReferenciaCompra: productos.precioReferenciaCompra,
                    precioReferenciaVenta: productos.precioReferenciaVenta,
                    createdAt: productos.createdAt
                    })
                    .from(productos)
                    .where(
                        nombre
                            ? ilike(productos.nombre, `%${nombre}%`)
                            : undefined
                    ).innerJoin(
                    categorias,
                    eq(productos.idCategoria, categorias.id_categoria)
                ).innerJoin(
                proveedores,
                eq(productos.idProveedor, proveedores.id))
    
                    const productos_formateados = lista_productos.map(producto => {
                    return {
                        ...producto,
                        createdAt: new Date(producto.createdAt)
                            .toLocaleDateString('es-CO')
                    }
        
                    })
                res.render("productos.hbs", {
                    lista_productos:productos_formateados
                });
            } catch (error) {
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_productos/productos')
            }
        }
            
                


module.exports={
    mostrar_producto,
    form_registro_productos,
    registrarProducto,
    eliminar_producto,
    editar_producto,
    editar_producto_lista,
    filtrar_producto
}
