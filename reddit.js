const snoowrap = require('snoowrap');

const { SUBREDDIT } = require('./constants');
const { getTickers, contentsToCounts } = require('./utils')
const vader = require('vader-sentiment');

const r = new snoowrap({
    userAgent: 'wsb-tickerbot',
    clientId: 'sXFsYdT2GlAZfQ',
    clientSecret: 'LA1E5JRSVevmUYPPqYPLfWlviGXu8w',
    username: 'wework-street-bets',
    password: 'PoonaniPrince69'
});

let ddCursor = 0
let ddCursorOffset = 0
let ddCursorId = ""

const getDiscussionPosts = async () => {
    console.log('Cursor:', ddCursor, ddCursorOffset, ddCursorId)
    const posts = await r.getHot(SUBREDDIT, { limit: 0 } )
    const discussions = []
    const pinned = []
    posts.forEach(post => {
        if(post.link_flair_richtext.find(f => f.t === "Daily Discussion")) {
            discussions.push(post)

            // Cursor stuff could get messed if multiple pinned discussions
            if (ddCursorId === post.id) {
                // This is the same post we've seen earlier today
                ddCursorOffset = post.num_comments - ddCursor
                ddCursor = post.num_comments
            } else {
                // We need to reset cursor, this is a new post
                ddCursor = post.num_comments
                ddCursorOffset = 300 // Amount of comments to grab if we havent seen this post before
                ddCursorId = post.id
            }

        } else if (post.stickied) {
            pinned.push(post)
        }
    })

    
    let comments = []
    await Promise.all(discussions.map(async dd => {
        console.log(`Getting ${ddCursorOffset} comments from post ${ddCursorId}`)
        const comment = await dd.expandReplies({ limit: ddCursorOffset, depth: 1}).then(e => e)

        console.log(`Got ${comment.comments.length} comments`)

        comments = [...comments, ...comment.comments]
    }))
    
    const counts = await contentsToCounts(comments.map(c => ({...c, tickerBody: c.body})))
    return counts
}


module.exports = {
    getDiscussionPosts
}