const ops = require('../src/ops/band');
const bands = require('../src/models/Band');
const seedData = require('../utils/seed_data.json');
const conn = require('../src/db');

test('Simple insert 1 band',  async () => {
    const firstBand = seedData.Bands[0];
    const entry = await ops.insertBand(firstBand);
    const res = await bands.findById(entry._id)
    expect(res.name).toBe(firstBand.name);
    conn.disconnect();
});