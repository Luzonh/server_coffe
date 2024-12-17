const admin = require('firebase-admin');
const serviceAccount = require('./model/ia-coffee-firebase-adminsdk-q1d9k-4f2ffeeffc.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'ia-coffee.appspot.com'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { db, bucket };
