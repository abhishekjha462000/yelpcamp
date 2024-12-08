const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync.js');
const ExpressError = require('./ExpressError.js');
const campgroundSchema = require('./schemas.js');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log("Connected to db");
    })
    .catch(() => {
        console.log('Oh No could not connect to the db')
    });


const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(', ');
        throw new ExpressError(message, 404);
    }
    next(); // Call next() if validation is successful
};


app.get('/', (req, res) => {
    res.render('home')
});
app.get('/campgrounds', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) throw new ExpressError('Could not find the product', 500);
    res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    // console.log('I was called');
    const campground = await Campground.findById(req.params.id)
    if (!campground) throw new ExpressError('Could not find the product', 500);
    res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.get('/error', catchAsync(async (req, res, next) => {
    throw new ExpressError('This is an error route', 404);
}));


app.use((err, req, res, next) => {
    const { message = 'Something Went Wrong...', statusCode = 500 } = err;
    return res.status(statusCode).render('error', { message, statusCode })
});

app.listen(3000, () => {
    console.log('Serving on port 3000')
})