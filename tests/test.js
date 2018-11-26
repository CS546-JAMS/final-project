const Song = require('../src/models/Song');
const Album = require('../src/models/Album');
const Band = require('../src/models/Band');
const seedData = require('../utils/seed_data.json');
const ops = require('../src/ops');
const conn = require('../src/db');

const dumpDb = async () => {
    const fs = require('fs');
    let out = {};
    out.Songs = await ops.retrieveAll(Song);
    out.Albums = await ops.retrieveAll(Album);
    out.Bands = await ops.retrieveAll(Band);
    fs.writeFile('out.json', JSON.stringify(out, null, 4)); //pretty print out file
}

beforeEach(() => {
    conn.dropDatabase();
});

afterAll(async () => {
    await dumpDb();
    conn.disconnect();
});

test('Simple insert 1 band', async () => {
    const entry = await ops.insert(Band, seedData.Bands[0]);
    const res = await Band.findById(entry._id);
    expect(res.name).toBe(entry.name);
});

test('Delete a band, resolve dependencies', async () => {
    let params;
    params = seedData.Bands[0];
    let bandEntry = await ops.insert(Band, params);

    params = seedData.Albums[0];
    params.band = bandEntry._id;
    const albumEntry = await ops.insert(Album, params);

    params = seedData.Songs[0];
    params.album = albumEntry._id;
    const songEntry = await ops.insert(Song, params);

    bandEntry = await Band.findById(bandEntry._id);
    await bandEntry.remove();

    //assure that the references to the album and the song were deleted by the band hooks
    expect(await Album.findById(albumEntry._id)).toBe(null);
    expect(await Song.findById(songEntry._id)).toBe(null);
});

test('Make sure an album deletion only affects its songs', async () => {
    let params;
    params = seedData.Bands[0];
    const bandEntry = await ops.insert(Band, params);

    params = seedData.Albums[0];
    params.band = bandEntry._id;
    let firstAlbum = await ops.insert(Album, params);

    params = seedData.Albums[1];
    params.band = bandEntry._id;
    let secondAlbum = await ops.insert(Album, params);

    params = [seedData.Songs[0], seedData.Songs[1], seedData.Songs[2]]
    params.forEach((s) => { s.album = firstAlbum._id });
    await ops.insertMany(Song, params);

    params = [seedData.Songs[3], seedData.Songs[4], seedData.Songs[5], seedData.Songs[6]];
    params.forEach((s) => { s.album = secondAlbum._id });
    await ops.insertMany(Song, params);

    await ops.removeById(Album, firstAlbum._id);
    const res = await Song.find({ album: secondAlbum._id });
    expect(res.length).toBe(4);
    expect(await Song.find({ album: firstAlbum._id })).toEqual([]); //object equality because find() must return array
});

test('Drop a genre with 1 supporting album, make sure band reflects genre drop', async () => {
    let params;
    params = seedData.Bands[0];
    const bandEntry = await ops.insert(Band, params);

    params = seedData.Albums[0];
    params.band = bandEntry._id;
    let firstAlbum = await ops.insert(Album, params);

    params = seedData.Albums[1];
    params.band = bandEntry._id;
    let secondAlbum = await ops.insert(Album, params);

    await ops.removeById(Album, firstAlbum._id);
    const res = await Band.findById(bandEntry._id);
    expect(res.genres.length).toBe(1);
    expect(res.genres[0]).toBe(secondAlbum.genre); //comparing arrays in Jest is strange
});

test('Add two albums of the same genre, assure band genres only has 1 entry', async () => {
    let params;
    params = seedData.Bands[0];
    const bandEntry = await ops.insert(Band, params);

    params = seedData.Albums[0];
    params.band = bandEntry._id;
    let firstAlbum = await ops.insert(Album, params);

    params = seedData.Albums[1];
    params.genre = firstAlbum.genre; //match the two genres
    params.band = bandEntry._id;
    let secondAlbum = await ops.insert(Album, params);

    const res = await Band.findById(bandEntry._id);
    expect(res.genres.length).toBe(1);
    expect(res.genres[0]).toBe(firstAlbum.genre);
});

test('Insert two albums with the same genre, delete one, assure genre stays on band', async () => {
    let params;
    params = seedData.Bands[0];
    const bandEntry = await ops.insert(Band, params);

    params = seedData.Albums[0];
    params.band = bandEntry._id;
    let firstAlbum = await ops.insert(Album, params);

    params = seedData.Albums[1];
    params.genre = firstAlbum.genre; //match the two genres
    params.band = bandEntry._id;
    let secondAlbum = await ops.insert(Album, params);

    await ops.removeById(Album, firstAlbum._id);
    const res = await Band.findById(bandEntry._id);
    expect(res.genres.length).toBe(1);
    expect(res.genres[0]).toBe(firstAlbum.genre);
})