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

const campgrounds = require('./routes/campgrounds'); 
const reviews = require('./routes/reviews');


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


app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews)


app.get('/', (req, res)=>{
    res.render('home');
});

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
