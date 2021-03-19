require('dotenv').config()
const express = require('express');
const snoowrap = require('snoowrap');
const moment = require('moment');
let mustacheExpress = require('mustache-express');
const constants = require('./constants');
const {
  getTickers,
  updateTickers,
  analyzePost
} = require('./utils');
const vader = require('vader-sentiment');
const db = require('./firestore');
const { values } = require('lodash');

const app = express()
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

const port = 3000

const r = new snoowrap({
  userAgent: 'wsb-tickerbot',
  clientId: 'sXFsYdT2GlAZfQ',
  clientSecret: 'LA1E5JRSVevmUYPPqYPLfWlviGXu8w',
  username: 'wework-street-bets',
  password: 'PoonaniPrince69'
});

const SUBREDDIT = constants.WALLSTREETBETS

app.get('/', async (req, res) => {
  const date = moment().startOf('day').valueOf()
  const snapshot = await db.collection('counts').doc(`${date}`).get()
  const tickers = Object.entries(snapshot.data()).map(([ticker, values]) => {
      return {
        ...values,
        ticker,
        sentiment: {
          pos: values.sentiment.pos / values.count * 100,
          neg: values.sentiment.neg / values.count * 100,
          neu: values.sentiment.neu / values.count * 100
        }
      }
  })
  const view = {
    tickers,
    toFixed: function() {
      return function(num, render) {
          return parseFloat(render(num)).toFixed(2);
      }
    }
  }
  res.render('hot', view)
})

app.get('/raw', async (req, res) => {
  const content = await r.getHot(SUBREDDIT, { limit: 100 } )
  const all = await content.fetchMore({ amount: 400, append: true })
  const text = all.map(post => post.selftext)
  res.send(text)
})

app.get('/test', async (req, res) => {
  const tickers = await getTickers("Has $GLD/IAU bottomed yet? What's the prospect for gold miners like $nugt?")
  res.send(tickers)
})

app.get('/genhot', async (req, res) => {
  console.log("REQUEST: /hot")
  let counts = {}
  const content = await r.getHot(SUBREDDIT, { limit: 100 } )
  await content.fetchMore({ amount: 200, append: true })
    .map(async post => {
      const tickers = await getTickers(post.title + post.selftext)
      const sentiment = vader.SentimentIntensityAnalyzer.polarity_scores(post.title + post.selftext)   
      counts = updateTickers(tickers, counts, post, sentiment);
    });
  // url, approved_at_utc, subreddit, selftext, aiuthor_fullname, saved, mod_reason_title, gilded, clicked, title,
  // link_flair_richtext{ e:text, t:weekend discussion}, subredit_name_prefixed, link_flair_css_class, link_flair_text

  const date = moment().startOf('day').valueOf()
  await db.collection('counts').doc(`${date}`).set(counts)
  res.send(counts)
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})