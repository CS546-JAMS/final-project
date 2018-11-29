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
    out.Songs = await ops.getAll('song');
    out.Albums = await ops.getAll('album');
    out.Bands = await ops.getAll('band');
    out.Artists = await ops.getAll('artist');
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

test('Insert a band', async () => {
    const bandEntry = await ops.insert('band', data.Bands[0]);
    const res = await ops.getById('band', bandEntry._id);
    expect(res.name).toBe(bandEntry.name);
});

test('Delete a band, resolve dependencies', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert('band', params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const albumEntry = await ops.insert('album', params);

    params = data.Songs[0];
    params.album = albumEntry._id;
    const songEntry = await ops.insert('song', params);

    const res = await ops.getById('band', bandEntry._id);
    await ops.removeById('band', res._id);

    //assure that the references to the album and the song were deleted by the band hooks
    expect(await ops.getById('album', albumEntry._id)).toBeNull();
    expect(await ops.getById('song', songEntry._id)).toBeNull();
});

test('Delete an album, assure it only affects its songs', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert('band', params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert('album', params);

    params = data.Albums[1];
    params.band = bandEntry._id;
    const secondAlbum = await ops.insert('album', params);

    params = [data.Songs[0], data.Songs[1], data.Songs[2]]
    params.forEach((s) => { s.album = firstAlbum._id });
    await ops.insertMany('song', params);

    params = [data.Songs[3], data.Songs[4], data.Songs[5], data.Songs[6]];
    params.forEach((s) => { s.album = secondAlbum._id });
    await ops.insertMany('song', params);

    await ops.removeById('album', firstAlbum._id);
    const res = await ops.getByParams('song', { album: secondAlbum._id });
    expect(res.length).toBe(4);
    expect(await ops.getByParams('song', { album: firstAlbum._id })).toEqual([]); //object equality because find() must return array
});

test('Delete a genre with 1 supporting album, make sure band reflects genre drop', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert('band', params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert('album', params);

    params = data.Albums[1];
    params.band = bandEntry._id;
    const secondAlbum = await ops.insert('album', params);

    await ops.removeById('album', firstAlbum._id);
    const res = await ops.getById('band', bandEntry._id);
    expect(res.genres.length).toBe(1);
    expect(res.genres[0]).toBe(secondAlbum.genre); //comparing arrays in Jest is strange
});

test('Delete a genre with 2 supporting albums, make sure band does not reflect genre drop', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert('band', params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert('album', params);

    params = shallowCopy(data.Albums[1]);
    params.band = bandEntry._id;
    params.genre = firstAlbum.genre;
    const secondAlbum = await ops.insert('album', params);

    const res = await ops.getById('band', bandEntry._id);
    expect(res.genres.length).toBe(1);
});

test('Insert two albums with the same genre, assure they do not double up', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert('band', params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert('album', params);

    params = shallowCopy(data.Albums[1]);
    params.band = bandEntry._id;
    params.genre = firstAlbum.genre; //match the two genres, overwrites the object because of alias
    const secondAlbum = await ops.insert('album', params);

    const res = await ops.getById('band', bandEntry._id);
    expect(res.genres.length).toBe(1);
    expect(res.genres[0]).toBe(firstAlbum.genre);
});

test('Insert two albums with the same genre, delete one, assure genre stays on band', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert('band', params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert('album', params);

    params = shallowCopy(data.Albums[1]);
    params.genre = firstAlbum.genre; //match the two genres
    params.band = bandEntry._id;
    const secondAlbum = await ops.insert('album', params);

    await ops.removeById('album', firstAlbum._id);
    const res = await ops.getById('band', bandEntry._id);
    expect(res.genres.length).toBe(1);
    expect(res.genres[0]).toBe(firstAlbum.genre);
});

test('Update an album, ensure it does not double up the genres', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert('band', params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert('album', params);

    params = data.Albums[1];
    params.band = bandEntry._id;
    const secondAlbum = await ops.insert('album', params);
    await ops.updateById('album', secondAlbum._id, { genre: firstAlbum.genre });

    const res = await ops.getById('band', bandEntry._id);
    expect(res.genres.length).toBe(1);
    expect(res.genres[0]).toEqual(firstAlbum.genre);
});

test('Update an album, ensure it creates a new genre', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert('band', params);

    params = data.Albums[0];
    params.band = bandEntry._id;
    const firstAlbum = await ops.insert('album', params);

    params = shallowCopy(data.Albums[1]);
    params.band = bandEntry._id;
    params.genre = firstAlbum.genre; //match the two genres, overwrites the object because of alias
    const secondAlbum = await ops.insert('album', params);
    await ops.updateById('album', secondAlbum._id, { genre: data.Albums[1].genre }); //set back to original

    const res = await ops.getById('band', bandEntry._id);
    expect(res.genres.length).toBe(2); //don't really care about the order, just need 2
});

test('Insert an artist', async () => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert('band', params);

    params = deepCopy(data.Artists[0]);
    params.bands[0].band = bandEntry._id;
    const artistEntry = await ops.insert('artist', params);

    const res = await ops.getById('band', bandEntry._id);
    expect(res.members.length).toBe(1);
    expect(res.members[0]).toEqual(artistEntry._id);
});

test('Delete an artist, assure that the band gets updated', async() => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert('band', params);
    
    params = deepCopy(data.Artists[0]);
    params.bands[0].band = bandEntry._id;
    const artistEntry = await ops.insert('artist', params);

    //these can be set in motion and awaited later on:
    //const artistEntry = ops.insert('artist', params);
    //...
    //await artistEntry

    await ops.removeById('artist', artistEntry._id);
    const res = await ops.getById('band', bandEntry._id);
    expect(res.members.length).toBe(0);
});

test('Delete a band, assure that the artist gets updated', async() => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert('band', params);

    params = deepCopy(data.Artists[0]);
    params.bands[0].band = bandEntry._id;
    const artistEntry = await ops.insert('artist', params);

    await ops.removeById('band', bandEntry._id);
    const res = await ops.getById('artist', artistEntry._id);
    expect(res.bands.length).toBe(0);
});

test('Update the members of a band, assure that the histories get updated', async() => {
    let params;
    params = data.Bands[0];
    const bandEntry = await ops.insert('band', params);

    params = deepCopy(data.Artists[0]);
    params.bands[0].band = bandEntry._id;
    const artistEntry = await ops.insert('artist', params);

    params = deepCopy(data.Artists[1]);
    params.bands[0].band = bandEntry._id;
    const otherArtistEntry = await ops.insert('artist', params);

    await ops.updateById('band', bandEntry._id, { members: [ artistEntry._id ]});
    let res = await ops.getById('artist', artistEntry._id);
    expect(res.bands.length).toBe(1);
    res = await ops.getById('artist', otherArtistEntry._id);
    expect(res.bands.length).toBe(0);
});