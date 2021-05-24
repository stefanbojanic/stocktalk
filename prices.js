const {
    PROD_KEY,
} = require('./constants')
const httpRequest = require('./http');

const getTickerQuotes = async (tickerObjs) => {

    const tickerMap = {}

    const tickers = tickerObjs.map(ticker => ticker.ticker)
    console.log('/stable/stock/market/batch?symbols=' + tickers.join() + '&token=' + PROD_KEY)
    const params = {
        hostname: 'cloud.iexapis.com', // use cloud.iexapis.com for real, sandbox.iexapis.com to test
        port: 443,
        method: 'GET',
        path: '/stable/stock/market/batch?symbols=' + tickers.join() + '&types=quote&token=' + PROD_KEY 
    }

    const quotes = await httpRequest(params)
        .then(data => {
            return data
        })
        .catch(err => console.log(err))

    return tickerObjs.map(ticker => {
        return {
            ...ticker,
            price: quotes[ticker.ticker].quote.delayedPrice,
            change: quotes[ticker.ticker].quote.changePercent * 100,
        }
    })

}

module.exports = {
    getTickerQuotes
}