export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/blinkcart",
  jwtSecret: process.env.JWT_SECRET || "change_me",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(",")
};
