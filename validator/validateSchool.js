// env
require("dotenv").config();
const KEY = process.env.NEIS_API_KEY;

// validateSchool
const redis = require("../database/redis");
const axios = require("axios");

const checkSchoolCode = (c) => {
  const n = Number(c);
  return (Number.isInteger(n) && n > 0 && c === String(n));
}

const fetchSchoolFromNeis = async (schoolCode) => {
  try {
    const URL = encodeURI(`https://open.neis.go.kr/hub/schoolInfo?Type=json&SD_SCHUL_CODE=${schoolCode}&key=${KEY}`);
    const { data } = await axios.get(URL);
    if (data.schoolInfo) {
      const {
        ATPT_OFCDC_SC_CODE: cityProvince,
        SD_SCHUL_CODE: schoolCode,
        SCHUL_NM: schoolName,
        ORG_RDNMA: address
      } = data.schoolInfo[1].row[0];
    
      return { cityProvince, schoolCode, schoolName, address };
    }
    
    return null;
  } catch(err) {
    console.log(`Failed Request to Neis >> schoolCode : ${schoolCode}`);
    console.log(err);
    return null;  
  }
}

const validateSchool = async (schoolCode) => {
  
  if (!checkSchoolCode(schoolCode)) return false;

  const schoolDataFromRedis = await redis.school.get(schoolCode);
  if (schoolDataFromRedis !== null) return true;

  const schoolData = await fetchSchoolFromNeis(schoolCode);
  if (schoolData === null) return false;

  redis.school.set(schoolCode, schoolData);

  return true;
}

module.exports = validateSchool;