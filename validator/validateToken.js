// env
require("dotenv").config()
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;

// validateToken
const jwt = require("jsonwebtoken");

const verifyToken = (token) => jwt.verify(token, JWT_TOKEN_SECRET);

const validateToken = (token, schoolCode, ip) => {
  if (token) {
    try {
      const verified = verifyToken(token);
      if (verified.schoolCode !== schoolCode || verified.ip !== ip)
        return { status: 403, data: { error: true, msg: "schoolCode is different" } };
      if (new Date() <= verified.time)
        return { status: 403, data: { error: true, msg: "wrong time" } };
      return true;
    } catch (err) {
      if (err.expiredAt)
        return { status: 401, data: { error: true, msg: `token is expired at ${err.expiredAt}` } };  
      return { status: 403, data: { error: true, msg: "signature is invalid" } };
    }
  }

  return true;
}

module.exports = validateToken;