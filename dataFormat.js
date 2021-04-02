const moment = require('moment');

const formatDiscussion = (discussion) => {
    const ticker = 'TSLA'
    const cumuBull = [0]
    const cumuBear = [0]
    const total = [0]

    const bull = []
    const bear = []

    const labels = []
    const sortedDates = Object.keys(discussion).sort()

    sortedDates.forEach(date => {
        total.push(total[total.length - 1])
        cumuBull.push(cumuBull[cumuBull.length - 1])
        cumuBear.push(cumuBear[cumuBear.length - 1])

        bull.push(null)
        bear.push(null)

        labels.push(moment.unix(date/1000).format('LT'))
        
        Object.entries(discussion[date]).forEach(([k, v]) => {
            if (k === ticker) {
                total[total.length - 1] = total[total.length - 2] + v.count
                cumuBull[cumuBull.length - 1] = cumuBull[cumuBull.length - 2] + v.sentiment.pos * v.count
                cumuBear[cumuBear.length - 1] = cumuBear[cumuBear.length - 2] + (v.sentiment.neg + v.sentiment.pos) * v.count
                bull[bull.length - 1] = v.sentiment.pos * v.count
                bear[bear.length - 1] = (v.sentiment.neg + v.sentiment.pos) * v.count
            }
        })
    })

    const cumulativeDatasets = [
        {
            spanGaps: true,
            label: 'bull',
            data: cumuBull,
            backgroundColor: 'rgba(61, 203, 101, 0.2)',
            borderColor: 'rgba(61, 203, 101, 1)',
            borderWidth: 2
        },
        {
            spanGaps: true,
            label: 'bear',
            data: cumuBear,
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
            label: 'total',
            data: bear,
            backgroundColor: 'rgba(255, 99, 132, 0)',
            borderColor: 'rgba(63, 127, 191, 1)',
            borderWidth: 2
        }
    ]

    return { cumulativeDatasets, datasets, labels}
}



module.exports = {
    formatDiscussion,
}