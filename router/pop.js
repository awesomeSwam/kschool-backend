// require
const checkPopQuery = require("../middleware/checkPopQuery");
const redis = require("../database/redis");

// Router
const express = require("express");
const router = express.Router();
router.post("/", checkPopQuery, async (req, res) => {
  const { schoolCode, count, newToken } = req;

  const total = await redis.total.get();
  const p = (count) ? await redis.pop.update(schoolCode, count) : null;
  
  let resObj = { token: newToken, total: total };
  if (p) resObj.pop = p;

  res.status(201).json(resObj);
});

module.exports = router;