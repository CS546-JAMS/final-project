const mongoose = require('mongoose');
const validator = require('validator');
const ObjectId = mongoose.Schema.Types.ObjectId;

const history = new mongoose.Schema({
    bandId: {
        type: ObjectId,
        ref: 'Band'
    },
    yearStart: {
        type: Number
    },
    yearEnd: {
        type: Number
    },
    roles: [{ type: String }]
});

//includes a sub doc, validators might need messages
const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    bands: [{ history }],
    birth: {
        type: String,
        validate: (v) => { return validator.isBefore(v, Date.now())}
    },
    death: {
        type: String,
        validate: (v) => { return validator.isBefore(v, Date.now())}
    }
});

module.exports = mongoose.model('Artist', artistSchema);