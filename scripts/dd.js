const moment = require('moment');
const { getDiscussionPosts } = require('../reddit');
const { roundDate } = require('../utils');
const {
    db,
    increment,
    saveLists
} = require('../firestore');

const dd = async () => {
    
    const date = moment().utc().startOf('day').valueOf()
    const now = moment().utc()

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

dd();