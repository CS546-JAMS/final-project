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
        required: true
    },
    bands: [{ 
        type: history,
        set: async function(newBands) {
            console.log('Set bands are: ' + newBands)
            // if(this.isNew) //keep track of the last genre and the one before that
            //     this._memory = newBands;
            // else {
            //     this._previousBands = this._memory;
            //     this._memory = newBands;
            // }
            return newHistories;
        }
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
        //handle updating using memory, use same set difference method
        // const previousBands = new Set(this._previousBands);
        // const newBands = new Set(this.bands);
    }
});

artistSchema.pre('remove', async function() {
    const bands = this.toObject().bands.map((h) => { return h.band }); //same as above, consider making a function
    await mongoose.model('Band').updateMany({ _id: { $in: bands }}, { $pull: { members: this._id }});
});

module.exports = mongoose.model('Artist', artistSchema);