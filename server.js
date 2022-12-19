require("dotenv").config();
const rateLimiter = require("./middleware/rateLimiter.js");

// express
const express = require("express");
const app = express();

// cors
const cors = require("cors");
const { SITE_DOMAIN, POP_LIMITER_WINDOWMS, POP_LIMITER_MAX } = process.env;
const corsOptions = {
  origin: SITE_DOMAIN,
  credentials: true
};

// app settings
app.use(cors(corsOptions));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

// limiter
// const rateLimit = require("express-rate-limit");
// const {
//   FIRST_LIMITER_WINDOWMS, FIRST_LIMITER_MAX, POP_LIMITER_WINDOWMS, POP_LIMITER_MAX,
//   LEADERBOARD_LIMITER_WINDOWMS, LEADERBOARD_LIMITER_MAX, SCHOOL_LIMITER_WINDOWMS, SCHOOL_LIMITER_MAX
// } = process.env;

// const firstLimiter = rateLimit({
//   windowMs: FIRST_LIMITER_WINDOWMS,
//   max: FIRST_LIMITER_MAX
// });

// const popLimiter = rateLimit({
//   windowMs: POP_LIMITER_WINDOWMS,
//   max: POP_LIMITER_MAX
// });

// const leaderboardLimiter = rateLimit({
//   windowMs: LEADERBOARD_LIMITER_WINDOWMS,
//   max: LEADERBOARD_LIMITER_MAX
// });

// const schoolLimiter = rateLimit({
//   windowMs: SCHOOL_LIMITER_WINDOWMS,
//   max: SCHOOL_LIMITER_MAX
// })

// Routers
const firstRouter = require("./router/first");
const leaderboardRouter = require("./router/leaderboard");
const schoolRouter = require("./router/school");
const popRouter = require("./router/pop");

// app.use("/first", firstLimiter, firstRouter);
// app.use("/leaderboard", leaderboardLimiter, leaderboardRouter);
// app.use("/school", schoolLimiter, schoolRouter );
// app.use("/pop", , popRouter);

app.use("/first", firstRouter);
app.use("/leaderboard", leaderboardRouter);
app.use("/school", schoolRouter);
app.use("/pop", popRouter);
app.use("/pop", rateLimiter( POP_LIMITER_WINDOWMS, POP_LIMITER_MAX ), popRouter);

// app.use("/test", rateLimiter(5, 1), (req, res) => {
//   res.json({ type: "number" });
// });

// listen PORT
const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on ${PORT}!`);
});

// app.listen(PORT, () => {
//   console.log(`Server is running on ${PORT}!`);
// });

const prepareCache = require("./cache/prepareCache");
const queue = require("./queue/queue");
const rank = require("./rank/rank");

prepareCache().then(() => {
  queue();
  rank.main();
});