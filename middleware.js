module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.flash('error', 'you must be sign in');
        res.redirect('/login');
    } 
    next();
}
