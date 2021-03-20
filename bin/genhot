#! /app/.heroku/node/bin/node

const { getHot } = require('./utils');

const genhot = async () => {
    console.log("CRON: genhot")
    const counts = await getHot()
    res.send(counts)
}

genhot()

process.exit()