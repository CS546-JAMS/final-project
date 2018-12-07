const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const ObjectId = mongoose.Schema.Types.ObjectId;

const bandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    genres: [{
        type: String
    }],
    members: [{
        type: ObjectId,
        ref: 'Artist'
    }],
    albums: [{
        type: ObjectId,
        ref: 'Album'
    }],
    likes: {
        type: Number,
        validate: {
            validator: (v) => { return v >= 0 }
        }
    },
    description: {
        type: String
    }
});

bandSchema.pre('save', async function() {
    if(this.isNew) { //just cram them all in, update the supplied artists
        await mongoose.model('Artist').updateMany({ _id: { $in: this.members }}, { $addToSet: { history: { band: this._id }}});
    }
    else { //it's an update, need to see the modified paths
        if(this.modifiedPaths().includes('members')) {
            const old = await mongoose.model('Band').findById(this._id); //this is a horrid way to do this

            const previousMembers = new Set(old.members);
            const newMembers = new Set(this.members);
            
            //compute who has been removed and added using set subtraction
            const removals = [...previousMembers].filter(m => !newMembers.has(m));
            const additions = [...newMembers].filter(m => !previousMembers.has(m));
        
            //now iterate over these two and remove/add them
            await mongoose.model('Artist').updateMany({ _id: { $in: removals }}, { $pull: { bands: { band: this._id }}});
            await mongoose.model('Artist').updateMany({ _id: { $in: additions }}, { $addToSet: { bands: { band: this._id }}});
        }
    }
});

//Upon removal, we need to reach into the albums, songs, artists, and genres and delete any reference to the band
bandSchema.pre('remove', async function() {
    await mongoose.model('Song').deleteMany({ album: { $in: this.albums }});
    await mongoose.model('Album').deleteMany({ _id: { $in: this.albums }});

    //go get every member who was a part of this band and delete their history with the band
    await mongoose.model('Artist').updateMany({ _id: { $in: this.members }}, { $pull: { bands: { band: this._id }}});
});

bandSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Band', bandSchema);