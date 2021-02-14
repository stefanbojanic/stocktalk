const { allowList } = require('./constants')

const getTickers = (text) => {
    const filtered = text.replace(/[^a-zA-Z ]/g, '')
    const words = filtered.split(' ')
    return words.filter(word => word.length <= 5 && verifyTicker(word))
}

// TODO: Check yahoo finance api
const verifyTicker = (word) => {
    return allowList[word]
}

module.exports = {
    getTickers
}
