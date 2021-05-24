const {
    PROD_KEY,
} = require('./constants')
const httpRequest = require('./http');

const getTickerQuotes = async (tickers) => {

    const tickerMap = {}

    await Promise.all(tickers.map(ticker => {
        const params = {
            hostname: 'cloud.iexapis.com', // use cloud.iexapis.com for real, sandbox.iexapis.com to test
            port: 443,
            method: 'GET',
            path: '/stable/stock/' + ticker + '/quote?token=' + PROD_KEY // API_KEY or PROD_KEY
        }
    
        return httpRequest(params)
            .then((data) => {
                if (data.delayedPrice && data.changePercent) {
                    tickerMap[ticker] = {
                        price: data.delayedPrice,
                        changePercent: data.changePercent
                    }
                    return
                } else {
                    console.log('Ignored ticker', ticker)
                    return
                }
            })
            .catch((e) => {
                    console.log('Error', e.statusCode, ticker)
            })
            .finally(() => {
                return
            })

    }))

    return tickerMap    

}

module.exports = {
    getTickerQuotes
}