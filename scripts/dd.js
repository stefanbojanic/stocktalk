const moment = require('moment');
const { getDiscussionPosts } = require('../reddit');
const { roundDate } = require('../utils');
const {
    db,
    saveLists
} = require('../firestore');

const dd = async () => {
    
    const date = moment().utc().startOf('day').valueOf()
    const now = moment().utc()

    const roundedDate = roundDate(now, moment.duration(10, 'minutes'), 'floor').valueOf()

    console.log(roundedDate)

    const counts = await getDiscussionPosts()

    console.log(counts)

    await saveLists()
    await db.collection('discussionCounts').doc(`${date}`).set({
        [roundedDate]: counts,
    }, { merge: true })
};

dd();