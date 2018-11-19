const seedData = require('./seed_data');
const conn = require('../src/db');
const Song = require('../src/models/Song');
const Album = require('../src/models/Album');
const Band = require('../src/models/Band');

const main = async () => {
    //drop everything
    conn.dropDatabase();
    console.log('Database dropped');

    //repopulate everything
    let params;
    const gunsNRoses = new Band(seedData.Bands[0]);
    await gunsNRoses.save();

    params = seedData.Albums[0];
    params.band = gunsNRoses._id; //append the id from the band
    const appetiteForDestruction = new Album(seedData.Albums[0]);
    await appetiteForDestruction.save();

    //gunsNRoses.albums.push(appetiteForDestruction);
    //await gunsNRoses.save();

    params = seedData.Songs[0];
    params.album = appetiteForDestruction._id; //same as above for O/M relationship
    const paradiseCity = new Song(params);
    await paradiseCity.save();

    //appetiteForDestruction.songs.push(paradiseCity._id);
    //await appetiteForDestruction.save();

    params = seedData.Songs[1];
    params.album = appetiteForDestruction._id;
    const welcomeToTheJungle = new Song(params);
    await welcomeToTheJungle.save();

    //appetiteForDestruction.songs.push(welcomeToTheJungle._id);
    //await appetiteForDestruction.save();

    console.log('Seed db generated');
    console.log('Band======')
    console.log(await Band.findOne({ name: "Guns N' Roses" }));
    console.log('Album======')
    console.log(await Album.findOne({ title: "Appetite for Destruction" }));
};

main();