//import all mongoose models and drop them
const mongoose = require('mongoose');
const seedData = require('./seed_data');
const conn = require('../src/db');
const Album = require('../src/models/Album');
const Artist = require('../src/models/Artist');
const Band = require('../src/models/Band');
const Genre = require('../src/models/Genre');
const Song = require('../src/models/Song');

const main = async () => {
    //drop everything
    conn.dropDatabase();
    console.log('Database dropped');

    //repopulate everything
    const gunsNRoses = new Band(seedData.Bands[0]);
    gunsNRoses.save((err) => {
        if(err) throw err;

        let params = seedData.Albums[0];
        params.band = gunsNRoses._id; //append the id from the band

        const appetiteForDestruction = new Album(params);
        appetiteForDestruction.save((err) => {
            if(err) throw err;
            //now update the band from earlier to reflect the new album
            gunsNRoses.albums.push(appetiteForDestruction);
            gunsNRoses.save();

            params = seedData.Songs[0];
            params.album = appetiteForDestruction._id; //same as above for O/M relationship

            const paradiseCity = new Song(params);
            paradiseCity.save((err) => {
                if(err) throw err;
                //and update the album to include the new song
                appetiteForDestruction.songs.push(paradiseCity);
                appetiteForDestruction.save();
                console.log('Seed db generated');
                Band.findOne({ name: "Guns N' Roses" }, (err, band) => {
                    if(err) throw err;
                    console.log(band);
                });
            });
        });
    });
};

main();