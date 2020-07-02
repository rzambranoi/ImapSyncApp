const monk = require('monk');

const db = monk('localhost/ImapSyncApp');

module.exports = db;