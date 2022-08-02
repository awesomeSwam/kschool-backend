// env
const {
  RANK_WAIT_MS
} = process.env;

// require
const redis = require("../database/redis");

let rankData = [];

const updateRank = async () => {
  const rankList = await redis.rank.get();
  if (rankList === null) {
    console.error("updating rank failed");
    return ;
  }
  
  let rankTemp = [];
  while (rankList.length > 0) {
    const pop = rankList.pop();
    const schoolCode = rankList.pop();
    const rawSchoolData = await redis.school.get(schoolCode);
    const schoolData = JSON.parse(rawSchoolData);
    rankTemp.push( {
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
        console.log(new Date());
        await updateRank();
      }, RANK_WAIT_MS
    );
  }
}

module.exports = rank;