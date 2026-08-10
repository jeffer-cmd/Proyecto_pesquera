const {usuarios}=require('../src/db/schema')
const  db  = require('../src/db/db'); 
const { eq,desc } = require("drizzle-orm");
const {validationResult}=require("express-validator")
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { ExpressValidator } = require('express-validator');


const leer_usuario=async(req,res)=>{
        
        try {
            const lista_usuarios=await db.select().from(usuarios).orderBy(
                    desc(usuarios.createdAt)
                )
                .limit(5000);
            
            const usuarios_formateados = lista_usuarios.map(usuario => {
            return {
                ...usuario,
                createdAt: new Date(usuario.createdAt)
                    .toLocaleDateString('es-CO')
            }

            })

            res.render("users",{lista_usuarios:usuarios_formateados})
        } catch (error) {
            // console.log(error)
            // res.send("algo fallo")
            req.flash("mensajes",[{msg:error.message}])
            return res.redirect('/gestion_usuarios/users')
        }
    }

    const eliminar_usuario=async(req,res)=>{
    
            const {id}=req.params
            
            try {
                await db.delete(usuarios).where(eq(usuarios.id, id));
                req.flash("mensajes",[{msg:"usuario eliminado"}])
                res.redirect("/gestion_usuarios/users")
            } catch (error) {
                // console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_usuarios/users')
            }
        }
    
        const editar_usuario=async(req,res)=>{
            const{id} = req.params
    
            try {
    
                // const lista_usuarios=await db.select().from(usuarios).where(eq(usuarios.id, Number(id)));
                
                // res.render("users",{usuario:lista_usuarios[0]})

                    const usuario = await db
                    .select()
                    .from(usuarios)
                    .where(eq(usuarios.id, Number(id)));

                res.render("form_editar_user.hbs", {
                    usuario: usuario[0]
                });
                // res.redirect(`/gestion_usuarios/form_editar_user/${id}`);
    
            } catch (error) {
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect('/gestion_usuarios/users')
            }
    
        }
    
        const editar_usuario_lista=async(req,res)=>{

            const errors=validationResult(req)
            if(!errors.isEmpty()){
                req.flash("mensajes",errors.array())
                return res.redirect(`/gestion_usuarios/form_editar_user/${req.params.id}`)
            }

            const{id} = req.params
            const {nombre,rol,passwordHash}=req.body

            const datosActualizar = {
                        nombre,
                        rol
                    };

                    if(passwordHash){
                        datosActualizar.passwordHash= await bcrypt.hash(passwordHash, 10);
                    }
            // const passwordHash = await bcrypt.hash(password, 10);
            try {
                const lista_usuarios=await db.update(usuarios) .set(
                    datosActualizar
                )
                .where(eq(usuarios.id, Number(id)));
                req.flash("mensajes",[{msg:"usuario editado"}])
                res.redirect("/gestion_usuarios/users")
    
    
            } catch (error) {
                // console.log(error)
                // res.send("algo fallo")
                req.flash("mensajes",[{msg:error.message}])
                return res.redirect(`/gestion_usuarios/form_editar_user/${req.params.id}`)
            }
    
        }   


module.exports={
    leer_usuario,
    eliminar_usuario,
    editar_usuario,
    editar_usuario_lista
}