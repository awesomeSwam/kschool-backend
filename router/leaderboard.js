// require
const rank = require("../rank/rank");

// Router
const express = require("express");
const router = express.Router();
router.get("/", async (req, res) => {
  return res.status(200).json({
    rank: rank.getRank(),
    length: rank.getLength()
  });
});

module.exports = router;