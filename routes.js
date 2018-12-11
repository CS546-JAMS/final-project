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
        //return most popular songs
        mongoose.model('Song').find({_id: req.params.id})
        .populate('album', 'title',  'lengthInSeconds', 'streams')
        .then((song) => {
            res.render('layouts/songDetails', song);
        })
        .catch((err) => handleErr(err, res));
    });

    app.post('/search', (req, res) => {
        //validate in case they tried to run around the form, return a list page that is returned from the db.  If it's empty
        //return a generic error page
        let searchingObject = req.body;
        let query= searchingObject.q;
        let qType = searchingObject.t;
        console.log(searchingObject);
        console.log(query);
        console.log(qType);
        if (!query) {
            console.log("No query entered");
            return -1;
        }
        if (qType === "Bands"){
            console.log("Looking for Band");
            foundBand = mongoose.model('Band').find({name: query}, function(err,obj) { 
                if (Object.keys(obj).length<1){
                    console.log("There are no bands with that name!");
                }
                else{
                    console.log(obj[0]._id);
                    res.redirect("../bands/"+obj[0]._id);
                }
            });
            return 0;
        }
        else if (qType === "Albums") {
            console.log("Looking for Album");
            foundBand = mongoose.model('Album').find({title: query}, function(err,obj) { 
                if (Object.keys(obj).length<1){
                    console.log("There are no albums with that name!");
                }
                else{
                    console.log(obj[0]._id);
                    res.redirect("../albums/"+obj[0]._id);
                }
            });
            return 0;
        }
        else if (qType === "Songs"){
            console.log("Looking for Songs");
            foundBand = mongoose.model('Song').find({title: query}, function(err,obj) {
                if (Object.keys(obj).length<1){
                    console.log("There are no Songs with that name!");
                }
                else{ 
                    console.log(obj[0]._id);
                    res.redirect("../songs/"+obj[0]._id);
                }
            });
            return 0;
        }
        else if (qType === "Artists"){
            console.log("Looking for Artist");
            foundBand = mongoose.model('Artist').find({name: query}, function(err,obj) { 
                if (Object.keys(obj).length<1){
                    console.log("There are no Artists with that name!");
                }
                else{
                    console.log(obj[0]._id);
                    res.redirect("../artists/"+obj[0]._id);
                }
            });
            return 0;
        }
        else if(qType === "Genres"){
            console.log("Looking for Genre");
            foundBand = mongoose.model('Genre').find({title: query}, function(err,obj) { 
                if (Object.keys(obj).length<1){
                    console.log("There are no genres with that name!");
                }
                else{
                    console.log(obj[0]._id);
                    res.redirect("../genres/"+obj[0]._id);
                }
            });
            return 0;
        }
    });

    app.delete('/bands/:id', (req,res) => {
        try {
            mongoose.model("Band").findOneAndDelete({_id: req.params.id});
            return 0
          } catch (e) {
            res.status(404).json({ error: "Band not found" });
            return;
          }
    });
    app.delete('/albums/:id', (req,res) => {
        try {
            mongoose.model("Album").findOneAndDelete({_id: req.params.id});
            return 0
          } catch (e) {
            res.status(404).json({ error: "Album not found" });
            return;
          }
    });
    app.delete('/songs/:id', (req,res) => {
        try {
            mongoose.model("Song").findOneAndDelete({_id: req.params.id});
            return 0
          } catch (e) {
            res.status(404).json({ error: "Song not found" });
            return;
          }
    });
    app.delete('/genres/:id', (req,res) => {
        try {
            mongoose.model("Genre").findOneAndDelete({_id: req.params.id});
            return 0
          } catch (e) {
            res.status(404).json({ error: "Genre not found" });
            return;
          }
    });
    app.delete('/artists/:id', (req,res) => {
        try {
            mongoose.model("Artist").findOneAndDelete({_id: req.params.id});
            return 0
          } catch (e) {
            res.status(404).json({ error: "Artist not found" });
            return;
          }
    });
    

}