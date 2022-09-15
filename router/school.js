const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

const KEY = process.env.NEIS_API_KEY;
const INDEX_MAX = process.env.SCHOOL_INDEX_MAX;


router.get("/", async (req, res) => {
  let { schoolName } = req.query;
  
  schoolName ||= "";

  try {
    const URL = encodeURI(`https://open.neis.go.kr/hub/schoolInfo?Type=json&pIndex=1&pSize=${INDEX_MAX}&KEY=${KEY}&SCHUL_NM=${schoolName}`);
    const { data } = await axios.get(URL);
    
    res.status(200).json({ data });
  } catch(err) {
    console.log(err);
    res.status(500).json({ data: null });
  }
});

module.exports = router;