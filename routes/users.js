const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

router.get('/register', (req, res)=>{
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res)=>{
    try{
        const { email, username, password } = req.body;
        const user = new User({ email: email, username: username });
        const registeredUser = await User.register( user, password );
        console.log('registeredUser', registeredUser);
        req.flash('success','welcome to yelpcamp...');
        res.redirect('/campgrounds')
    }
    catch(e){
        req.flash('error', e.message);
        console.log(e.message)
        res.redirect('/register');
    }
    
}));

router.get('/login', (req, res)=>{
    res.render('users/login');
});

router.post('/login',passport.authenticate('local', { successRedirect: '/campgrounds', failureFlash: true,  failureRedirect: '/login'}), 
(req, res)=>{
    req.flash('success', 'login successful, welcome back..');
    res.redirect('/campgrounds');
});

module.exports = router;