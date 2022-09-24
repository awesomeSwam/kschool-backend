// env
require("dotenv").config();

// checkPopQuery
const validateSchool = require("../validator/validateSchool");

const checkSchoolQuery = async (req, res, next) => {
  const { schoolCode } = req.query;

  const S = await validateSchool(schoolCode);
  if (S !== true)
    return res.status(400).json({ error: true, msg: "schoolCode is not exists" });

  req.schoolCode = schoolCode;

  return next();
}

module.exports = checkSchoolQuery;