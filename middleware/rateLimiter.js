// env
require("dotenv").config();

const rateLimiter = ({ secondsWindow, allowedHits }) => {
  return async function (req, res, next) {
    const ip = `IP_${req.ip}`;
    const requests = await redisClient.incr(ip);
  
    if (requests === 1) redisClient.expire(ip, secondsWindow);

    if (requests <= allowedHits) {
      return next;
    }
    
    return res.status(429).json({
      response: "429 Too Many Request"
    });
  }
}

module.exports = rateLimiter;