require("dotenv").config();

// express
const express = require("express");
const app = express();

// cors
const cors = require("cors");
const { SITE_DOMAIN } = process.env;
const corsOptions = {
  origin: SITE_DOMAIN,
  credentials: true
};

// express-ip
const expressip = require("expres-ip");

// app settings
app.use(expressip().getIpInfoMiddleware());
app.use(cors(corsOptions));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

// limiter
const rateLimit = require("express-rate-limit");
const { POP_LIMITER_WINDOWMS, POP_LIMITER_MAX, LEADERBOARD_LIMITER_WINDOWMS, LEADERBOARD_LIMITER_MAX } = process.env;
const popLimiter = rateLimit({
  windowMs: POP_LIMITER_WINDOWMS,
  max: POP_LIMITER_MAX
});

const leaderboardLimiter = rateLimit({
  windowMs: LEADERBOARD_LIMITER_WINDOWMS,
  max: LEADERBOARD_LIMITER_MAX
});


// Routers
const leaderboardRouter = require("./router/leaderboard");
const popRouter = require("./router/pop");
app.use("/leaderboard", leaderboardLimiter, leaderboardRouter);
app.use("/pop", popLimiter, popRouter);

// listen PORT
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}!`);
});


const prepareCache = require("./cache/prepareCache");
const queue = require("./queue/queue");
const rank = require("./rank/rank");
prepareCache().then(() => {
  queue();
  rank.main();
});