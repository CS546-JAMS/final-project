const mongoose = require('mongoose');
const validator = require('validator');
const ObjectId = mongoose.Schema.Types.ObjectId;

const history = new mongoose.Schema({
    band: {
        type: ObjectId,
        ref: 'Band'
    },
    yearStart: {
        type: Number
    },
    yearEnd: {
        type: Number
    },
    roles: [{ type: String }]
});

//includes a sub doc, validators might need messages
const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    bands: [{ 
        type: history
    }],
    birth: {
        type: String,
        validate: (v) => { return validator.isBefore(v)}
    },
    death: {
        type: String,
        validate: (v) => { return validator.isBefore(v)}
    }
});

artistSchema.pre('save', async function() {
    if(this.isNew) {
        const bands = this.toObject().bands.map((h) => { return h.band }); //need to dig down into the mongoose array
        await mongoose.model('Band').updateMany({ _id: { $in: bands }},  { $addToSet: { members: this._id }});
    }
    else if(this.modifiedPaths().includes('bands')) {
        const old = mongoose.model('Artist').findById(this._id);

        const previousBands = new Set(old.toObject().bands.map((h) => { return h.band }));
        const newBands = new Set(this.toObject().bands.map((h) => { return h.band })); //deposit on document to avoid 2 calls

        const removals = [...previousBands].filter(m => !newBands.has(m));
        const additions = [...newBands].filter(m => !previousBands.has(m));

        await mongoose.model('Band').updateMany({ _id: { $in: removals }}, { $pull: { members: this._id }});
        await mongoose.model('Band').updateMany({ _id: { $in: additions }}, { $addToSet: { members: this._id }});
    }
});

artistSchema.pre('remove', async function() {
    const bands = this.toObject().bands.map((h) => { return h.band }); //same as above, consider making a function
    await mongoose.model('Band').updateMany({ _id: { $in: bands }}, { $pull: { members: this._id }});
});

module.exports = mongoose.model('Artist', artistSchema);