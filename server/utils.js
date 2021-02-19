const {
    API_KEY,
    allowList,
    denyList,
} = require('./constants')

const httpRequest = require('./http');

const getTickers = async (text) => {
    const filtered = text.replace(/[^a-zA-Z ]/g, '')
    let words = filtered.split(" ")
    words = words.filter(word => word.length < 5)

    const tickers = {}

    const checkWords = words.map(word => {
        return checkTicker(word)
    })

    await Promise.all(checkWords).then(res => {
        console.log(res)
        res.forEach(ticker => {
            if (ticker){
                tickers[ticker] = true
            }
        })
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

const checkTicker = (word) => {
    return new Promise((resolve, reject) => {
        if (allowList[word]) {
            return resolve(word)
        }
    
        if (denyList[word]) {
            return resolve(false)
        }
    
        const params = {
            hostname: 'www.alphavantage.co',
            port: 443,
            method: 'GET',
            path: '/query?function=OVERVIEW&symbol=' + word + '&apikey=' + API_KEY
        }
    
        return httpRequest(params).then(function(data) {
            const isTicker = !!data.Symbol
            if (isTicker === false) {
                console.log(data)
                resolve(false)
            }
            return resolve(word)
        });

    })
}


module.exports = {
    getTickers,
    updateTickers
}