const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Album = require('./Album');

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

//If the song is new, append to the album song set
songSchema.pre('save', async function() {
    if(this.isNew) await Album.updateOne({ _id: this.album }, { $addToSet: { songs: this._id }});
});

songSchema.pre('remove', async function() {
    //remove from album
    await Album.updateOne({ _id: this.album }, { $pull: { songs: this._id }});
});

module.exports = mongoose.model('Song', songSchema)