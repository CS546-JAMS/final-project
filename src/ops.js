//TODO: eliminate this file, move functions into test.js

const models = {
    'song': require('./models/Song'),
    'album': require('./models/Album'),
    'band': require('./models/Band'),
    'artist': require('./models/Artist'),
    'genre': require('./models/Genre')
}

const _assureSchema = (schema) => {
    if(!schema) throw 'Schema undefined or null';
    if(!models[schema]) throw `No schema found for: ${schema}`;
}

const insert = async (schema, params) => {
    _assureSchema(schema);
    const doc = new models[schema](params);
    await doc.save();
    return doc;
}

const insertMany = async (schema, arr) => {
    _assureSchema(schema);
    //iterating over a series of async calls can be tricky, as it will want to
    //return when not all are done.  We'll use Promise.all() for this
    let promises = [];
    arr.forEach(async (params) => {
        const doc = new models[schema](params);
        promises.push(doc.save());
    });
    return Promise.all(promises);
}

const removeById = async (schema, id) => {
    _assureSchema(schema);
    const doc = await models[schema].findById(id);
    await doc.remove();
}

const getAll = async (schema) => {
    _assureSchema(schema);
    return models[schema].find({});
}

const getById = async (schema, id) => {
    _assureSchema(schema);
    return await models[schema].findById(id);
}

const getByParams = async (schema, params) => {
    _assureSchema(schema);
    return await models[schema].find(params);
}

const updateById = async (schema, id, params) => {
    _assureSchema(schema);
    const doc = await models[schema].findById(id);
    doc.set(params); //need to inform mongoose of changes using this or manually using markModified()
    await doc.save();
}

module.exports = {
    insert: insert,
    insertMany: insertMany,
    removeById: removeById,
    getAll: getAll,
    getById: getById,
    getByParams: getByParams,
    updateById: updateById
}