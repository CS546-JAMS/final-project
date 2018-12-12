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

const handleErr = (err, res) => {
    console.log(err);
    res.status(500).send(messages(500));
};

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
            .catch((err) => handleErr(err, res));
    });

    app.get('/albums', (req, res) => {
        //return most popular albums
        mongoose.model('Album').find({})
            .sort({'totalStreams': -1})
            .limit(10)
            .populate('band', 'name')
            .populate('songs', 'title -_id')
            .then(albums => {
                res.render('layouts/albums', { albums });
            })
            .catch((err) => handleErr(err, res));
    });

    app.get('/albums/:id', (req, res) => {
        //return an album page
        mongoose.model('Album').findById(req.params.id)
            .populate('songs')
            .then((album) => {
                res.status(200).send(album);
            })
            .catch((err) => handleErr(err, res));
    });

    app.get('/bands', (req, res) => {
        //start by just returning all of the bands
        //list most popular bands for this month
        mongoose.model('Band').find({})
            .sort({'likes': -1}) //descending order
            .limit(10)
            .then((bands) => {
                res.render('layouts/bands', { bands }); //sending in as-is results in undefined behavior, use implied object naming 
            })
            .catch((err) => handleErr(err, res));
    });

    app.get('/bands/:id', (req, res) => {
        //return a band's individual page
        mongoose.model('Band').findById(req.params.id)
            .populate('albums', 'title genre')
            .populate('members', 'name bands.yearStart bands.yearEnd')
            .then((band) => {
                res.render('layouts/bandDetails', band);
            })
            .catch((err) => handleErr(err, res));
    });

    app.get('/genres', (req, res) => {
        mongoose.model('Genre').find({}) //TODO: sort on size (popularity) of the array
            .limit(10)
            .populate('bands', 'name')
            .then((genres) => {
                res.render('layouts/genres', { genres }) //again assign to { genres: obj } to avoid mucking up 'this'
            })
            .catch((err) => handleErr(err, res));
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
            .catch((err) => handleErr(err, res));
    });

    app.get('/songs/', (req, res) => {
        //return most popular songs
        mongoose.model('Song').find({})
            .sort({'streams': -1})
            .limit(10)
            .populate('album', 'title')
            .then((songs) => {
                res.render('layouts/songs', { songs })
            })
            .catch((err) => handleErr(err, res));
    });

    //songs/:id only available via search, must implement
    app.get('/songs/:id', (req, res) => {
        mongoose.model('Song').find({_id: req.params.id}, function(err,obj) { 
            if (Object.keys(obj).length<1){
                console.log("There are no songs with that id!");
            }
            else{
                console.log(obj[0].album);
                res.redirect("../albums/"+obj[0].album);
            }
        });
    });

    app.get('/search', async (req, res) => {
        //validate in case they tried to run around the form, return a list page that is returned from the db.  If it's empty
        //return a generic error page
        const type = req.query.t
        const query = req.query.q

        const types = {
            Bands: {
                multi: 'bands',
                single: 'bandDetails',
                search: (name) => { return mongoose.model('Band').find({ name })}
            },
            Albums: {
                multi: 'albums',
                single: 'albumDetails',
                search: (title) => { return mongoose.model('Album').find({ title })}
            },
            Songs: {
                multi: 'songs',
                single: 'albumDetails', //we don't use a song details page
                search: (title) => { return mongoose.model('Song').find({ title })}
            },
            Genres: {
                multi: 'genres',
                single: 'genreDetails',
                search: (name) => { return mongoose.model('Genre').find({ name })}
            },
            Artists: {
                multi: 'artists',
                single: 'artistDetails',
                search: (name) => { return mongoose.model('Artist').find({ name })}
            }
        }
        
        if(type in types) {
            const dbResponse = await types[type].search(query)
            if(dbResponse.length == 1) res.render(`layouts/${types[type].single}`, dbResponse[0])
            else res.render(`layouts/${types[type].multi}`, dbResponse)
        }
        else {
            //TODO: render error page
            res.status(400).send(messages(200))
        }
    });

    app.delete('/bands/:id', (req,res) => {
        try {
            mongoose.model("Band").findOneAndDelete({_id: req.params.id});
            return 0
          } catch (e) {
            res.status(404).json({ error: "Band not found" });
            return -1;
          }
    });
    app.delete('/albums/:id', (req,res) => {
        try {
            mongoose.model("Album").findOneAndDelete({_id: req.params.id});
            return 0
          } catch (e) {
            res.status(404).json({ error: "Album not found" });
            return -1;
          }
    });
    app.delete('/songs/:id', (req,res) => {
        try {
            mongoose.model("Song").findOneAndDelete({_id: req.params.id});
            return 0
          } catch (e) {
            res.status(404).json({ error: "Song not found" });
            return -1;
          }
    });
    app.delete('/genres/:id', (req,res) => {
        try {
            mongoose.model("Genre").findOneAndDelete({_id: req.params.id});
            return 0
          } catch (e) {
            res.status(404).json({ error: "Genre not found" });
            return -1;
          }
    });
    app.delete('/artists/:id', (req,res) => {
        mongoose.model("Artist").findOneAndDelete({_id: req.params.id})
            .then(() => {
                res.status(200).send(messages(200));
            })
            .catch(() => {
                res.status(404).send(messages(404));
            })
    });    
}