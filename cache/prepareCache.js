const mysql = require("../database/mysql");
const redis = require("../database/redis");

const prepareCache = async () => {
  const schoolList = await mysql.school.getAll();
  const popList = await mysql.pop.getAll();

  if (schoolList === null || popList === null) {
    console.error("prepareCache failed");
    return ;
  }
  
  await redis.flush.all();

  for (const s of schoolList) {
    redis.school.set(s.schoolCode, s, false);
  }

  let sumPop = 0;
  for (const p of popList) {
    sumPop += p.pop;
    redis.pop.update(p.schoolCode, p.pop, false);
  }

  redis.total.set(sumPop);
}

module.exports = prepareCache;