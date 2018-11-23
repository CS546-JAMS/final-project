// const ops = require('../src/ops/band');
const Band = require('../src/models/Band');
const ops = require('../src/ops')
const seedData = require('../utils/seed_data.json');
const runTest = require('../tests/runTest');

test('Simple insert 1 band',  async () => {
    runTest(async () => {
        const entry = await ops.insert(Band, seedData.Bands[0]);
        const res = await Band.findById(entry._id);
        expect(res.name).toBe(entry.name);
    });
});