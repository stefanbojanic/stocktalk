const moment = require('moment-timezone');
const {
    PROD_KEY, API_KEY
} = require('./constants')
const httpRequest = require('./http');
const { roundDate } = require('./utils');

const getTickerQuotes = async (tickerObjs) => {

    const tickers = tickerObjs.map(ticker => ticker.ticker)
    // console.log('/stable/stock/market/batch?symbols=' + tickers.join() + '&token=' + PROD_KEY)

    const path = '/stable/stock/market/batch?symbols=' + tickers.join() + '&types=quote&token=' + PROD_KEY

    const params = {
        hostname: 'cloud.iexapis.com', // use cloud.iexapis.com for real, sandbox.iexapis.com to test
        port: 443,
        method: 'GET',
        path
    }

    const quotes = await httpRequest(params)
        .then(data => {
            return data
        })
        .catch(err => console.log(err))

    return tickerObjs.map(ticker => {
        return {
            ...ticker,
            price: quotes[ticker.ticker].quote.delayedPrice || quotes[ticker.ticker].quote.latestPrice,
            change: quotes[ticker.ticker].quote.changePercent * 100,
        }
    })

}

const getTickerChartData = async (ticker, date) => {

    const path = `/stable/stock/${ticker.toLowerCase()}/intraday-prices?token=${PROD_KEY}`

    const params = {
        hostname: 'cloud.iexapis.com', // use cloud.iexapis.com for real, sandbox.iexapis.com to test
        method: 'GET',
        path
    }

    const quotes = await httpRequest(params)
        .then(data => {
            return data
        })
        .catch(err => console.log(err))

    const timeseries = []
    let timeLast = ''
    
    quotes.forEach(quote => {
        const time = moment(quote.label, 'LT').tz('US/Eastern')
        const roundedDate = roundDate(time, moment.duration(10, 'minutes'), 'floor').valueOf()
        if (timeLast !== roundedDate && quote.open) {
            timeseries.push(quote.open)
            timeLast = roundedDate
        }
    })

    const path2 = `/stable/stock/${ticker.toLowerCase()}/quote?token=${PROD_KEY}`
    const params2 = {
        hostname: 'cloud.iexapis.com', // use cloud.iexapis.com for real, sandbox.iexapis.com to test
        method: 'GET',
        path: path2
    }

    const quote = await httpRequest(params2)
        .then(data => {
            return data
        })
        .catch(err => console.log(err))

    const direction = Math.sign(quote.change)

    return { timeseries, direction }

}

module.exports = {
    getTickerQuotes,
    getTickerChartData,
}