const RateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");

const limiter = new RateLimit({
  store: new MongoStore({
    // see Configuration
    uri: "mongodb://127.0.0.1:27017/ImapSyncApp",
    expireTimeMs: 5 * 60 * 1000,
  }),
  max: 5,
  windowMs: 5 * 60 * 1000,
  message: {
    error: "Too many requests from this IP, please try again after 5 min",
  },
});

module.exports = limiter;
