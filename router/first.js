// require
const checkSchoolQuery = require("../middleware/checkSchoolQuery");
const redis = require("../database/redis");

// Router
const express = require("express");
const router = express.Router();
router.post("/", checkSchoolQuery, async (req, res) => {
  const { schoolCode } = req;

  const total = await redis.total.get();
  const rank = await redis.pop.getRank(schoolCode);
  const p = await redis.pop.getScore(schoolCode);
  
  const resObj = {
    token: newToken,
    total: total,
    rank: rank,
    pop: p
  };

  res.status(201).json(resObj);
});

module.exports = router;