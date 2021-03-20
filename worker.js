const { getHot } = require('./utils');

const genhot = async () => {
    console.log("CRON: genhot")
    const counts = await getHot()
}

genhot()

process.exit()