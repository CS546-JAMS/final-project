const MongoClient = require('mongodb').MongoClient;
const settings = require('./settings').mongoConfig;

let _connection = undefined;
let _db = undefined;

//Keep a single connection to db
module.exports = async () => {
    if (!_connection) {
        _connection = await MongoClient.connect(settings.url);
        _db = await _connection.db(settings.dbName);
    }

    return _db;
};I