const snoowrap = require('snoowrap');

const { SUBREDDIT } = require('./constants');
const { getTickers, contentsToCounts } = require('./utils')
const vader = require('vader-sentiment');
const { db } = require('./firestore');

const r = new snoowrap({
    userAgent: 'wsb-tickerbot',
    clientId: 'sXFsYdT2GlAZfQ',
    clientSecret: 'LA1E5JRSVevmUYPPqYPLfWlviGXu8w',
    username: 'wework-street-bets',
    password: 'PoonaniPrince69'
});

const getDiscussionPosts = async () => {
    const cursorRef = db.collection('data').doc('ddCursor')
    const cursor = (await cursorRef.get()).data()
    console.log('Cursor:', cursor)
    const posts = await r.getHot(SUBREDDIT, { limit: 0 } )
    const discussions = []
    const pinned = []
    posts.forEach(post => {
        if(post.link_flair_richtext.find(f => f.t === "Daily Discussion")) {
            discussions.push(post)

            // Cursor stuff could get messed if multiple pinned discussions
            if (cursor.id === post.id) {
                // This is the same post we've seen earlier today
                cursor.offset = post.num_comments - cursor.numSeen
                cursor.numSeen = post.num_comments
            } else {
                // We need to reset cursor, this is a new post
                cursor.numSeen = post.num_comments
                cursor.offset = 300 // Amount of comments to grab if we havent seen this post before
                cursor.id = post.id
            }

        } else if (post.stickied) {
            pinned.push(post)
        }
    })

    await cursorRef.set(cursor)

    
    let comments = []
    await Promise.all(discussions.map(async dd => {
        console.log(`Getting ${cursor.offset} comments from post ${cursor.id}`)
        const comment = await dd.expandReplies({ limit: cursor.offset, depth: 1}).then(e => e)

        console.log(`Got ${comment.comments.length} comments`)

        comments = [...comments, ...comment.comments]
    }))
    
    const counts = await contentsToCounts(comments.map(c => ({...c, tickerBody: c.body})))
    return counts
}


module.exports = {
    getDiscussionPosts
}