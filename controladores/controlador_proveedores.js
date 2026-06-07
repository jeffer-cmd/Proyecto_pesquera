const {proveedores}=require('../src/db/schema')
const  db  = require('../src/db/db'); 
const {validationResult}=require("express-validator")
const { eq } = require("drizzle-orm");
const { ExpressValidator } = require('express-validator');

const mostrar_proveedor=async(req,res)=>{
        try {
                const lista_proveedores=await db.select().from(proveedores)
                
                const proveedores_formateados = lista_proveedores.map(proveedor => {
                return {
                    ...proveedor,
                    createdAt: new Date(proveedor.createdAt)
                        .toLocaleDateString('es-CO')
                }
    
                })
    
                res.render("proveedores",{lista_proveedores:proveedores_formateados})
            } catch (error) {
                // console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_proveedores/proveedores')
            }
        }
//     // res.render('proveedores')
    
// }


const form_registro_proveedor=(req,res)=>{
    res.render('componentes/form_proveedor')
}

const registrarProveedor=async(req,res)=>{
    
    const errors=validationResult(req)
        if(!errors.isEmpty()){
            req.flash("mensajes",errors.array())
            return res.redirect('/gestion_proveedores/form_proveedor')
        }

    const {nombre,telefono,direccion,email}=req.body
    try {
    let proveedorExistente = await db
        .select()
        .from(proveedores)
        .where(eq(proveedores.nombre,nombre))
        

    if (proveedorExistente.length > 0) {
        throw new Error("Ya existe el proveedor");
    }

    const nuevoProveedor = await db
    .insert(proveedores)
    .values({
        nombre,
        telefono,
        direccion,
        email
    })
        req.flash("mensajes",[{msg:"proveedor agregado"}])
        return res.redirect("/gestion_proveedores/proveedores")
    // .returning();

    // res.json(nuevoUsuario[0]);

    } catch (error) {
        req.flash("mensajes",[{msg:error.message}])
        return res.redirect('/gestion_proveedores/form_proveedor')
        // console.log(error)
        // res.json({error:error.message})
    }
    
}

    const eliminar_proveedor=async(req,res)=>{
    
            const {id}=req.params
            
            try {
                await db.delete(proveedores).where(eq(proveedores.id, id));
                req.flash("mensajes",[{msg:"proveedor eliminado"}])
                res.redirect("/gestion_proveedores/proveedores")
            } catch (error) {
                // console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_proveedores/proveedores')
            }
        }
    
        const editar_proveedor=async(req,res)=>{
            const{id} = req.params
    
            try {

                    const proveedor = await db
                    .select()
                    .from(proveedores)
                    .where(eq(proveedores.id, Number(id)));

                res.render("componentes/form_editar_proveedor.hbs", {
                    proveedor: proveedor[0]
                });
    
            } catch (error) {
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_proveedores/proveedores')
            }
    
        }
    
        const editar_proveedor_lista=async(req,res)=>{

            const errors=validationResult(req)
            if(!errors.isEmpty()){
                req.flash("mensajes",errors.array())
                return res.redirect(`/gestion_proveedores/form_editar_proveedor/${req.params.id}`)
            }

            const{id} = req.params
            const {nombre,telefono,direccion,email}=req.body

            try {
                const lista_proveedores=await db.update(proveedores) .set({
                    nombre,
                    telefono,
                    direccion,
                    email
                })
                .where(eq(proveedores.id, Number(id)));
                req.flash("mensajes",[{msg:"proveedor editado"}])
                res.redirect("/gestion_proveedores/proveedores")
    
    
            } catch (error) {
                // console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect(`/gestion_proveedores/form_editar_proveedor/${req.params.id}`)
            }
    
        }   


module.exports={
    mostrar_proveedor,
    registrarProveedor,
    form_registro_proveedor,
    editar_proveedor,
    editar_proveedor_lista,
    eliminar_proveedor
}
