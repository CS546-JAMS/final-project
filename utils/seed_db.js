const seedData = require('./seed_data');
const conn = require('../src/db');
const Song = require('../src/models/Song');
const Album = require('../src/models/Album');
const Band = require('../src/models/Band');
const ops = require('../src/ops');

const main = async () => {
    //drop everything
    conn.dropDatabase();
    console.log('Database dropped');

    //repopulate everything
    let params;
    params = seedData.Bands[0];
    const gunsNRoses = await ops.insert(Band, params);

    params = seedData.Albums[0];
    params.band = gunsNRoses._id;
    const appetiteForDestruction = await album.insertAlbum(Album, params);

    params = seedData.Songs[0];
    params.album = appetiteForDestruction._id;
    const paradiseCity = await song.insertSong(Song, params);

    params = seedData.Songs[1];
    params.album = appetiteForDestruction._id;
    const welcomeToTheJungle = await song.insertSong(Song, params);

    console.log('Seed db generated');
    console.log('Band======')
    console.log(await Band.findOne({ name: "Guns N' Roses" }));
    console.log('Album======')
    console.log(await Album.findOne({ title: "Appetite for Destruction" }));

    await song.deleteSong(paradiseCity);
    console.log(await Album.findOne({ title: "Appetite for Destruction" }));
    await song.deleteSong(welcomeToTheJungle);
    console.log(await Album.findOne({ title: "Appetite for Destruction" }));
};

main();