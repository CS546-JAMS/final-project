const insert = async (schema, params) => {
    const doc = new schema(params);
    await doc.save();
    return doc;
}

//we expect changes to be a json object
const update = async (doc, changes) => {
    doc.set(changes); //need to inform mongoose of changes using this or manually using markModified()
    await doc.save();
}

const insertMany = async (schema, arr) => {
    //if we want the hooks, we can't use Model.collection.insert,
    //we must iterate and generate models as we go

    //iterating over a series of async calls can be tricky, as it will want to
    //return when not all are done.  Can use a closure with a simple counter to keep track
    let promises = [];
    arr.forEach(async (params) => {
        const doc = new schema(params);
        promises.push(doc.save());
    });
    return Promise.all(promises);
}

const removeById = async (schema, id) => {
    const doc = await schema.findById(id)
    await doc.remove();
}

const retrieveAll = async (schema) => {
    return await schema.find({});
}

module.exports = {
    insert: insert,
    insertMany: insertMany,
    removeById: removeById,
    retrieveAll: retrieveAll,
    update: update
}