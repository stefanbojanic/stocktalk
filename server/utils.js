const {
    API_KEY,
} = require('./constants')
const {
    getAllowList,
    getDenyList,
    updateList
} = require('./db')
const httpRequest = require('./http');

const getTickers = async (text) => {
    const filtered = text.replace(/[^a-zA-Z ]/g, '')
    let words = filtered.split(" ")
    words = words.filter(word => word.length < 5)

    const tickers = {}
    const denyTickers = {}
        
    const allowList = getAllowList()
    const denyList = getDenyList() 

    const checkWords = words.map(word => {
        return checkTicker(allowList, denyList, word.toUpperCase())
    })

    await Promise.all(checkWords).then(res => {
        console.log(res)
        res.forEach(ticker => {
            if (ticker === 'limited') {
                // idk do nothing because we want to process it again later when we arent limited
            }
            else if (ticker === false) {
                denyTickers[ticker] = true
            }
            else if (ticker !== 'limited'){
                tickers[ticker] = true
            }
        })
    })

    updateList('denyList', denyTickers)
    updateList('allowList', tickers)
    
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

const checkTicker = (allowList, denyList, word) => {
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
                if (data.Note?.includes('Our standard API call frequency is 5 calls per minute and 500 calls per day')) {
                    console.log(word, 'Api limit reached')
                    resolve('limited')
                } else {
                    console.log(word, 'Ticker not found')
                    resolve(false)
                }
            }
            return resolve(word)
        });

    })
}


module.exports = {
    getTickers,
    updateTickers
}