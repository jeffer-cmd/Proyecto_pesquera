const express=require('express')
const app=express()
const session=require('express-session')
const flash=require('connect-flash')
const passport =require('passport')
const { create } = require("express-handlebars");
const {usuarios}=require('./src/db/schema')
require('dotenv').config();
const { eq } = require("drizzle-orm")
const db = require('./src/db/db')
require('./src/db/schema')
const csrf=require('csurf')
const pgSession = require('connect-pg-simple')(session);
const pool = require("./src/db/pool");
const cors=require('cors')


// const { crearTabla } = require('./modelos/pescados')


const puerto=5000

const corsOptions = {
    credentials: true,
    origin: process.env.PATH_DE_RENDER,  //cambiar esto en la variable de entorno de render cuando se despliegue y revisar lo del correo
    methods:['GET','POST'],
};
app.use(cors())

app.set("trust proxy", 1);
app.use(
    session({
        secret: process.env.SECRETSESSION,
        resave: false,
        saveUninitialized: false,
        name:"secret-name",
        store: new pgSession({
        pool: pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 24 horas
            httpOnly: true,
            secure: process.env.MODO==='production', 
            sameSite: "lax",
        },
    }),
    })
)

app.use(
    flash()
)

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
    done(null, user.id);
});



// preguntar en DB por el usuario???
passport.deserializeUser(async (id, done) => {

    try {

        const userDB = await db
            .select()
            .from(usuarios)
            .where(eq(usuarios.id, id))

        if (userDB.length === 0) {
            return done(null, false)
        }

        done(null, {
            id: userDB[0].id,
            userName: userDB[0].nombre,
            rol: userDB[0].rol
        })

    } catch (error) {
        done(error)
    }

})  


const hbs = create({
    extname: ".hbs",
    partialsDir: ["vistas/componentes"],

    helpers: {
        eq: function(a, b) {
            return a === b;
        },

        formatoCOP: (valor) => {
        return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
      }).format(valor);

    },

    formatoNumero: (valor) => {
        if (valor === null || valor === undefined || isNaN(valor)) return "0";

        return new Intl.NumberFormat("es-CO", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
        },

    parseInt:(valor)=>{
        return parseInt(valor);
    }

    }
});




app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./vistas");




app.use(express.urlencoded({extended:true}))

app.use(csrf())

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.mensajes=req.flash("mensajes")
    next();
});


app.use("/",require("./rutas/home"))
app.use("/sesion",require("./rutas/sesion"))
app.use("/gestion_usuarios",require("./rutas/users"))
app.use("/gestion_proveedores",require("./rutas/proveedores"))
app.use("/gestion_productos",require("./rutas/productos"))
app.use("/gestion_compras",require("./rutas/compras"))
app.use("/gestion_ventas",require("./rutas/ventas"))
app.use("/gestion_inventario",require("./rutas/inventario"))
app.use("/gestion_lotes",require("./rutas/lotes"))
app.use(express.static(__dirname+"/public"))



const PORT=process.env.PORT || 5000

app.listen(PORT,()=>console.log("servidor andando " + PORT))

//3:11 para ver la config de flash como csrf de forma global
//3:20 explica la relacion del id con mongoose

//video4 min 38 subir proyecto
