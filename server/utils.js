const {
    allowList
} = require('./constants')

const getTickers = (text) => {
    const filtered = text.replace(/[^a-zA-Z ]/g, '')
    const words = filtered.split(' ')
    const tickers = {}
    words.forEach(word => {
        if (word.length <= 5 && verifyTicker(word)) {
            tickers[word] = true
        }
    })
    return tickers
}

const updateTickers = (tickers, counts, post) => {
    Object.keys(tickers).forEach(ticker => {
        if (counts[ticker]) {
            counts[ticker].count += 1
            counts[ticker].upvotes += post.ups
        } else {
            counts[ticker] = {
                count: 1,
                upvotes: post.ups
            }
        }
    });
    return counts;
}

// TODO: Check yahoo finance api
const verifyTicker = (word) => {
    return allowList[word]
}

module.exports = {
    getTickers,
    updateTickers
}