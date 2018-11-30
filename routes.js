const ops = require('./src/ops');
const conn = require('./src/db');
const mongoose = require('mongoose');
//we can pass in more options to populate to tune
//exactly what we want to return

const messages = (number) => {
    const codes = {
        200: 'OK',
        400: 'Bad request',
        404: 'Not found',
        500: 'Internal server error'
    }
    return { message: codes[number] };
}

const pretty = (s) => {
    return JSON.stringify(s, null, 4);
}

//TODO: Handle updating, posting, deleting
module.exports = app => {
    app.get('/', (req, res) => {
        //return a dashboard, lists most popular bands of the month and,
        //big songs of the month, and big albums of the month
        res.status(200).send('Under construction');
    });

    app.get('/artists/:id', (req, res) => {
        //return an artist's individual page
        //find a way to sort the bands by the start
        //and end dates
        mongoose.model('Artist').findById(req.params.id)
            .populate('bands.band')
            .then((artist) => {
                res.status(200).send(artist);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send(messages(500));
            })
    });

    app.get('/albums/:id', (req, res) => {
        //return an album page
        mongoose.model('Album').findById(req.params.id)
            .populate('songs')
            .then((album) => {
                res.status(200).send(album);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send(messages(500));
            })
    });

    app.get('/bands', (req, res) => {
        //start by just returning all of the bands
        //list most popular bands for this month
        mongoose.model('Band').find({})
            .sort({'likes': -1}) //descending order
            .limit(10)
            .then((bands) => {
                res.status(200).send(bands);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send(messages(500));
            })
    });

    app.get('/bands/:id', (req, res) => {
        //return a band's individual page
        mongoose.model('Band').findById(req.params.id)
            .populate('albums', 'title genre')
            .populate('members', 'name bands.yearStart bands.yearEnd')
            .then((band) => {
                res.status(200).send(band);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send(messages(500));
            })
    });

    app.get('/genres/:name', (req, res) => {
        //return a list of the most popular bands in that genre
        mongoose.model('Genre').find({ title: req.params.name })
            .populate('bands', 'name likes') //retrieve only the band's name and likes
            .sort('bands.likes')
            .limit(10)
            .then((bands) => {
                res.status(200).send(bands);
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send(messages(500));
            })
    });

}