// require
const checkPopQuery = require("../middleware/checkPopQuery");
const redis = require("../database/redis");

// Router
const express = require("express");
const router = express.Router();
router.post("/", checkPopQuery, async (req, res) => {
  const { schoolCode, count, newToken } = req;

  const total = await redis.total.get();
  const index = await redis.pop.getIndex(schoolCode);
  const p = (count) ? await redis.pop.update(schoolCode, count) : null;
  
  const resObj = {
    token: newToken,
    total: total,
    index: index,
    pop: (p) ? p : await redis.pop.getScore(schoolCode)
  };

  res.status(201).json(resObj);
});

module.exports = router;