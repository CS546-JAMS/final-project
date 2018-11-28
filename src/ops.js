const models = {
    'song': require('./models/Song'),
    'album': require('./models/Album'),
    'band': require('./models/Band'),
    'artist': require('./models/Artist')
}

const insert = async (schema, params) => {
    const doc = new models[schema](params);
    await doc.save();
    return doc;
}

const insertMany = async (schema, arr) => {
    //if we want the hooks, we can't use Model.collection.insert,
    //we must iterate and generate models as we go

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
    const doc = await models[schema].findById(id)
    await doc.remove();
}

const getAll = async (schema) => {
    return await models[schema].find({});
}

const getById = async (schema, id) => {
    return await models[schema].findById(id);
}

const getByParams = async (schema, params) => {
    return await models[schema].find(params);
}

const update = async (doc, params) => {
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
    update: update
}