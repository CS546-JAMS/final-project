const data = require('./utils/generator_data');
const adjectives = data.adjectives;
const nouns = data.nouns;

const _getRandomIndex = (lst) => {
    return Math.floor(Math.random() * lst.length)
}

module.exports = () => {
    return `${adjectives[_getRandomIndex(adjectives)]} ${nouns[_getRandomIndex(nouns)]}` 
}