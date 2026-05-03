const {usuarios}=require('../src/db/schema')
const  db  = require('../src/db/db'); 
const { eq } = require("drizzle-orm");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const loginForm=(req,res)=>{
    res.render('login')
}

const registerForm=(req,res)=>{
    res.render('register')
    
}

const registrarUsuario=async(req,res)=>{
    
    const {nombre,rol,email,password}=req.body
    try {
    let userExistente = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.email, email))
        

    if (userExistente.length > 0) {
        throw new Error("Ya existe el usuario");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await db
    .insert(usuarios)
    .values({
        nombre,
        email,
        passwordHash,
        rol,
        tokenConfirm:crypto.randomBytes(32).toString("hex")
    })

        res.redirect("/sesion/login")
    // .returning();

    // res.json(nuevoUsuario[0]);

    } catch (error) {
        console.log(error)
        res.json({error:error.message})
    }
    
}

const confirmarCuenta=async(req,res)=>{
    const {token}=req.params

    try {
        const user=await db.select().from(usuarios).where(eq(usuarios.tokenConfirm,token))
        if(user.length===0) throw new Error("No existe este usuario")

        await db
            .update(usuarios)
            .set({
                cuentaConfirmada: true,
                tokenConfirm: null
            })
            .where(eq(usuarios.id, user[0].id));

            res.redirect("/sesion/login")
            
    } catch (error) {
        res.json({error:error.message})
    }

}

const loginUser=async(req,res)=>{
    const {email,password} = req.body

    try {
        const user=await db.select().from(usuarios).where(eq(usuarios.email,email))
        if(user.length===0) throw new Error("No existe este email")

        if(!user[0].cuentaConfirmada) throw new Error("Falta confirmar la cuenta")
        
        const passwordValida = await bcrypt.compare(
            password,
            user[0].passwordHash
        );

        if (!passwordValida) {
            throw new Error("Contraseña incorrecta");
        }

        res.redirect("/")

    } catch (error) {
        res.json({error:error.message})
    }

} 

module.exports={
    loginForm,
    registerForm,
    registrarUsuario,
    confirmarCuenta,
    loginUser
}


// 1:38