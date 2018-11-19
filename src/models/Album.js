const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Song = require('./Song');
const Band = require('./Band');

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

//check if it is new or an update, act accordingly
//NOTE: CANNOT USE ARROW FUNCTIONS DUE TO 'THIS'
albumSchema.pre('save', async function() {
    if(this.isNew) {
        //it's new, add to band list
        await Band.updateOne({_id: this.band }, { $addToSet: { albums: this._id }});
    }
    else {
        //update, check what is modified using isModified
    }
});

//this references the object called on
albumSchema.pre('remove', async function() {
    //remove all songs
    await Song.deleteMany({ _id: { $in: this.songs }});
    //remove from band album list
    await Band.updateOne({ _id: this.bandId }, { $pull: { albums: this._id }});
});

module.exports = mongoose.model('Album', albumSchema)