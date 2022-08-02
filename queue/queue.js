// env
require("dotenv").config();
const { QUEUE_WAIT_MS } = process.env;

// require
const redis = require("../database/redis");
const mysql = require("../database/mysql");


// Main
const queue = () => {
  setInterval(
    async () => {
      console.log(new Date());
      await task();
    }, QUEUE_WAIT_MS
  );
}


// Task
const task = async () => {
  const schoolDatas = await redis.queue.get("school");
  if (schoolDatas === null) return ;
  for (const rawSchool of schoolDatas) {
    const school = JSON.parse(rawSchool);
    mysql.school.update(school);
  }


  const popDatas = await redis.queue.get("pop");
  if (popDatas === null) return ;

  let d = {};
  for (const rawPop of popDatas) {
    const [schoolCode, pop] = rawPop.split(":");
    if (d[schoolCode] === undefined)
      d[schoolCode] = 0;
    d[schoolCode] += Number(pop);
  }
  for (const schoolCodeKey in d) {
    mysql.pop.update(schoolCodeKey, d[schoolCodeKey]);
  }
}

module.exports = queue;