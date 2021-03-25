const snoowrap = require('snoowrap');

const { SUBREDDIT } = require('./constants');


const r = new snoowrap({
    userAgent: 'wsb-tickerbot',
    clientId: 'sXFsYdT2GlAZfQ',
    clientSecret: 'LA1E5JRSVevmUYPPqYPLfWlviGXu8w',
    username: 'wework-street-bets',
    password: 'PoonaniPrince69'
});

const getDiscussionPosts = async () => {
    const posts = await r.getHot(SUBREDDIT, { limit: 0 } )
    const discussions = []
    const pinned = []
    posts.forEach(post => {
        if(post.link_flair_richtext.find(f => f.t === "Daily Discussion")) {
            discussions.push(post)
        } else if (post.stickied) {
            pinned.push(post)
        }
    })
    
    let comments = []
    await Promise.all(discussions.map(async dd => {
         const comment = await dd.expandReplies({ limit: 500, depth: 1}).then(e => e)

         comments = [...comments, ...comment.comments]
    }))
    
    return comments.map(comment => comment.body)
}


module.exports = {
    getDiscussionPosts
}