const {
    API_KEY,
    PROD_KEY,
} = require('./constants')
const {
    getAllowList,
    getDenyList,
    updateList
} = require('./db')
const httpRequest = require('./http');

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

const getTickers = async (text) => {
    const posPrefix ="\\b(?<=\\$)"
    const negPrefix = "\\b(?<!\\$)"    
    const prefixUpper = new RegExp(posPrefix + "[A-Z]{1,5}\\b", 'g')
    const nofixUpper = new RegExp(negPrefix + "[A-Z]{2,5}\\b", 'g')
    const prefixLower = new RegExp(posPrefix + "[a-z]{1,6}\\b", 'g')
    const prefixTitle = new RegExp(posPrefix + "[A-Z]{1}[a-z]{2,5}\\b", 'g')

    const matches = [
        ...(text.match(prefixUpper) || []),
        ...(text.match(nofixUpper) || []),
        ...(text.match(prefixLower) || []),
        ...(text.match(prefixTitle) || []),
    ]

    // Remove duplicates
    const uniqueWords = [...new Set(matches)]

    const tickers = {}
    const denyTickers = {}
        
    const allowList = getAllowList()
    const denyList = getDenyList()

    const checkWords = uniqueWords.map(async word => {
        await sleep(200);
        return checkTicker(allowList, denyList, word.toUpperCase())
    })

    await Promise.all(checkWords).then(res => {
        res.forEach(({ticker, status}) => {
            if (status === 'limited') {
                // idk do nothing because we want to process it again later when we arent limited
            }
            else if (status === 'deny') {
                denyTickers[ticker] = true
            }
            else if (status === 'allow'){
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
            console.log('Cache allow', word)
            return resolve({ticker: word, status: 'allow'})
        }
    
        if (denyList[word]) {
            console.log('Cache deny', word)
            return resolve({ticker: word, status: 'deny'})
        }
    
        const params = {
            hostname: 'sandbox.iexapis.com', // use cloud.iexapis.com for real, sandbox.iexapis.com to test
            port: 443,
            method: 'GET',
            path: '/stable/stock/' + word + '/quote?token=' + API_KEY
        }

        console.log(params.path)

        return httpRequest(params)
        .then((data) => {
            if (data.delayedPrice) {
                console.log('Got ticker', word)
                return resolve({ticker: word, status: 'allow'})
            } else {
                console.log('Ignored ticker', word)
                return resolve({ticker: word, status: 'deny'})  
            }
        })
        .catch((e) => {
            if (e.statusCode === 404) {
                console.log('404 ticker', word)
                return resolve({ticker: word, status: 'deny'})                
            } else {
                console.log('Error', e.statusCode, word)
            }
        })
        .finally(() => {
            return resolve({ticker: word, status: 'limited'})  
        })

    })
}


module.exports = {
    getTickers,
    updateTickers,
}