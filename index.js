const express=require('express')
const app=express()
const { create } = require("express-handlebars");
require('dotenv').config();
require('./src/db/db')

// const { crearTabla } = require('./modelos/pescados')



const puerto=5000

const hbs = create({
    extname: ".hbs",
    partialsDir: ["vistas/componentes"],
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./vistas");




app.use(express.urlencoded({extended:true}))
app.use("/",require("./rutas/home"))
app.use("/sesion",require("./rutas/sesion"))
app.use(express.static(__dirname+"/public"))



const PORT=process.env.PORT || 5000

app.listen(PORT,()=>console.log("servidor andando " + PORT))

