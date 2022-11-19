// env
const {
  RANK_WAIT_MS, RANK_MAX
} = process.env;

// require
const redis = require("../database/redis");

let rankData = [];
let lengthData = 0;

const updateLength = async () => {
  const length = await redis.school.length();
  if (length == null) {
    console.error("updating rank length failed");
    return ;
  }

  lengthData = length;
}

const updateRank = async () => {
  const rankList = await redis.rank.get(RANK_MAX);
  if (rankList === null) {
    console.error("updating rank failed");
    return ;
  }
  
  let rankTemp = [];
  const len = rankList.length / 2;
  for (let i = 1; i <= len; i++) {
    const schoolCode = rankList.pop();
    const pop = rankList.pop();
    const rawSchoolData = await redis.school.get(schoolCode);
    const schoolData = JSON.parse(rawSchoolData);
    rankTemp.push( {
      schoolRank: i,
      schoolName: (rawSchoolData === null) ? "null" : schoolData.schoolName,
      schoolCode: schoolCode, pop: pop
    });
  }
  rankData = rankTemp;
}

const rank = {
  getRank: () => rankData,
  getLength: () => lengthData,
  main: () => {
    setInterval(
      async () => {
        // console.log(new Date());
        await updateRank();
        await updateLength();
      }, RANK_WAIT_MS
    );
  }
}

module.exports = rank;