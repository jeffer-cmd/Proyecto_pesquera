const {usuarios}=require('../src/db/schema')
const  db  = require('../src/db/db'); 
const {validationResult}=require("express-validator")
const { eq } = require("drizzle-orm");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { ExpressValidator } = require('express-validator');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const loginForm=(req,res)=>{
    res.render('login')
    // ,{mensajes:req.flash("mensajes")})
}

const registerForm=(req,res)=>{
    res.render('register')
    // ,{mensajes:req.flash("mensajes")})
    
}

const registrarUsuario=async(req,res)=>{
    
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        req.flash("mensajes",errors.array())
        return res.redirect('/sesion/register')
    }

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
    const tokenConfirm = crypto.randomBytes(32).toString("hex")

    const nuevoUsuario = await db
    .insert(usuarios)
    .values({
        nombre,
        email,
        passwordHash,
        rol,
        tokenConfirm
    })
    
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: [email],
            subject: 'verifique su cuenta de correo',
            html:`Bienvenido a pesquera el marinero, por favor confirme su cuenta en el siguiente enlace: 
            <a href="${ process.env.PATH_DE_RENDER ||'http://localhost:5000'}/sesion/confirmarCuenta/${tokenConfirm}">verificar cuenta aquí</a>`,
        });

        if (error) {    
            // return console.error({ error });
            throw new Error(error.message);
        }

        console.log({ data });
    

        req.flash("mensajes",[{msg:"Revisa tu correo electrónico y válida cuenta"}])

        return res.redirect("/sesion/login")
    // .returning();

    // res.json(nuevoUsuario[0]);

    } catch (error) {
        req.flash("mensajes",[{msg:error.message}])
        return res.redirect('/sesion/register')
        // console.log(error)
        // res.json({error:error.message})
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


            req.flash("mensajes",[{msg:"Cuenta verificada, puedes iniciar sesión"}])

            res.redirect("/sesion/login")
            
    } catch (error) {
        req.flash("mensajes",[{msg:error.message}])
        return res.redirect('/sesion/login')
    }

}

const loginUser=async(req,res)=>{

    const errors=validationResult(req)
    if(!errors.isEmpty()){
        req.flash("mensajes",errors.array())
        return res.redirect('/sesion/login')
    }
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
// crea la sesion de usuario a traves de passport   
        req.login(user[0],function(err){
            if(err) throw new Error ('error al crear la sesion')
            return res.redirect("/")
        })

    } catch (error) {
        req.flash("mensajes",[{msg:error.message}])
        return res.redirect('/sesion/login')
        // res.json({error:error.message})
    }

} 

const cerrarSesion=(req,res)=>{
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        return res.redirect('/sesion/login')
    });
}

module.exports={
    loginForm,
    registerForm,
    registrarUsuario,
    confirmarCuenta,
    loginUser,
    cerrarSesion
}


