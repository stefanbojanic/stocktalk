require('dotenv').config()
const express = require('express');
const moment = require('moment');
let mustacheExpress = require('mustache-express');
const { getHot } = require('./utils');
const { db } = require('./firestore');

const app = express()
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

const port = process.env.PORT || 3000

app.get('/', async (req, res) => {
  res.render('home')
})

app.get('/hot', async (req, res) => {
  const date = req.query.date
  const timestamp = moment(date).utc().startOf('day').valueOf()

  console.log(timestamp)
  console.log(req.query)

  let snapshot = await db.collection('counts').doc(`${timestamp}`).get()

  if (!snapshot.exists && timestamp === moment().utc().startOf('day').valueOf()) {
    // Trying to get todays data and its not there
    await getHot()
    snapshot = await db.collection('counts').doc(`${timestamp}`).get()
  } else if (!snapshot.exists && timestamp !== moment().utc().startOf('day').valueOf()) {
    // Trying to get another days data and its not there
    res.send('No data for the selected timeframe')
    return
  }
  
  const tickers = Object.entries(snapshot.data()).map(([ticker, values]) => {
    const count = parseInt(values.count)
      return {
        ...values,
        ticker,
        sentiment: {
          pos: values.sentiment.pos / count * 100,
          neg: values.sentiment.neg / count * 100,
          neu: values.sentiment.neu / count * 100
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

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})