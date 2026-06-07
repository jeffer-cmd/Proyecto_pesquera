module.exports= (req, res, next)=> { 
    if (req.user.rol !== "admin") { 
        res.redirect('/formulario_operario')
        // return res.status(403).json({ msg: "No autorizado", }); 
    } 
    next(); 
}