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
    const ddCursor = (await cursorRef.get()).data()
    console.log('Cursor:', ddCursor)
    const posts = await r.getHot(SUBREDDIT, { limit: 0 } )
    const discussions = []
    const pinned = []
    posts.forEach(post => {
        if(post.link_flair_richtext.find(f => f.t === "Daily Discussion") || post.link_flair_richtext.find(f => f.t === "Weekend Discussion")) {
            discussions.push(post)
        } else if (post.stickied) {
            pinned.push(post)
        }
    })
    
    let comments = []
    await Promise.all(discussions.map(async dd => {
        const post = await dd.expandReplies({ limit: 300, depth: 0 }).then(e => e)

        console.log(`Got ${post.comments.length} comments`)

        post.comments.forEach(comment => {
            if (comment.created_utc > ddCursor.cursor) {
                comments.push(comment)
            }
        })

    }))

    console.log(`Kept ${comments.length} comments`)

    if (comments.length) {
        const cursor = comments[0].created_utc
        cursorRef.set({ cursor })
    }
    
    const counts = await contentsToCounts(comments.map(c => ({...c, tickerBody: c.body})))
    return counts
}

getPinnedPosts = async () => {
    const posts = await r.getHot(SUBREDDIT, { limit: 0 } )
    return posts.filter(post => post.stickied).map(post => {
        return {
            link: post.permalink,
            title: post.title,
        }
    })
}


module.exports = {
    getDiscussionPosts,
    getPinnedPosts
}