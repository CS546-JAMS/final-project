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
        default: 0,
        validate: {
            validator: (v) => { return v >= 0 }
        }
    }
});

//If the song is new, append to the album song set
songSchema.pre('save', async function() {
    if(this.isNew) await mongoose.model('Album').updateOne({ _id: this.album }, { $addToSet: { songs: this._id }, $inc: { totalStreams: this.streams }});
    else if(this.modifiedPaths().includes('streams')) {
        const old = await mongoose.model('Song').findById(this._id); //still working on a better way to do this
        const diff = this.streams - old.streams; //this way we only update it once
        await mongoose.model('Album').updateOne({ _id: this.album }, { $inc: { totalStreams: diff }});
    }
});

songSchema.pre('remove', async function() {
    //remove from album
    await mongoose.model('Album').updateOne({ _id: this.album }, { $pull: { songs: this._id }, $inc: { totalStreams: this.streams * -1 }});
});

module.exports = mongoose.model('Song', songSchema)