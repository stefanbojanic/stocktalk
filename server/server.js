require('dotenv').config()
const express = require('express');
const snoowrap = require('snoowrap');
const constants = require('./constants');
const {
  getTickers
} = require('./parse');

const app = express()
const port = 3000

const r = new snoowrap({
  userAgent: 'wsb-tickerbot',
  clientId: 'sXFsYdT2GlAZfQ',
  clientSecret: 'LA1E5JRSVevmUYPPqYPLfWlviGXu8w',
  username: 'wework-street-bets',
  password: 'PoonaniPrince69'
});

const SUBREDDIT = constants.WALLSTREETBETS


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/raw', async (req, res) => {
  const content = await r.getSubreddit(SUBREDDIT)
    .getHot()
  res.send(content)
})

app.get('/hot', async (req, res) => {
  const posts = await r.getSubreddit(SUBREDDIT)
    .getHot()
    .map(post => ({
      title: post.title,
      content: getTickers(post.selftext),
      flair: post.link_flair_richtext[0].t,
      upvoteRatio: post.upvote_ratio,
      upvotes: post.ups,
    }))
  // url, approved_at_utc, subreddit, selftext, aiuthor_fullname, saved, mod_reason_title, gilded, clicked, title,
  // link_flair_richtext{ e:text, t:weekend discussion}, subredit_name_prefixed, link_flair_css_class, link_flair_text

  res.send(posts)
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})