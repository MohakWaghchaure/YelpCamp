const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const methodOverride = require('method-override');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('../schemas.js');


const validateCampground = (req, res, next)=>{
    const result = campgroundSchema.validate(req.body);
    // console.log('validation result', result);
    const error = result.error;
    if(error) { 
        const errMsg = error.details.map(elem => elem.message).join(',');
        throw new ExpressError(errMsg , 404) 
    }
    else{
        next();
    }
}
// app.use(methodOverride('_method'));

router.get('/', async (req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds', { campgrounds });
});

router.get('/new', catchAsync(async (req, res)=>{
    res.render('campgrounds/new');
}));

router.post('/', validateCampground, catchAsync(async (req, res, next)=>{
    // if(!req.body.campground) throw new ExpressError('invalid campground data...', 404)
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'new campground added successfully...')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/:id', catchAsync(async (req, res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    // console.log("campground...", campground);
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', catchAsync(async (req, res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', validateCampground, catchAsync(async (req, res)=>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate( id, {...req.body.campground});
    req.flash('success', 'campground updated successfully...')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', catchAsync(async (req, res)=>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
}));

 

module.exports = router;