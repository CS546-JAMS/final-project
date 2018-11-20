const Band = require('../models/Band');

const insertBand = async (params) => {
    const band = new Band(params);
    await band.save();
    return band;
}

const deleteBand = async () => {

}

module.exports = {
    insertBand: insertBand,
    deleteBand: deleteBand
}