const ops = require('../src/ops');
const conn = require('../src/db');
const seedData = require('./seed_data');

const main = async () => {
    await conn.dropDatabase();

    let params;
    params = seedData.Bands[0];
    const gunsNRoses = await ops.insert('band', params);

    params = seedData.Albums[0];
    params.band = gunsNRoses._id;
    const appetiteForDestruction = await ops.insert('album', params);

    params = seedData.Albums[1];
    params.band = gunsNRoses._id;
    const useYourIllusion = await ops.insert('album', params);

    let promises = []
    params = seedData.Artists;
    params.forEach((a) => { a.bands[0].band = gunsNRoses._id });
    promises.push(ops.insertMany('artist', params));

    params = seedData.Songs.slice(0, 3);
    params.forEach((s) => { s.album = appetiteForDestruction._id });
    promises.push(ops.insertMany('song', params));

    params = seedData.Songs.slice(3);
    params.forEach((s) => { s.album = useYourIllusion._id });
    promises.push(ops.insertMany('song', params));

    return Promise.all(promises);
};

main()
    .then(() => { 
        return conn.dumpDb()
    })
    .then(() => { 
        return conn.disconnect() 
    }); 
    