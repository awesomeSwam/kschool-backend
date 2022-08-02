// env
require("dotenv").config()
const { JWT_TOKEN_SECRET, JWT_EXP } = process.env;
const JWT_OPTION = { expiresIn: JWT_EXP };

// signNewToken
const jwt = require("jsonwebtoken");

const signNewToken = (schoolCode) => jwt.sign({ schoolCode }, JWT_TOKEN_SECRET, JWT_OPTION);

module.exports = signNewToken;