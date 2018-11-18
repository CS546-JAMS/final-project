const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const songSchema = new mongoose.Schema({
    album: {
        type: ObjectId,
        ref: 'Album'
    },
    title: {
        type: String,
        required: true
    },
    lengthInSeconds: {
        type: Number,
        validate: {
            validator: (v) => { return v > 0 }
        }
    },
    streams: {
        type: Number,
        validate: {
            validator: (v) => { return v >= 0 }
        }
    }
});

module.exports = mongoose.model('Song', songSchema)