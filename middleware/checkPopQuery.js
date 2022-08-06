// env
require("dotenv").config();
const { MAX_POP, SIGN_AFTER_SECONDS } = process.env;

// checkPopQuery
const validateSchool = require("../validator/validateSchool");
const validateToken = require("../validator/validateToken");
const newToken = require("../validator/signNewToken");

const checkPopQuery = async (req, res, next) => {
  const { schoolCode, count, token } = req.query;

  const d = new Date();
  d.setSeconds(d.getSeconds() + SIGN_AFTER_SECONDS);

  const T = validateToken(token, schoolCode);
  if (T !== true)
    return res.status(T.status).json(T.data);
  
  const S = await validateSchool(schoolCode);
  if (S !== true)
    return res.status(400).json({ error: true, msg: "schoolCode is not exists" });
  
  const c = parseInt(count || 0);
  req.count = (0 < c && c <= MAX_POP && token) ? c : 0;
  req.schoolCode = schoolCode;
  req.newToken = newToken(schoolCode, d);
  
  return next();
}

module.exports = checkPopQuery;