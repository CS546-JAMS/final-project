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
            .limit(100)
            .populate('album', 'title')
            .then((songs) => {
                res.render('layouts/songs', { songs })
            })
            .catch((err) => handleErr(err, res));
    });

    app.get('/makeband', (req, res) => {
        res.render('layouts/makeband');
           
    });
//------------------------------

      app.post("/artist-new", async (req, res) => {
          const artistInfo = req.body;

          if(!artistInfo){
            res.status(400);
            return;
          }
          newArtist = {
              name: req.body['artist-name'],
              birth: req.body['bday'], 
              death: req.body['dday']
          }
          ops.insert('artist', newArtist)
          .then((newArtist) => {
            res.status(200).send(newArtist);
            })
      });
      
      app.post("/song-new", async (req, res) => {
          const songInfo = req.body;

          if(!songInfo){
            res.status(400);
            return;
          }

          newSong = {
              title: req.body['song-title'],
              lengthInSeconds: req.body['song-len']
          }
          ops.insert('song', newSong)
          .then((newSong) => {
            res.status(200).send(newSong);
            })
      });

      app.post("/album-new", async (req, res) => {
        const albumInfo = req.body;

        if(!albumInfo){
          res.status(400);
          return;
        }

        newAlbum = {
            title: req.body['album-title']
        }
        ops.insert('album', newAlbum)
        .then((newAlbum) => {
            res.status(200).send(newAlbum);
            })
    });

    app.post("/band-new", async (req, res) => {
        const bandInfo = req.body;

        if(!bandInfo){
          res.status(400);
          return;
        }

        newBand = {
            name: req.body['band-name'],
            description: req.body['band-desc'],
            genre: req.body['genre-title']
        }
        ops.insert('band', newBand)
        .then((newBand) => {
          res.status(200).send(newBand);
          })
    });


//----------------------------------------

    //songs/:id only available via search, must implement

    app.get('/search', (req, res) => {
        //validate in case they tried to run around the form, return a list page that is returned from the db.  If it's empty
        //return a generic error page
        res.send(req.query);
    });

}