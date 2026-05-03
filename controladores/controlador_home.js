const {categorias}=require('../src/db/schema')
const  db  = require('../src/db/db'); 
const { eq } = require("drizzle-orm");

const leer_pescado=async(req,res)=>{
        
        try {
            const categorias_pez=await db.select().from(categorias)
            
            res.render("home",{categorias_pez:categorias_pez})
        } catch (error) {
            console.log(error)
            res.send("algo fallo")
        }
    }

    const agregar_pescado=async(req,res)=>{
        const {pescado}=req.body
        try {
            const resultado = await db.insert(categorias).values({
            nombre_categoria: pescado,

            });
            console.log(resultado)
            res.redirect("/")
        } catch (error) {
            console.log(error)
            res.send("error, algo fallo")
        }

    }

    const eliminar_pescado=async(req,res)=>{

        const {id_categoria}=req.params
        
        try {
            await db.delete(categorias).where(eq(categorias.id_categoria, id_categoria));
            res.redirect("/")
        } catch (error) {
            console.log(error)
            res.send("algo fallo")
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
            console.log(error)
            res.send("algo fallo")
        }

    }

    const editar_categoria=async(req,res)=>{
        const{id_categoria} = req.params
        const {pescado}=req.body

        try {
            const categorias_pez=await db.update(categorias) .set({
            nombre_categoria: pescado})
            .where(eq(categorias.id_categoria, Number(id_categoria)));
            res.redirect("/")


        } catch (error) {
            console.log(error)
            res.send("algo fallo")
        }

    }   

module.exports={
    leer_pescado,
    agregar_pescado,
    eliminar_pescado,
    editar_pescado,
    editar_categoria
}