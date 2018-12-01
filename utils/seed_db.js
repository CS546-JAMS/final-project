const ops = require('../src/ops');
const conn = require('../src/db');
const seedData = require('./seed_data');

const main = async () => {
    await conn.dropDatabase();

    let params;
    params = seedData.Bands[0];
    const gunsNRoses = await ops.insert('band', params);

    params = seedData.Bands[1];
    const vulfpeck = await ops.insert('band', params);

    params = seedData.Bands[2];
    const badBadNotGood = await ops.insert('band', params);

    params = seedData.Bands[3];
    const daftPunk = await ops.insert('band', params);

    params = seedData.Bands[4];
    const brockhampton = await ops.insert('band', params);

    params = seedData.Albums[0];
    params.band = gunsNRoses._id;
    const appetiteForDestruction = await ops.insert('album', params);

    params = seedData.Albums[1];
    params.band = gunsNRoses._id;
    const useYourIllusion = await ops.insert('album', params);

    params = seedData.Albums[2];
    params.band = daftPunk._id;
    const randomAccessMemories = await ops.insert('album', params);

    params = seedData.Albums[3];
    params.band = daftPunk._id;
    const homework = await ops.insert('album', params);

    params = seedData.Albums[4];
    params.band = vulfpeck._id;
    const mrFinishLine = await ops.insert('album', params);

    params = seedData.Albums[5];
    params.band = badBadNotGood._id;
    const iV = await ops.insert('album', params);

    params = seedData.Albums[6];
    params.band = brockhampton._id;
    const iridescence = await ops.insert('album', params);

    let promises = []
    params = seedData.Artists.slice(0, 2);
    params.forEach((a) => { a.bands[0].band = gunsNRoses._id });
    promises.push(ops.insertMany('artist', params));

    params = seedData.Artists[2];
    params.bands[0].band = badBadNotGood._id;
    promises.push(ops.insert('artist', params));

    params = seedData.Artists[3];
    params.bands[0].band = daftPunk._id;
    promises.push(ops.insert('artist', params));

    params = seedData.Artists[4];
    params.bands[0].band = brockhampton._id;
    promises.push(ops.insert('artist', params));

    params = seedData.Artists[5];
    params.bands[0].band = vulfpeck._id;
    params.bands[1].band = badBadNotGood._id;
    promises.push(ops.insert('artist', params));

    params = seedData.Songs.slice(0, 3);
    params.forEach((s) => { s.album = appetiteForDestruction._id });
    promises.push(ops.insertMany('song', params));

    params = seedData.Songs.slice(3, 7);
    params.forEach((s) => { s.album = useYourIllusion._id });
    promises.push(ops.insertMany('song', params));

    params = seedData.Songs.slice(7, 10);
    params.forEach((s) => { s.album = mrFinishLine._id });
    promises.push(ops.insertMany('song', params));

    params = seedData.Songs.slice(10, 12);
    params.forEach((s) => { s.album = randomAccessMemories._id });
    promises.push(ops.insertMany('song', params));

    params = seedData.Songs[12];
    params.album = homework._id;
    promises.push(ops.insert('song', params))

    params = seedData.Songs.slice(13, 15);
    params.forEach((s) => { s.album = iridescence._id });
    promises.push(ops.insertMany('song', params));

    params = seedData.Songs[15];
    params.album = iV._id;
    promises.push(ops.insert('song', params));

    return Promise.all(promises)
};

main()
    .then(() => { 
        return conn.dumpDb()
    })
    .then(() => { 
        return conn.disconnect() 
    }); 
    