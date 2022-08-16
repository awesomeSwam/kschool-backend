// env
const {
  RANK_WAIT_MS, RANK_MAX
} = process.env;

// require
const redis = require("../database/redis");

let rankData = [];

const updateRank = async () => {
  const rankList = await redis.rank.get(RANK_MAX);
  if (rankList === null) {
    console.error("updating rank failed");
    return ;
  }
  
  let rankTemp = [];
  const len = rankList.length / 2;
  for (let i = 1; i <= len; i++) {
    const pop = rankList.pop();
    const schoolCode = rankList.pop();
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
  get: () => rankData,
  main: () => {
    setInterval(
      async () => {
        // console.log(new Date());
        await updateRank();
      }, RANK_WAIT_MS
    );
  }
}

module.exports = rank;