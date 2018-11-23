const mongoose = require('mongoose');

const server = '127.0.0.1:27017';
const db = 'final-project';

class Database {
    constructor() {
        this._connect();
    }

    _connect() {
        mongoose.connect(`mongodb://${server}/${db}`, { useCreateIndex: true, useNewUrlParser: true })
            .then(() => {
                console.log('Db connection successful');
            })
            .catch((err) => {
                console.log('Db connection failed');
            });
    }

    dropDatabase() {
        return mongoose.connection.dropDatabase()
            .then(() => { 
                console.log('Db dropped');
            })
            .catch((err) => {
                console.log('Db failed to drop');
            });
    }

    disconnect() {
        return mongoose.disconnect()
            .then(() => { 
                console.log('Bye!'); 
            });
    }
};

module.exports = new Database();