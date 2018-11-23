const conn = require('../src/db');

const executeTest = async (test) => {
    await conn.dropDatabase();
    await test();
    await conn.disconnect();
}

module.exports = executeTest;