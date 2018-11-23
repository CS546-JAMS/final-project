const insert = async (schema, params) => {
    const doc = new schema(params);
    await doc.save();
    return doc;
}

const remove = async (schema, id) => {
    schema.findById(id).then((doc) => { doc.remove(); });
}

module.exports = {
    insert: insert,
    remove: remove
}