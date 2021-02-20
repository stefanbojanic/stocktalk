const fs = require('fs');

const readDb = () => {
    return JSON.parse(fs.readFileSync('tickerDb.json', 'utf8'))
}

const getAllowList = () => readDb().allowList
const getDenyList = () => readDb().denyList

const updateList = (type, list) => {
    if(type !== 'allowList' && type !== 'denyList') {
        console.error('Must use either allowList or denyList')
        return false
    }
    
    const allowList = getAllowList()
    const denyList = getDenyList()

    // Build new allowList or denyList
    const newList = {
        [type]: {
            ...readDb()[type],
            ...list
        }
    }

    // Combine allowList and denyList into 1 object
    const data = JSON.stringify({
        allowList,
        denyList,
        ...newList
    }, null, 4)

    fs.writeFileSync('tickerDb.json', data)
}

module.exports = {
    getAllowList,
    getDenyList,
    updateList
}