const Song = require('../src/models/Song');
const Album = require('../src/models/Album');
const Band = require('../src/models/Band');
const seedData = require('../utils/seed_data.json');
const ops = require('../src/ops');
const runTest = require('./runTest');

test('Delete a band, resolve dependencies', async () => {
    runTest(async () => {
        let params;
        params = seedData.Bands[0];
        const bandEntry = await ops.insert(Band, params);

        params = seedData.Albums[0];
        params.band = bandEntry._id;
        const albumEntry = await ops.insert(Album, params);

        params = seedData.Songs[0];
        params.album = albumEntry._id;
        const songEntry = await ops.insert(Song, params);

        const bandAfterAdditions = await Band.findById(bandEntry._id);
        await bandAfterAdditions.remove();

        //assure that the references to the album and the song were deleted by the band hooks
        expect(await Album.findById(albumEntry._id)).toBe(null);
        expect(await Song.findById(songEntry._id)).toBe(null);
    });
});