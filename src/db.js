const mongoose = require('mongoose');

const server = '127.0.0.1:27017';
const db = 'final-project';

class Database {
    constructor() {
        this._connect();
    }

    _connect() {
        mongoose.connect(`mongodb://${server}/${db}`)
            .then(() => {
                console.log('Db connection successful');
            })
            .catch((err) => {
                console.log('Db connection failed');
            })
    }

    dropDatabase() {
        mongoose.connection.dropDatabase();
    }
};

module.exports = new Database();