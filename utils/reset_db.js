const conn = require('../src/db');

const main = async () => {
    //drop everything, remember async functions must return promises
    await conn.dropDatabase();
    await conn.disconnect();
};

main();

module.exports = main;