require('dotenv').config()
const express = require('express');
const moment = require('moment');
let mustacheExpress = require('mustache-express');
const {
  getHot
} = require('./utils');
const db = require('./firestore');

const app = express()
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

const port = 3000

app.get('/', async (req, res) => {
  res.render('home')
})

app.get('/hot', async (req, res) => {
  const date = req.query.date
  const timestamp = moment(date).valueOf()

  let snapshot = await db.collection('counts').doc(`${timestamp}`).get()

  if (!snapshot.exists && timestamp === moment().startOf('day').valueOf()) {
    // Trying to get todays data and its not there
    await getHot()
    snapshot = await db.collection('counts').doc(`${timestamp}`).get()
  } else if (!snapshot.exists && timestamp !== moment().startOf('day').valueOf()) {
    // Trying to get another days data and its not there
    res.send('No data for the selected timeframe')
    return
  }

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

  tickers.sort((x, y) => {
    if (x.upvotes < y.upvotes) {
      return 1;
    }
    if (x.upvotes > y.upvotes) {
      return -1;
    }
    return 0;
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

app.get('/hot/:time', async (req, res) => {
  const time = req.params.time
  const date = time === 'today' ? moment().startOf('day').valueOf() : time
  const snapshot = await db.collection('counts').doc(`${date}`).get()

  if (!snapshot.exists && time === 'today') {
    await getHot()
  }

  if (!snapshot.exists) {
    res.send('No data for the selected timeframe')
  }

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

  tickers.sort((x, y) => {
    if (x.upvotes < y.upvotes) {
      return 1;
    }
    if (x.upvotes > y.upvotes) {
      return -1;
    }
    return 0;
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

// app.get('/raw', async (req, res) => {
//   const content = await r.getHot(SUBREDDIT, { limit: 100 } )
//   const all = await content.fetchMore({ amount: 400, append: true })
//   const text = all.map(post => post.selftext)
//   res.send(text)
// })

// app.get('/test', async (req, res) => {
//   const tickers = await getTickers("Has $GLD/IAU bottomed yet? What's the prospect for gold miners like $nugt?")
//   res.send(tickers)
// })

app.get('/genhot', async (req, res) => {
  console.log("REQUEST: /hot")
  const counts = await getHot()
  res.send(counts)
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})