// env
require("dotenv").config();

const redis = require("../database/redis");

const rateLimiter = (secondsWindow, allowedHits) => {
  return async function (req, res, next) {
    const myIp = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
    const ip = `IP_${myIp}`;
    
    const requests = await redis.ip.incr(ip);

    if (requests === null) {
      return res.status(500).json({ error: true, msg: "server error" });
    }

    if (requests === 1) redis.ip.expire(ip, secondsWindow);

    if (requests <= allowedHits) {
      console.log(ip, requests);
      return next();
    }
    
    return res.status(429).json({ error: true, msg: "429 Too many requests" });
  }
}

module.exports = rateLimiter;