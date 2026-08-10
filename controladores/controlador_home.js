const {categorias}=require('../src/db/schema')
const {embalajes,detalleCompras,productos}=require('../src/db/schema')
const  db  = require('../src/db/db'); 
const { eq } = require("drizzle-orm");

const leer_pescado=async(req,res)=>{
        
        try {
            const categorias_pez = await db.select().from(categorias);
            const embalaje_pez = await db.select().from(embalajes);
            
            res.render("home",{categorias_pez:categorias_pez,embalaje_pez:embalaje_pez})
        
        
        
        } catch (error) {
            // console.log(error)
            // res.send("algo fallo")
            req.flash("mensajes",[{msg:error.message}])
            return res.redirect('/')
        }
    }

    const agregar_pescado=async(req,res)=>{
        const {pescado}=req.body
        try {
            const resultado = await db.insert(categorias).values({
            nombre_categoria: pescado,

            });
            console.log(resultado)
            req.flash("mensajes",[{msg:"categoria agregada"}])
            res.redirect("/")
        } catch (error) {
            // console.log(error)
            // res.send("error, algo fallo")
            req.flash("mensajes",[{msg:error.message}])
            return res.redirect('/')
        }

    }

    const eliminar_pescado=async(req,res)=>{

        const {id_categoria}=req.params
        
        try {

            const uso = await db
            .select({ id: productos.id })
            .from(productos)
            .where(eq(productos.idCategoria, Number(id_categoria)))
            .limit(1);

        if (uso.length > 0) {
            req.flash("mensajes", [{
                msg: "No se puede eliminar la categoría porque está asociada a un producto."
            }]);
            return res.redirect("/");
        }
            await db.delete(categorias).where(eq(categorias.id_categoria, id_categoria));
            req.flash("mensajes",[{msg:"Categoria eliminada"}])
            res.redirect("/")
        } catch (error) {
            // console.log(error)
            // res.send("algo fallo")
            req.flash("mensajes",[{msg:error.message}])
            return res.redirect('/')
        }
    }

    const editar_pescado=async(req,res)=>{
        const{id_categoria} = req.params
        // const {pescado}=req.body

        try {

            const categorias_pez=await db.select().from(categorias).where(eq(categorias.id_categoria, Number(id_categoria)));
            
            res.render("home",{categoria:categorias_pez[0]})

            // const categorias_pez=await db.update(categorias) .set({
            // nombre_categoria: pescado})
            // .where(eq(categorias.id_categoria, Number(id_categoria)));
            // res.render("home",{categorias_pez})


        } catch (error) {
            // console.log(error)
            // res.send("algo fallo")
            req.flash("mensajes",[{msg:error.message}])
            return res.redirect('/')
        }

    }

    const editar_categoria=async(req,res)=>{
        const{id_categoria} = req.params
        const {pescado}=req.body

        try {
            const categorias_pez=await db.update(categorias) .set({
            nombre_categoria: pescado})
            .where(eq(categorias.id_categoria, Number(id_categoria)));
            req.flash("mensajes",[{msg:"Categoria editada"}])
            res.redirect("/")


        } catch (error) {
            // console.log(error)
            // res.send("algo fallo")
            req.flash("mensajes",[{msg:error.message}])
            return res.redirect('/')
        }

    }  

// const leer_embalaje=async(req,res)=>{
        
//         // try {
//         //     const embalaje_pez=await db.select().from(embalajes)
            
//         //     res.render("home",{embalaje_pez:embalaje_pez})
//         // } catch (error) {
//         //     // console.log(error)
//         //     // res.send("algo fallo")
//         //     req.flash("mensajes",[{msg:error.message}])
//         //     return res.redirect('/')
//         // }
//     }

    const agregar_embalaje=async(req,res)=>{
        const {empaque}=req.body
        try {
            const resultado = await db.insert(embalajes).values({
            nombre_embalaje: empaque,

            });
            
            req.flash("mensajes",[{msg:"embalaje agregada"}])
            res.redirect("/")
        } catch (error) {
            // console.log(error)
            // res.send("error, algo fallo")
            req.flash("mensajes",[{msg:error.message}])
            return res.redirect('/')
        }

    }

    const eliminar_embalaje=async(req,res)=>{

        const {id_embalaje}=req.params

        
        try {


              // Verificar si el embalaje está siendo utilizado
        const uso = await db
            .select({ id: detalleCompras.id })
            .from(detalleCompras)
            .where(eq(detalleCompras.idEmbalaje, Number(id_embalaje)))
            .limit(1);

        if (uso.length > 0) {
            req.flash("mensajes", [{
                msg: "No se puede eliminar el embalaje porque está asociado a una compra."
            }]);
            return res.redirect("/");
        }


            await db.delete(embalajes).where(eq(embalajes.id_embalaje, id_embalaje));
            req.flash("mensajes",[{msg:"Embalaje eliminado"}])
            res.redirect("/")
        } catch (error) {
            // console.log(error)
            // res.send("algo fallo")
            req.flash("mensajes",[{msg:error.message}])
            return res.redirect('/')
        }
    }

    const editar_embalaje=async(req,res)=>{
        const{id_embalaje} = req.params
        // const {pescado}=req.body

        try {

            const embalajes_pez=await db.select().from(embalajes).where(eq(embalajes.id_embalaje, Number(id_embalaje)));
            
            res.render("home",{embalaje:embalajes_pez[0]})

            // const categorias_pez=await db.update(categorias) .set({
            // nombre_categoria: pescado})
            // .where(eq(categorias.id_categoria, Number(id_categoria)));
            // res.render("home",{categorias_pez})


        } catch (error) {
            // console.log(error)
            // res.send("algo fallo")
            req.flash("mensajes",[{msg:error.message}])
            return res.redirect('/')
        }

    }

    const editar_empaque=async(req,res)=>{
        const{id_embalaje} = req.params
        const {empaque}=req.body

        try {
            const embalajes_pez=await db.update(embalajes) .set({
            nombre_embalaje: empaque})
            .where(eq(embalajes.id_embalaje, Number(id_embalaje)));
            req.flash("mensajes",[{msg:"Embalaje editado"}])
            res.redirect("/")


        } catch (error) {
            // console.log(error)
            // res.send("algo fallo")
            req.flash("mensajes",[{msg:error.message}])
            return res.redirect('/')
        }

    }   

module.exports={
    leer_pescado,
    agregar_pescado,
    eliminar_pescado,
    editar_pescado,
    editar_categoria,
    // leer_embalaje,
    agregar_embalaje,
    eliminar_embalaje,
    editar_embalaje,
    editar_empaque
}