const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const genreSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true
    },
    bands: [{
        type: ObjectId,
        ref: 'Band'
    }]
});

module.exports = mongoose.model('Genre', genreSchema);