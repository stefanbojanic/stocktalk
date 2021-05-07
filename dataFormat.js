const moment = require('moment');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const formatDiscussion = (discussion, topTickers) => {
    
    const ticker = 'TSLA'
    const tickerData = {}
    Object.keys(topTickers).forEach(ticker => {
        tickerData[ticker] = [0]
    })

    const cumuBull = [0]
    const cumuBear = [0]
    const total = [0]

    const bull = []
    const bear = []

    const labels = []
    const sortedDates = Object.keys(discussion).sort()

    sortedDates.forEach(date => {
        Object.keys(topTickers).forEach(ticker => {
            tickerData[ticker].push(tickerData[ticker][tickerData[ticker].length - 1])
        })

        total.push(null)
        cumuBull.push(cumuBull[cumuBull.length - 1])
        cumuBear.push(cumuBear[cumuBear.length - 1])

        bull.push(null)
        bear.push(null)

        labels.push(moment.unix(date/1000).format('LT'))
        
        Object.entries(discussion[date]).forEach(([k, v]) => {
            if (k === ticker) {
                total[total.length - 1] = v.count
                cumuBull[cumuBull.length - 1] = cumuBull[cumuBull.length - 2] + v.sentiment.pos * v.count
                cumuBear[cumuBear.length - 1] = cumuBear[cumuBear.length - 2] + (v.sentiment.neg + v.sentiment.pos) * v.count
                bull[bull.length - 1] = v.sentiment.pos
                bear[bear.length - 1] = v.sentiment.neg + v.sentiment.pos
            }

            if (topTickers[k]) {
                tickerData[k][tickerData[k].length - 1] = tickerData[k][tickerData[k].length - 2] + v.count
            }

        })
    })
    
    const cumulativeDatasets = Object.keys(topTickers).map(ticker => (
        {
            label: ticker,
            data: tickerData[ticker],
            borderColor: `rgba(${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, 1)`,
            backgroundColor: 'rgba(61, 203, 101, 0)',
            borderWidth: 2,
        }
    ))

    const datasets = [
        {
            spanGaps: true,
            label: 'bull',
            data: bull,
            backgroundColor: 'rgba(61, 203, 101, 0.2)',
            borderColor: 'rgba(61, 203, 101, 1)',
            borderWidth: 2
        },
        {
            spanGaps: true,
            label: 'bear',
            data: bear,
            backgroundColor: 'rgba(228, 67, 70, 0.2)',
            borderColor: 'rgba(61, 203, 101, 0)',
            borderWidth: 2
        },
        // {
        //     spanGaps: true,
        //     label: 'mentions',
        //     data: total,
        //     backgroundColor: 'rgba(255, 99, 132, 0)',
        //     borderColor: 'rgba(63, 127, 191, 1)',
        //     borderWidth: 2
        // }
    ]

    return { cumulativeDatasets, datasets, labels}
}



module.exports = {
    formatDiscussion,
}