const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: process.env.MONGO_URI || "mongodb://35.154.71.3:27017/blinkcart",
  jwtSecret: process.env.JWT_SECRET || "change_me",
  corsOrigin: (process.env.CORS_ORIGIN || "http://35.154.71.3:3000").split(",")
};

module.exports = { config };