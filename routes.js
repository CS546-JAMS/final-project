const ops = require('./src/ops');
const conn = require('./src/db');
const mongoose = require('mongoose');
const generate = require('./generator');

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
        
        //we also want to render a form here to enter in new information.  This should have some fairly dynamic stuff, just store the different
        //form documents in memory, and according to a selector, render the form inside of a div.  Each form will have a different action.

        //in the case that a name has been taken -- check serverside.  If it is taken, perform a redirect with a queryparam setting query.taken = true.
        //check for this when the route gets hit for a GET, if it is there, render some extra stuff on the bottom of the page.
        const out = {}
        const bands = mongoose.model('Band').find({})
            .sort({'likes': -1}) //descending order
            .limit(3)
            .then((bands) => { out.bands = bands })

        const albums = mongoose.model('Album').find({})
            .sort({'totalStreams': -1})
            .limit(3)
            .populate('band', 'name')
            .then((albums) => { out.albums = albums })

        const songs = mongoose.model('Song').find({})
            .sort({'streams': -1})
            .limit(3)
            .populate('album', 'title')
            .then((songs) => { out.songs = songs })

        Promise.all([bands, albums, songs])
            .then(() => {
                res.render('layouts/dashboard', out)
            })
    });

    app.get('/artists/:id', (req, res) => {
        //return an artist's individual page
        //find a way to sort the bands by the start
        //and end dates
        mongoose.model('Artist').findById(req.params.id)
            .populate('bands.band', 'name')
            .then((artist) => {
                res.render('layouts/artistDetails', artist);
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
            .populate('band', 'name')
            .then((album) => {
                res.status(200).render('layouts/albumDetails', album); //we don't have a list, so we can pass in direct
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
            .populate('members', 'name bands.band bands.yearStart bands.yearEnd')
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
        mongoose.model('Genre').findOne({ title: req.params.name })
            .populate('bands', 'name albums likes') //retrieve only the band's name and likes
            .sort({'bands.likes': -1})
            .limit(10)
            .then((genres) => {
                res.render('layouts/genreDetails', genres);
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
  
    app.get('/songs/:id', (req, res) => {
          mongoose.model('Song').findById(req.params.id)
              .then((song) => {
                  return mongoose.model('Album').findById(song.album)
                      .populate('songs')
              })
              .then((album) => {
                  res.render('layouts/albumDetails', { album })
              })
              .catch((err) => handleErr(err, res));
    });

    app.post('/artists', (req, res) => {
        ops.insert('artist', req.body)
            .then((artist) => {
                res.status(200).send(artist);
            })
            .catch((err) => {
                if(err.name === "MongoError") {
                    const message = "That artist name is already taken.  Please try a different one."
                    res.status(400).send({ message })
                }
                else res.status(400).send(messages(400));
            })
      });
      
    app.post('/songs', (req, res) => {
        ops.insert('song', req.body)
            .then((song) => {
                res.status(200).send(song);
            })
            .catch((err) => {
                res.status(400).send(messages(400));
            })
      });

    app.post('/albums', (req, res) => {
        ops.insert('album', req.body)
            .then((album) => {
                res.status(200).send(album);
            })
            .catch((err) => {
                res.status(400).send(messages(400));
            })
    });

    app.post('/bands', (req, res) => {
        ops.insert('band', req.body)
            .then((band) => {
                res.status(200).send(band);
            })
            .catch((err) => {
                if(err.name === "MongoError") { //mongoose can't intercept this it seems, comes right from the driver
                    const message = {
                        message: "That band name is already taken.  Maybe try one of these?",
                        names: [ generate(), generate(), generate() ] //sue me
                    }
                    res.status(400).send(message);
                }
                else res.status(400).send(messages(400));
            })
    });

    app.patch('/bands/:id', (req, res) => {
        ops.updateById('band', req.params.id, req.body)
            .then((band) => {
                res.status(200).send(band);
            })
            .catch((err) => {
                res.status(400).send(messages(400));
            })
    });

    app.patch('/albums/:id', (req, res) => {
        ops.updateById('album', req.params.id, req.body)
            .then((album) => {
                res.status(200).send(album);
            })
            .catch((err) => {
                res.status(400).send(messages(400));
            })
    });

    app.patch('/songs/:id', (req, res) => {
        ops.updateById('song', req.params.id, req.body)
            .then((song) => {
                res.status(200).send(song);
            })
            .catch((err) => {
                res.status(400).send(messages(400));
            })
    });

    app.patch('/artists/:id', (req, res) => {
        ops.updateById('artist', req.params.id, req.body)
            .then((artist) => {
                res.status(200).send(artist);
            })
            .catch((err) => {
                res.status(400).send(messages(400));
            })
    });

    //TODO: Perhaps figure out a way to do this with re-routing.  This is very tightly coupled, and in fact involves duplicates
    //of other code.
    app.get('/search', async (req, res) => {
        //validate in case they tried to run around the form, return a list page that is returned from the db.  If it's empty
        //return a generic error page
        const type = req.query.t
        const query = req.query.q

        const types = {
            Bands: {
                single: {
                    layout: 'bandDetails',
                    search: (name) => { 
                        return mongoose.model('Band').findOne({ name }) 
                            .populate('albums', 'title genre')
                            .populate('members', 'name bands.band bands.yearStart bands.yearEnd') 
                    }
                },
                count: (name) => { return mongoose.model('Band').countDocuments({ name })}
            },
            Albums: {
                multi: {
                    layout: 'albums',
                    search: (title) => { 
                        return mongoose.model('Album').find({ title })
                            .sort({'totalStreams': -1})
                            .limit(10)
                            .populate('band', 'name')
                            .populate('songs', 'title -_id')
                    }
                },
                single: {
                    layout: 'albumDetails',
                    search: (title) => { 
                        return mongoose.model('Album').findOne({ title })
                            .populate('songs')
                            .populate('band', 'name')
                    }
                },
                count: (title) => { return mongoose.model('Album').countDocuments({ title })}
            },
            Songs: {
                multi: {
                    layout: 'songs',
                    search: (title) => { 
                        return mongoose.model('Song').find({ title })
                            .sort({'streams': -1})
                            .limit(10)
                            .populate('album', 'title')
                    }
                },  
                single: {
                    layout: 'albumDetails', //we don't use a song details page
                    search: (title) => { 
                        return mongoose.model('Song').findOne({ title })
                            .then((song) => {
                                return mongoose.model('Album').findById(song.album)
                                .populate('songs')
                                .populate('band', 'name')
                            })
                    }
                },
                count: (title) => { return mongoose.model('Song').countDocuments({ title })}
            },
            Genres: {
                multi: {
                    layout: 'genres',
                    search: (title) => { 
                        return mongoose.model('Genre').find({ title })
                            .limit(10)
                            .populate('bands', 'name')
                    }
                },
                single: {
                    layout: 'genreDetails',
                    search: (title) => { 
                        return mongoose.model('Genre').findOne({ title })
                            .populate('bands', 'name albums likes') //retrieve only the band's name and likes
                            .sort('bands.likes')
                            .limit(10)
                    }
                },
                count: (title) => { return mongoose.model('Genre').countDocuments({ title })}
            },
            Artists: {
                single: {
                    layout: 'artistDetails',
                    search: (name) => { 
                        return mongoose.model('Artist').findOne({ name })
                            .populate('bands.band', 'name')
                    }
                },
                count: (name) => { return mongoose.model('Artist').countDocuments({ name })}
            }
        }
        
        if(type in types) {
            const numberMatched = await types[type].count(query);
            if(numberMatched === 1) {
                const dbResponse = await types[type].single.search(query);
                res.render(`layouts/${types[type].single.layout}`, dbResponse)            
            }
            else {
                const dbResponse = await types[type].multi.search(query);
                res.render(`layouts/${types[type].multi.layout}`, dbResponse)
            } 
        }
        else {
            //TODO: render error page
            res.status(400).send(messages(400))
        }
    });

    app.delete('/bands/:id', (req,res) => {
        mongoose.model("Band").findOneAndDelete({_id: req.params.id})
        .then(() => {
            res.status(200).redirect('/bands');
        })
        .catch(() => {
            res.status(404).send(messages(404));
        })
    });

    app.delete('/albums/:id', (req,res) => {
        mongoose.model("Album").findOneAndDelete({_id: req.params.id})
        .then(() => {
            res.status(200).redirect('/albums');
        })
        .catch(() => {
            res.status(404).send(messages(404));
        })
    });

    app.delete('/songs/:id', (req,res) => {
        mongoose.model("Song").findOneAndDelete({_id: req.params.id})
        .then(() => {
            res.status(200).redirect('/songs');
        })
        .catch(() => {
            res.status(404).send(messages(404));
        })
    });

    app.delete('/artists/:id', (req,res) => {
        mongoose.model("Artist").findOneAndDelete({_id: req.params.id})
            .then(() => {
                res.status(200).redirect('/artists');
            })
            .catch(() => {
                res.status(404).send(messages(404));
            })
    });
}    