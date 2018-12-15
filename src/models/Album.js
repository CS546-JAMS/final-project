const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const albumSchema = new mongoose.Schema({
    band: {
        type: ObjectId,
        ref: 'Band',
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
        type: String,
        required: true
    },
    description: {
        type: String
    },
    totalStreams: {
        type: Number,
        default: 0,
        validate: {
            validator: (v) => { return v >= 0 }
        }
    }
});

//check if it is new or an update, act accordingly
//NOTE: CANNOT USE ARROW FUNCTIONS DUE TO 'THIS'
albumSchema.pre('save', async function() {
    //regardless of if it's new or not, push the new record, there is likely a more elegant way to keep track of this,
    //but this is simple enough for now
    await mongoose.model('Genre').updateOne({ title: this.genre }, { $addToSet: { bands: this.band }}, { upsert: true });
    if(this.isNew) {
        await mongoose.model('Band').updateOne({ _id: this.band }, { $addToSet: { albums: this._id, genres: this.genre }});
    }
    else if(this.modifiedPaths().includes('genre')) {
        //consider replacing with { 'Classic Rock': 2, 'Metal': 1 } on band and decrementing / incrementing 
        //to avoid having to query the whole set
        //we don't need to do this synchronously, consider making a promise list and using Promise.all()
        const old = await mongoose.model('Album').findById(this._id); //again, not the best way to do it
        const sameGenre = await mongoose.model('Album').find({ band: this.band, genre: old.genre });
        await mongoose.model('Band').updateOne({ _id: this.band }, { $addToSet: { genres: this.genre }});
        if (sameGenre.length < 2) { //we don't have another of the same, pull it from the genre list
            await mongoose.model('Band').updateOne({ _id: this.band }, { $pull: { genres: old.genre }});
            await mongoose.model('Genre').updateOne({ title: this.genre}, { $pull: { bands: this.band }});
        }
    }
});

//this references the object called on
albumSchema.pre('remove', async function() {
    //remove all songs
    await mongoose.model('Song').deleteMany({ _id: { $in: this.songs }});
    //remove from band album list
    await mongoose.model('Band').updateOne({ _id: this.band }, { $pull: { albums: this._id }});

    //pull album genre from band on remove -- again, consider decrement method to avoid large query
    const sameGenre = await mongoose.model('Album').find({ genre: this.genre , band: this.band });
    if(sameGenre.length < 2) { //we don't have another of the same genre, pull genre from band, also pull band from genre list
        await mongoose.model('Band').updateOne({ _id: this.band }, { $pull: { genres: this.genre }});

        const genre = await mongoose.model('Genre').findOne({ title: this.genre }); //drop the genre if it ends up empty
        if(genre.bands.length < 2)
            await mongoose.model('Genre').findOneAndDelete({ title: this.genre });
        else
            await mongoose.model('Genre').updateOne({ title: this.genre}, { $pull: { bands: this.band }});
    }
});

module.exports = mongoose.model('Album', albumSchema)