require('dotenv').config()
const express = require('express');
const snoowrap = require('snoowrap');
const moment = require('moment');
const constants = require('./constants');
const {
  getTickers,
  updateTickers
} = require('./utils');

const db = require('./firestore');

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
  let counts = {}
  await r.getSubreddit(SUBREDDIT)
    .getHot()
    .map(post => {
      const tickers = {
        ...getTickers(post.title),
        ...getTickers(post.selftext)
      }
      counts = updateTickers(tickers, counts, post);
    });
  // url, approved_at_utc, subreddit, selftext, aiuthor_fullname, saved, mod_reason_title, gilded, clicked, title,
  // link_flair_richtext{ e:text, t:weekend discussion}, subredit_name_prefixed, link_flair_css_class, link_flair_text

  const date = moment().startOf('day').valueOf()
  await db.collection('counts').doc(`${date}`).set(counts)
  res.send(`Wrote "${JSON.stringify(counts)}" to database, key: "${date}"`)
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})