const snoowrap = require('snoowrap');

const { SUBREDDIT } = require('./constants');
const { getTickers } = require('./utils')
const vader = require('vader-sentiment');

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
         const comment = await dd.expandReplies({ limit: 10, depth: 1}).then(e => e)

         comments = [...comments, ...comment.comments]
    }))
    
    // const transformer = (counts, ticker, post, sentiment) => {
    //     if (counts[ticker]) {
    //         counts[ticker].count += 1
    //         counts[ticker].upvotes += parseInt(post.ups)
    //         counts[ticker].sentiment.neg += parseFloat(sentiment.neg)
    //         counts[ticker].sentiment.neu += parseFloat(sentiment.neu)
    //         counts[ticker].sentiment.pos += parseFloat(sentiment.pos)
    //     } else {
    //         delete sentiment.compound
    //         counts[ticker] = {
    //             count: 1,
    //             upvotes: parseInt(post.ups),
    //             sentiment: {...sentiment},
    //         }
    //     }
    // }

    // const counts = await contentsToCounts(content, transformer)
    
    return Promise.all(comments.map(async comment => {
        return {
            tickers: (await getTickers(comment.body)),
            body: comment.body,
            upvotes: comment.ups,
            sentiment: vader.SentimentIntensityAnalyzer.polarity_scores(comment.body)
        }
    }))
}


module.exports = {
    getDiscussionPosts
}