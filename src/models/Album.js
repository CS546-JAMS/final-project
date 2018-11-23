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

//check if it is new or an update, act accordingly
//NOTE: CANNOT USE ARROW FUNCTIONS DUE TO 'THIS'
albumSchema.pre('save', async function() {
    if(this.isNew) {
        //it's new, add to band list
        await mongoose.model('Band').updateOne({_id: this.band }, { $addToSet: { albums: this._id }});
    }
    else {
        //update, check what is modified using isModified and go update the references
    }
});

//this references the object called on
albumSchema.pre('remove', async function() {
    //remove all songs
    await mongoose.model('Song').deleteMany({ _id: { $in: this.songs }});
    //remove from band album list
    await mongoose.model('Band').updateOne({ _id: this.band }, { $pull: { albums: this._id }});
});

module.exports = mongoose.model('Album', albumSchema)