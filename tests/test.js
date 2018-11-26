const Song = require('../src/models/Song');
const Album = require('../src/models/Album');
const Band = require('../src/models/Band');
const ops = require('../src/ops');
const conn = require('../src/db');
const seedData = require('../utils/seed_data.json');
let data; //copy of seedData to be reset on each run

const deepCopy = (obj) => {
    return JSON.parse(JSON.stringify(obj)); //make a new deep copy for each run to avoid aliasing
}

const shallowCopy = (obj) => {
    return Object.assign({}, obj);
}

const dumpDb = async () => {
    const fs = require('fs');
    let out = {};
    out.Songs = await ops.retrieveAll(Song);
    out.Albums = await ops.retrieveAll(Album);
    out.Bands = await ops.retrieveAll(Band);
    fs.writeFile('out.json', JSON.stringify(out, null, 4)); //pretty print out file
}

beforeEach(() => {
    data = deepCopy(seedData);
    conn.dropDatabase();
});

afterAll(async () => {
    await dumpDb();
    conn.disconnect();
});

test('Simple insert 1 band', async () => {
    const bandEntry = await ops.insert(Band, data.Bands[0]);
    const res = await Band.findById(bandEntry._id);
    expect(res.name).toBe(bandEntry.name);
});

test('Delete a band, resolve dependencies', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert(Band, params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const albumEntry = await ops.insert(Album, params);

    params = data.Songs[0];
    params.album = albumEntry._id;
    const songEntry = await ops.insert(Song, params);

    const res = await Band.findById(bandEntry._id);
    await res.remove();

    //assure that the references to the album and the song were deleted by the band hooks
    expect(await Album.findById(albumEntry._id)).toBe(null);
    expect(await Song.findById(songEntry._id)).toBe(null);
});

test('Make sure an album deletion only affects its songs', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert(Band, params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert(Album, params);

    params = data.Albums[1];
    params.band = bandEntry._id;
    const secondAlbum = await ops.insert(Album, params);

    params = [data.Songs[0], data.Songs[1], data.Songs[2]]
    params.forEach((s) => { s.album = firstAlbum._id });
    await ops.insertMany(Song, params);

    params = [data.Songs[3], data.Songs[4], data.Songs[5], data.Songs[6]];
    params.forEach((s) => { s.album = secondAlbum._id });
    await ops.insertMany(Song, params);

    await ops.removeById(Album, firstAlbum._id);
    const res = await Song.find({ album: secondAlbum._id });
    expect(res.length).toBe(4);
    expect(await Song.find({ album: firstAlbum._id })).toEqual([]); //object equality because find() must return array
});

test('Drop a genre with 1 supporting album, make sure band reflects genre drop', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert(Band, params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert(Album, params);

    params = data.Albums[1];
    params.band = bandEntry._id;
    const secondAlbum = await ops.insert(Album, params);

    await ops.removeById(Album, firstAlbum._id);
    const res = await Band.findById(bandEntry._id);
    expect(res.genres.length).toBe(1);
    expect(res.genres[0]).toBe(secondAlbum.genre); //comparing arrays in Jest is strange
});

test('Drop a genre with 2 supporting albums, make sure band does not reflect genre drop', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert(Band, params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert(Album, params);

    params = shallowCopy(data.Albums[1]);
    params.band = bandEntry._id;
    params.genre = firstAlbum.genre;
    const secondAlbum = await ops.insert(Album, params);

    const res = await Band.findById(bandEntry._id);
    expect(res.genres.length).toBe(1);
});

test('Insert two albums with the same genre, assure they do not double up', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert(Band, params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert(Album, params);

    params = shallowCopy(data.Albums[1]);
    params.band = bandEntry._id;
    params.genre = firstAlbum.genre; //match the two genres, overwrites the object because of alias
    const secondAlbum = await ops.insert(Album, params);

    const res = await Band.findById(bandEntry._id);
    expect(res.genres.length).toBe(1);
    expect(res.genres[0]).toBe(firstAlbum.genre);
});

test('Insert two albums with the same genre, delete one, assure genre stays on band', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert(Band, params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert(Album, params);

    params = shallowCopy(data.Albums[1]);
    params.genre = firstAlbum.genre; //match the two genres
    params.band = bandEntry._id;
    const secondAlbum = await ops.insert(Album, params);

    await ops.removeById(Album, firstAlbum._id);
    const res = await Band.findById(bandEntry._id);
    expect(res.genres.length).toBe(1);
    expect(res.genres[0]).toBe(firstAlbum.genre);
});

test('Update an album, ensure it does not double up the genres', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert(Band, params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert(Album, params);

    params = data.Albums[1];
    params.band = bandEntry._id;
    const secondAlbum = await ops.insert(Album, params);
    await ops.update(secondAlbum, { genre: firstAlbum.genre });

    const res = await Band.findById(bandEntry._id);
    expect(res.genres.length).toBe(1);
    expect(res.genres[0]).toEqual(firstAlbum.genre);
});

test('Update an album, ensure it creates a new genre', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert(Band, params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert(Album, params);

    params = shallowCopy(data.Albums[1]);
    params.band = bandEntry._id;
    params.genre = firstAlbum.genre; //match the two genres, overwrites the object because of alias
    const secondAlbum = await ops.insert(Album, params);
    await ops.update(secondAlbum, { genre: data.Albums[1].genre }); //set back to original

    const res = await Band.findById(bandEntry._id);
    expect(res.genres.length).toBe(2); //don't really care about the order, just need 2
});