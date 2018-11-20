const seedData = require('./seed_data');
const conn = require('../src/db');
const Song = require('../src/models/Song');
const Album = require('../src/models/Album');
const Band = require('../src/models/Band');
const song = require('../src/ops/song');
const album = require('../src/ops/album');
const band = require('../src/ops/band');

const main = async () => {
    //drop everything
    conn.dropDatabase();
    console.log('Database dropped');

    //repopulate everything
    const gunsNRoses = await band.insertBand(seedData.Bands[0]);
    const appetiteForDestruction = await album.insertAlbum(gunsNRoses, seedData.Albums[0]);
    const paradiseCity = await song.insertSong(appetiteForDestruction._id, seedData.Songs[0]);
    const welcomeToTheJungle = await song.insertSong(appetiteForDestruction._id, seedData.Songs[1]);

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