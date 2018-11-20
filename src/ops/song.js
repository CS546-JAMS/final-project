const Song = require('../models/Song');

const insertSong = async (album, params) => {
    params.album = album;
    const song = new Song(params);
    await song.save();
    return song;
}

const deleteSong = async (id) => {
    await id.remove()
}

module.exports = {
    insertSong: insertSong,
    deleteSong: deleteSong
}