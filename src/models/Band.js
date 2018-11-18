const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

//don't need to define _id, mongodb handles thats
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
    }
});

module.exports = mongoose.model('Band', bandSchema);