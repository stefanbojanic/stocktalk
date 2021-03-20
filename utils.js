const {
    API_KEY,
    PROD_KEY,
} = require('./constants')
const snoowrap = require('snoowrap');
const vader = require('vader-sentiment');
const {
    db,
    getAllowList,
    getDenyList,
    updateList,
    saveLists
} = require('./firestore');
const moment = require('moment');
const httpRequest = require('./http');
const constants = require('./constants');

const SUBREDDIT = constants.WALLSTREETBETS

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const r = new snoowrap({
    userAgent: 'wsb-tickerbot',
    clientId: 'sXFsYdT2GlAZfQ',
    clientSecret: 'LA1E5JRSVevmUYPPqYPLfWlviGXu8w',
    username: 'wework-street-bets',
    password: 'PoonaniPrince69'
});

const getTickers = async (text) => {
    const posPrefix ="\\b(?<=\\$)"
    const negPrefix = "\\b(?<!\\$)"    
    const prefixUpper = new RegExp(posPrefix + "[A-Z]{1,5}\\b", 'g')
    const nofixUpper = new RegExp(negPrefix + "[A-Z]{2,5}\\b", 'g')
    const prefixLower = new RegExp(posPrefix + "[a-z]{1,6}\\b", 'g')
    const prefixTitle = new RegExp(posPrefix + "[A-Z]{1}[a-z]{2,5}\\b", 'g')

    const matches = [
        ...(text.match(prefixUpper) || []),
        ...(text.match(nofixUpper) || []),
        ...(text.match(prefixLower) || []),
        ...(text.match(prefixTitle) || []),
    ]

    // Remove duplicates
    const uniqueWords = [...new Set(matches)]

    const tickers = {}
    const denyTickers = {}
        
    const allowList = await getAllowList()
    const denyList = await getDenyList()

    const checkWords = uniqueWords.map(async word => {
        await sleep(200);
        return checkTicker(allowList, denyList, word.toUpperCase())
    })

    await Promise.all(checkWords).then(res => {
        res.forEach(({ticker, status}) => {
            if (status === 'limited') {
                // idk do nothing because we want to process it again later when we arent limited
            }
            else if (status === 'deny') {
                denyTickers[ticker] = true
            }
            else if (status === 'allow'){
                tickers[ticker] = true
            }
        })
    })

    await updateList('denyList', denyTickers)
    await updateList('allowList', tickers)
    
    return tickers
}

const updateTickers = (tickers, counts, post, sentiment) => {
    Object.keys(tickers).forEach(ticker => {
        if (counts[ticker]) {
            counts[ticker].count += 1
            counts[ticker].upvotes += post.ups
            counts[ticker].sentiment.neg += sentiment.neg
            counts[ticker].sentiment.neu += sentiment.neu
            counts[ticker].sentiment.pos += sentiment.pos
        } else {
            delete sentiment.compound
            counts[ticker] = {
                count: 1,
                upvotes: post.ups,
                sentiment,
            }
        }
    });
    return counts;
}

const checkTicker = (allowList, denyList, word) => {
    return new Promise((resolve, reject) => {

        if (allowList[word]) {
            console.log('Cache allow', word)
            return resolve({ticker: word, status: 'allow'})
        }
    
        if (denyList[word]) {
            console.log('Cache deny', word)
            return resolve({ticker: word, status: 'deny'})
        }
    
        const params = {
            hostname: 'sandbox.iexapis.com', // use cloud.iexapis.com for real, sandbox.iexapis.com to test
            port: 443,
            method: 'GET',
            path: '/stable/stock/' + word + '/quote?token=' + API_KEY // API_KEY or PROD_KEY
        }

        console.log(params.path)

        return httpRequest(params)
        .then((data) => {
            if (data.latestPrice) {
                console.log('Got ticker', word)
                return resolve({ticker: word, status: 'allow'})
            } else {
                console.log('Ignored ticker', word)
                return resolve({ticker: word, status: 'deny'})  
            }
        })
        .catch((e) => {
            if (e.statusCode === 404) {
                console.log('404 ticker', word)
                return resolve({ticker: word, status: 'deny'})                
            } else {
                console.log('Error', e.statusCode, word)
            }
        })
        .finally(() => {
            return resolve({ticker: word, status: 'limited'})  
        })

    })
}

const getHot = async () => {
  const date = moment().utc().startOf('day').valueOf()
  
  const snapshot = await db.collection('counts').doc(`${date}`).get()
  if (snapshot.exists) {
      return 'Data already set for this date'
  }

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
  await saveLists()
  await db.collection('counts').doc(`${date}`).set(counts)
  return counts
}


module.exports = {
    getHot,
}