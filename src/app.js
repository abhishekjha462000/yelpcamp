const express = require('express');
const app = express();
const PORT = require('./config/port.js');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground.js');

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

app.get('/', (req, res) => {
    res.send('/');
});

app.get('/makecampground', async (req, res) => {
    const c = new Campground({ title: 'First Campground', description: 'This is the first campground of the world' });
    await c.save();
    res.send(await Campground.find({}));
});

app.listen(PORT, () => {
    console.log(`app started on ${PORT} port`);
});