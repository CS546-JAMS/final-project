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
        await mongoose.model('Band').updateOne({ _id: this.band }, { $addToSet: { albums: this._id, genres: this.genre }});
    }
    else if(this.modifiedPaths().includes('genre')) {
        const album = await mongoose.model('Album').findById(this._id); //old genre
        //consider replacing with { 'Classic Rock': 2, 'Metal': 1 } and decrementing / incrementing
        //to avoid having to query the whole set
        const sameGenre = await mongoose.model('Album').find({ genre: album.genre });
        if (!sameGenre || sameGenre.length < 2) //we don't have another of the same, pull it from the genres
            await mongoose.model('Band').updateOne({ _id: this.band }, { $addToSet: { genres: this.genre }, $pull: { genres: album.genre }});
        else //we have another, don't pull
            await mongoose.model('Band').updateOne({ _id: this.band }, { $addToSet: { genres: this.genre }});
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