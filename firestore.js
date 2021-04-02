
const admin = require('firebase-admin');
const serviceAccount = {
    "type": "service_account",
    "project_id": "stocktalkbets",
    "private_key_id": "3c04e0b79f1d078ebbddd3a4198e1e65323fac29",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDZMNn874FU1hF/\noXgxySusb0AnxESxT+2pIGSmhWhcuj8N8jYPv8v2ofDHb5yh2SabdfCIO7Eg24Cg\nF28qxEjpoUNW7gGWgpRo6v7qmPHE5v2xaQZUSTzrlR/IEDAGJWg5aVQ2SknKb1n9\nFrUybn/7ZqfJpEc8+AhPg0J65FdNlgpxmGx+1ZPskfChwm6fHqhhKK2QSTvYrdMn\nPE+2SeC8FHzaCwuL8yXNgjH5d/z2vxUA7D5PLCnx7FgN+ndueMU87e0hem1SVDlo\n+OOtfpcBnkh/ECEPmuQAngaHnseBpIQseEvXJcE+VT16uP7I65kueXOJ01JxbLTm\nJycVEEiRAgMBAAECggEAaFwvWnixAdUsqlGpge6ihCQexRzrTvHThkEw68zNpUS+\n2JIqRO4JcPRGUGZCcoh3oxqMHcHk7h9a0lIAUiHn0Q7yXvpVG/+ZlUJZg9tCzLSb\ncRxAdM6OLbrFfym8Ea/2wSNp2f5fL5zKtjArl9R9vYyJkfvUWSjrQV2WW5uNkZLk\nyVuwq7upPvgq/bJJUZJttV/p0Ai9vYh6Ihe1zrFT3+KWuuri8MXU71UhETHtwBj3\n3IYsRiqYwG4r+aSGN0b9CTObx+xqIAN8Kgjsg7hCz1nIwnuZGYUBbTRUzdxV/2Ie\njGbJewx8joEhWoVM0mpPN8Tf0+9JwkRe/rD+SZQtuwKBgQDuu25LOgBNmqMjU+QV\newtJf+SupUbU5SNg3+n5ycps6xbs0VISzYL9WlVTpX2yuSQg17a2qSf04Le4iRfC\niHnnXeelJdThT2lCv+9ATO/rogMRBNFMM/0pjczOolfzK5h+frSWUIu73JFYDvA7\nE88RapuDuJhkQnHqnuZEF2/zRwKBgQDo5osELrCccTYmeRYg0kNZKI5CvghoVtgb\nBU7M1oK9fuuI4ET/jyOLZWAB644crt3rmcoQfyWGxZo4tSZo48p0I2E1hVI2MITd\nTvmYJ0Ar3c2HZVVn/+zmvXKMA214RLr1xwUZYpJ/Ek1yh9JIARBOgC9ALJy77D56\nTv4m/izhZwKBgQDpA1qI5GjtVhULY1OJP9rpd4JekIVNQQXCBWubWkFRBDkRFtIT\n9jF3VhdYmHvS2PCRedsl+H8+faP04yKkxo6trDNwNzfMXrUv6KT+TtoSVMTHdLtQ\ntKHSUExqF3zepVung8aBvMZWq9fVamdCUnhW2IZIEAH2QgBsb4HzTij/+wKBgQC1\nkg6tGw1bWbOiuOH0gpg46TJHfEmntpTSNAgkD9RrkYhk9Js2Ncy7PzRjKtZnLDkd\nFY9/3vBNqr46GZgxS+2pL2/4vtDCKH9c3dYetfMEf+5c8TZtVwvFM8satw1gJw0u\n0ZL7IGsfoBA7CwJ4WkPxP2QW/vDOXTa0OeNQWPZ6XwKBgQCLshlXd7KotZJLujuz\n4x/iQnRtIaJA4csOR1jlINSg2mr2Zum8D7JH/pwtRRPCtiq55tGJzsb7FRZaQUE4\nPnfbWce7z4V+T0niLYDNpDSk674KgoGI69IUEPjvoImJhWFBD/2mFVbvMIRBwxXP\nCnnly4tckznmZKipWgABvY4aAQ==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-lt8pj@stocktalkbets.iam.gserviceaccount.com",
    "client_id": "101400212622964402513",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-lt8pj%40stocktalkbets.iam.gserviceaccount.com"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


let denyCache = {}
let allowCache = {}

const getAllowList = async () => {
  if (Object.values(allowCache).length < 1) {
    const allowList = await db.collection('data').doc('allowList').get()
    allowCache = allowList.data()
  }
  return allowCache
}

const getDenyList = async () => {
  if (Object.values(denyCache).length < 1) {
    const denyList = await db.collection('data').doc('denyList').get()
    denyCache = denyList.data()
  }
  return denyCache
}

const updateList = (type, list) => {
  if(type !== 'allowList' && type !== 'denyList') {
      console.error('Must use either allowList or denyList')
      return false
  }

  if(type === 'allowList') {
    allowCache = {
      ...allowCache,
      ...list
    }
  }

  if(type === 'denyList') {
    denyCache = {
      ...denyCache,
      ...list
    }
  }
}

const saveLists = async () => {
  console.log('Saving caches')

  if(Object.values(allowCache).length >= 1) {
    await db.collection('data').doc('allowList').update(allowCache)
    allowCache = {}
  }

  if(Object.values(denyCache).length >= 1) {
    await db.collection('data').doc('denyList').update(denyCache)
    denyCache = {}
  }
  
  
  console.log('Successfully saved caches', allowCache, denyCache)
}

const db = admin.firestore();

module.exports = {
  increment: admin.firestore.FieldValue.increment,
  db,
  getAllowList,
  getDenyList,
  updateList,
  saveLists
}