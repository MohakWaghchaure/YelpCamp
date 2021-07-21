const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Review = require('../models/review');
const methodOverride = require('method-override');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('../schemas.js');


const validateReview = (req, res, next)=>{
    const result = reviewSchema.validate(req.body);
    console.log('validation result', result);
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

router.post('/', validateReview, catchAsync(async (req, res, next)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();  
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', catchAsync(async (req, res, next)=>{
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;