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

    app.post('/artists', (req, res) => {
        ops.insert('artist', newArtist)
            .then((newArtist) => {
                res.status(200).send(newArtist);
            })
            .catch((err) => {
                res.status(400).send(messages(400));
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
                res.status(400).send(messages(400));
            })
    });

    app.put('/bands/:id', (req, res) => {
        ops.updateById('band', req.params.id, req.body)
            .then((band) => {
                res.status(200).send(band);
            })
            .catch((err) => {
                res.status(400).send(messages(400));
            })
    });

    app.put('/albums/:id', (req, res) => {
        ops.updateById('album', req.params.id, req.body)
            .then((album) => {
                res.status(200).send(album);
            })
            .catch((err) => {
                res.status(400).send(messages(400));
            })
    });

    app.put('/songs/:id', (req, res) => {
        ops.updateById('song', req.params.id, req.body)
            .then((song) => {
                res.status(200).send(song);
            })
            .catch((err) => {
                res.status(400).send(messages(400));
            })
    });

    app.put('/artists/:id', (req, res) => {
        ops.updateById('artist', req.params.id, req.body)
            .then((artist) => {
                res.status(200).send(artist);
            })
            .catch((err) => {
                res.status(400).send(messages(400));
            })
    });

    app.get('/search', async (req, res) => {
        //validate in case they tried to run around the form, return a list page that is returned from the db.  If it's empty
        //return a generic error page
        const type = req.query.t
        const query = req.query.q

        const types = {
            Bands: {
                multi: {
                    layout: 'bands',
                    search: (name) => { 
                        return mongoose.model('Band').find({ name })
                            .sort({'likes': -1}) //descending order
                            .limit(10) 
                    }
                },
                single: {
                    layout: 'bandDetails',
                    search: (name) => { 
                        return mongoose.model('Band').findOne({ name }) 
                            .populate('albums', 'title genre')
                            .populate('members', 'name bands.yearStart bands.yearEnd') 
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
                            })
                    }
                },
                count: (title) => { return mongoose.model('Song').countDocuments({ title })}
            },
            Genres: {
                multi: {
                    layout: 'genres',
                    search: (name) => { 
                        return mongoose.model('Genre').find({ name })
                            .limit(10)
                            .populate('bands', 'name')
                    }
                },
                single: {
                    layout: 'genreDetails',
                    search: (name) => { 
                        return mongoose.model('Genre').findOne({ name })
                            .populate('bands', 'name likes') //retrieve only the band's name and likes
                            .sort('bands.likes')
                            .limit(10)
                    }
                },
                count: (title) => { return mongoose.model('Genre').countDocuments({ title })}
            },
            Artists: {
                multi: {
                    layout: 'artists',
                    search: (name) => { 
                        //TODO: need page
                        return mongoose.model('Artist').find({ name })
                    }
                },
                single: {
                    layout: 'artistDetails',
                    search: (name) => { 
                        return mongoose.model('Artist').findOne({ name })
                            .populate('bands.band')
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