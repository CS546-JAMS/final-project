const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const albumSchema = new mongoose.Schema({
    band: {
        type: ObjectId,
        ref: 'Album',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    songs: [{
        type: ObjectId,
        ref: 'Song'
    }],
    genre: {
        type: String
    }
});

module.exports = mongoose.model('Album', albumSchema)