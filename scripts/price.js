const moment = require('moment-timezone');
const { roundDate } = require('../utils');
const {
    db,
    increment,
    saveLists
} = require('../firestore');

const price = async () => {
    const date = moment().tz('US/Eastern').startOf('day').valueOf()
    const now = moment().tz('US/Eastern')

    const topTickersRef = db.collection('discussionTopTickers').doc(`${date}`)
    const roundedDate = roundDate(now, moment.duration(10, 'minutes'), 'floor').valueOf()

    const counts = await getDiscussionPosts()

    const topTickersDoc = await topTickersRef.get()
    if (!topTickersDoc.exists) {
        topTickersRef.set({ SPY: 0 })
    }

    const updateStatement = {}

    for(ticker in counts) {
        updateStatement[ticker] = increment(counts[ticker].count)
    }

    await topTickersRef.update(updateStatement)

    await saveLists()
    await db.collection('discussionCounts').doc(`${date}`).set({
        [roundedDate]: counts,
    }, { merge: true })

    console.log("Saved DD for", roundedDate)
};

price();