const { getHot } = require('./utils');

async function genhot() {
    console.log("CRON: genhot")
    await getHot()
};

genhot();