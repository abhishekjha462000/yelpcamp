const express = require('express');
const app = express();
const PORT = require('./config/port.js');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground.js');
const methodOverride = require('method-override');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log('database connected successfully');
    })
    .catch(() => {
        console.log('Oh no error!!! could not connect to the database');
    });

// Set 'views' directory
app.set('views', path.join(__dirname, 'views'));

// Set the view engine
app.set('view engine', 'ejs');

// make express use the static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.send('/');
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

app.post('/campgrounds', async (req, res) => {
    const { campground } = req.body;
    console.log(campground);

    const c = new Campground(campground);
    await c.save();
    console.log(c);

    res.redirect(`/campgrounds/${c._id}`);
});

app.get('/campgrounds/new', (req, res) => {
    // render the form for the new campground
    res.render('campgrounds/new');
});

app.get('/campgrounds/:id', async (req, res) => {
    // extract id from the request params
    const { id } = req.params;

    // find the campground with this id
    const campground = await Campground.findById(id);

    res.render('campgrounds/show', { campground });

});

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const { campground } = req.body;

    const c = await Campground.findByIdAndUpdate(id, campground);
    res.redirect(`/campgrounds/${id}`);
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    res.render('campgrounds/edit', { campground });
});

app.listen(PORT, () => {
    console.log(`app started on ${PORT} port`);
});