// env
require("dotenv");
const {
  REDIS_PORT, REDIS_HOST, REDIS_PASSWORD, CACHE_NAMESPACE_TOTAL, CACHE_NAMESPACE_SCHOOL,CACHE_NAMESPACE_POP, QUEUE_NAMESPACE_SCHOOL, QUEUE_NAMESPACE_POP
} = process.env;

// Redis
const redis = require("ioredis");
const redisClient = redis.createClient({
  port      : REDIS_PORT,
  host      : REDIS_HOST,
  password  : REDIS_PASSWORD,
});

redisClient.on("connect", () => {
  console.log("redisClient connected!");
});

redisClient.on("reconnecting", () => {
  console.log("redisClient reconnecting");
});

redisClient.on('ready', () => {
  console.log("redisClient ready");
});

redisClient.on("error", (err) => {
  console.log("redisClient error");
  console.log(err);
});

// redisClient.connect();


const pop = {
  update: async (schoolCode, count, push = true) => {
    const d = await new Promise((resolve) => {
      redisClient.zincrby(CACHE_NAMESPACE_POP, count, schoolCode, (err, data) => {
        if (err) console.error(`Redis pop update error\n>>> ${err}`);
        resolve(err ? -1 : data);
      });
    });
    
    if (d !== -1 && push) {
      queue.push(QUEUE_NAMESPACE_POP, `${schoolCode}:${count}`);
      total.update(count);
    }
    
    return d;
  },
  getScore: async (schoolCode) => {
    return await new Promise((resolve) => {
      redisClient.zscore(CACHE_NAMESPACE_POP, schoolCode, (err, data) => {
        if (err) console.error(`Redis pop get error\n>>> ${err}`);
        resolve (err ? -1 : data);
      });
    });
  },
  getIndex: async (schoolCode) => {
    return await new Promise((resolve) => {
      redisClient.zrevrank(CACHE_NAMESPACE_POP, schoolCode, (err, data) => {
        if (err) console.error(`Redis pop getIndex error\n>>> ${err}`);
        resolve(err ? -1 : parseInt(data) + 1);
      });
    });
  }
};


const school = {
  get: async (schoolCode) => {
    return await new Promise((resolve) => {
      redisClient.get(`${CACHE_NAMESPACE_SCHOOL}:${schoolCode}`, (err, data) => {
        if (err) console.error(`Redis school get error\n>>> ${err}`);
        resolve(err ? null : data);
      })
    });
  },
  set: (schoolCode, schoolData, push = true) => {
    schoolJSON = JSON.stringify(schoolData);
    redisClient.set(`${CACHE_NAMESPACE_SCHOOL}:${schoolCode}`, schoolJSON, (err, data) => {
      if (err) {
        console.error(`Redis school set error\n>>> ${err}`);
        return;
      }
      if (push)
        queue.push(QUEUE_NAMESPACE_SCHOOL, schoolJSON);
    });
  }
};


const queue = {
  push: (queueNamespace, pushData) => {
    redisClient.rpush(queueNamespace, pushData, (err, data) => {
      if (err) console.error(`Redis queue push error\n>>> ${err}`);
    });
  },
  get: async (k) => {
    const { KEY, STRING } = (k === "school") ?
      { KEY: QUEUE_NAMESPACE_SCHOOL, STRING: "getSchool" } :
      { KEY: QUEUE_NAMESPACE_POP, STRING: "getPop" };
    
    const data = await new Promise((resolve) => {
      redisClient.lrange(KEY, 0, -1, async (err, data) => {
        if (err)
          console.error(`Mysql queue ${STRING} error\n>>> ${err}`);
        
        resolve(err ? null : data);
      });
    });
  
    if (data !== null) {
      redisClient.del(KEY, (err, data) => {
        if (err)
          console.error(`Mysql queue ${STRING} (del) error\n>>> ${err}`);
      });
    }
  
    return data; 
  }
}


const total = {
  get: async () => {
    return await new Promise((resolve) => {
      redisClient.get(CACHE_NAMESPACE_TOTAL, (err, data) => {
        if (err) console.error(`Redis total get error\n>>> ${err}`);
        resolve(err ? null : data);
      })
    });
  },
  set: (pop) => {
    redisClient.set(CACHE_NAMESPACE_TOTAL, String(pop), (err, data) => {
      if (err) {
        console.error(`Redis total set error\n>>> ${err}`);
        return;
      }
    });
  },
  update: async (pop) => {
    const d = await total.get();
    if (d === null) return ;
    total.set(Number(d) + pop);
  }
}


const rank = {
  get: async () => {
    return await new Promise((resolve) => {
      redisClient.zrange(CACHE_NAMESPACE_POP, 0, -1, "withscores", (err, data) => {
        if (err) console.error(`Redis getLeaderboard error\n>>> ${err}`);
        resolve(err ? null : data);
      })
    });
  } 
}


const flush = {
  all: async () => {
    await redisClient.flushall();
  }
}


const _redis = {
  pop, school, queue, total, flush, rank
};

module.exports = _redis;