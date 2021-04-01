const formatDiscussion = (discussion) => {
    return Object.entries(discussion).map(([date, counts]) => {
        return {
            date
        }
    })
}



module.exports = {
    formatDiscussion,
}