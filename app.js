const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');

const Campground = require('./models/campground');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review = require('./models/review.js');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,
})
const app = express();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database connected!!!')
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));



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

const validateReview = (req, res, next)=>{
    const result = reviewSchema.validate(req.body);
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

app.get('/', (req, res)=>{
    res.render('home');
});

app.get('/campgrounds', async (req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds', { campgrounds });
});

app.get('/campgrounds/new', catchAsync(async (req, res)=>{
    res.render('campgrounds/new');
}));

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next)=>{
    // if(!req.body.campground) throw new ExpressError('invalid campground data...', 404)
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/:id', catchAsync(async (req, res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    // console.log("campground...", campground);
    res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res)=>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate( id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res)=>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
}));

app.post('/campgrounds/:id/reviews', catchAsync(async (req, res, next)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();  
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res, next)=>{
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));    

app.all('*', (req, res, next)=>{
    // res.send('error 404 !!!');
    next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next)=>{
    const {statusCode = 500, } = err; 
    // res.status();
    if(!err.message){ err.message = 'something went wrong'}
    res.status(statusCode).render('error', { err } );
});

app.listen(3000, ()=>{
    console.log('serving on port 3000...');
});
