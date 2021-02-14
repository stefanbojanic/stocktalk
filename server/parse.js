const { allowList } = require('./constants')

const getTickers = (text) => {
    const filtered = text.replace(/[^a-zA-Z ]/g, '')
    const words = filtered.split(' ')
    const tickers = {}
    words.forEach(word => {
        if(word.length <= 5 && verifyTicker(word)){
            tickers[word] = true
        }
    })
    return tickers
}

// TODO: Check yahoo finance api
const verifyTicker = (word) => {
    return allowList[word]
}

module.exports = {
    getTickers
}
