const Album = require('../models/Album');

const insertAlbum = async (band, params) => {
    params.band = band;
    const album = new Album(params);
    await album.save();
    return album;
}

const deleteAlbum = async () => {

}

module.exports = {
    insertAlbum: insertAlbum,
    deleteAlbum: deleteAlbum
}