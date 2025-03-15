const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");
const Coupon = require("../models/coupons.js");
const CouponClaim = require("../models/couponClaims.js");
require("dotenv").config();
const TIME = process.env.TIME;
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

module.exports.checkIpAbuse = async (req, res, next) => {
  try {
    let sessionId = req.cookies.session_id; // Get session from cookie

    if (!sessionId) {
      sessionId = uuidv4(); // Generate a new session if not set
      res.cookie("session_id", sessionId, {
        httpOnly: true,
        maxAge: TIME,
        sameSite: "Strict",
      });
    }

    const userIp = req.ip;
    const userAgent = req.headers["user-agent"];

    // Check MongoDB if user has claimed a coupon in the last hour
    const existingClaim = await CouponClaim.findOne({
      $or: [{ sessionId }, { userIp }],
      claimedAt: { $gte: new Date(Date.now() - TIME * 1000) },
    }).populate("coupon");

    if (existingClaim) {
      console.log("Existing Claim:", existingClaim);
      // console.log("Date now : " + Date.now());
      const timeLeft = Math.max(
        0,
        Math.ceil(
          (existingClaim.claimedAt.getTime() +
            TIME * 1000 +
            1000 -
            Date.now()) /
            1000
        )
      );
      // console.log("Time left from checkAbuse = " + timeLeft);
      return res.json({
        success: false,
        message: `You have already claimed a coupon. Please wait `,
        timeLeft: timeLeft,
        coupon: existingClaim.coupon,
      });
    }
    req.sessionId = sessionId;
    req.userIp = userIp;
    req.userAgent = userAgent;
    req.timeLeft = TIME;

    next();
  } catch (err) {
    console.log(err);
  }
};
