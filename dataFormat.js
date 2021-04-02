const moment = require('moment');

const formatDiscussion = (discussion) => {
    const ticker = 'TSLA'
    const bull = []
    const bear = []
    const total = []
    const labels = []
    const sortedDates = Object.keys(discussion).sort()

    sortedDates.forEach(date => {
        total.push(null)
        bull.push(null)
        bear.push(null)
        labels.push(moment.unix(date/1000).format('LT'))
        
        Object.entries(discussion[date]).forEach(([k, v]) => {
            if (k === ticker) {
                total[total.length - 1] = v.count
                bull[bull.length - 1] = v.sentiment.pos * v.count
                bear[bear.length - 1] = (v.sentiment.neg + v.sentiment.pos) * v.count
            }
        })
    })

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
        {
            spanGaps: true,
            label: 'mentions',
            data: total,
            backgroundColor: 'rgba(255, 99, 132, 0)',
            borderColor: 'rgba(63, 127, 191, 1)',
            borderWidth: 2
        }
    ]

    return {datasets, labels}
}



module.exports = {
    formatDiscussion,
}