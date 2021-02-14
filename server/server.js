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
  const counts = {}
  await r.getSubreddit(SUBREDDIT)
    .getHot()
    .map(post => {
      const tickers = { ...getTickers(post.title), ...getTickers(post.selftext)}
      Object.keys(tickers).forEach(ticker => {
        if(counts[ticker]) {
          counts[ticker].count += 1
          counts[ticker].upvotes += post.ups
        } else {
          counts[ticker] = {
            count: 1,
            upvotes: post.ups
          }
        }
      })
    })
  // url, approved_at_utc, subreddit, selftext, aiuthor_fullname, saved, mod_reason_title, gilded, clicked, title,
  // link_flair_richtext{ e:text, t:weekend discussion}, subredit_name_prefixed, link_flair_css_class, link_flair_text

  res.send(counts)
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})