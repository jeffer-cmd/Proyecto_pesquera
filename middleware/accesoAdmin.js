// module.exports = (req, res, next) => {
//     if (req.user.rol === "admin") {
//         return next();
//     }

//     return res.redirect('/sesion/login');
// };

module.exports = (req, res, next) => { 
    if (req.user.rol === "admin") {
        return next();
    }

    return res.redirect('/formulario_operario');
};
