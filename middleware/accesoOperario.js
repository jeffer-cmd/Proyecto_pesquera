module.exports = (req, res, next) => {
    if (req.user.rol === "empleado") {
        return next();
    }
    

    return res.redirect('/');
};