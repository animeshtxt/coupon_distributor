const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const DB_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT;
const TIME = process.env.TIME;

app.use(express.static(path.join(__dirname, "/public")));
app.get("*", (req, res) => res.sendFile(__dirname + "/public/index.html"));
app.use(cookieParser());

const { checkIpAbuse } = require("./middlewares/ipTracking.middleware.js");
const Coupon = require("./models/coupons.js");
const CouponClaim = require("./models/couponClaims.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", true); // Trust reverse proxy

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Allow requests from React frontend
    credentials: true, // Allow cookies & headers
  })
);

app.post(
  "/api/claim",
  checkIpAbuse,

  async (req, res) => {
    try {
      let coupon = await Coupon.findOneAndUpdate(
        { assigned: false },
        { assigned: true },
        { new: true, sort: { _id: 1 } }
      );

      if (!coupon) {
        await Coupon.updateMany({}, { assigned: false });
        coupon = await Coupon.findOneAndUpdate(
          { assigned: false },
          { assigned: true },
          { new: true, sort: { _id: 1 } }
        );
      }

      await CouponClaim.create({
        coupon: coupon._id,
        sessionId: req.sessionId,
        userIp: req.userIp,
        userAgent: req.userAgent,
      });
      console.log("On new coupon claim \nSession ID : " + req.sessionId);
      console.log("userIP : " + req.userIp);
      console.log("User Agent : " + req.userAgent);
      res.json({
        success: true,
        coupon: coupon,
        timeLeft: req.timeLeft,
        message: "You can claim your next coupon in ",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

app.post("/api/check", checkIpAbuse, (req, res) => {
  res.json({ coupon: null, timeLeft: 0 });
});

app.get("/", (req, res) => {
  res.redirect("/api/home");
});

app.get(
  "/api/home",
  checkIpAbuse,

  (req, res) => {
    res.render("home.ejs", {
      coupon: null,
      message: req.abuseMessage,
      timeLeft: req.timeLeft,
    });
  }
);

const start = async () => {
  const connnetionDB = await mongoose.connect(DB_URL);
  console.log("Connected to DB");
  app.listen(PORT, () => {
    console.log("App listening to PORT " + PORT);
  });
};

start();
