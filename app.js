const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const DB_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT;
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const { checkAbuse } = require("./middlewares/ipTracking.middleware.js");
// const { checkAbuse } = require("./middlewares/ipTracking.middleware.js");
const Coupon = require("./models/coupons.js");
const { timeLog } = require("console");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from React frontend
    credentials: true, // Allow cookies & headers
  })
);

app.use(express.static(path.join(__dirname, "/public")));
app.use(cookieParser());

app.post("/api/claim", checkAbuse, async (req, res) => {
  try {
    let coupon = await Coupon.findOneAndUpdate(
      { assigned: false },
      { assigned: true },
      { new: true, sort: { _id: 1 } }
    );
    console.log("Updated coupon : " + coupon);
    const allCoupon = await Coupon.find({});
    console.log("All coupons : \n");
    for (c of allCoupon) {
      console.log(c);
    }
    if (!coupon) {
      await Coupon.updateMany({}, { assigned: false });
      coupon = await Coupon.findOneAndUpdate(
        { assigned: false },
        { assigned: true },
        { new: true, sort: { _id: 1 } }
      );
      // return res.status(400).json({ message: "All coupons used. Resetting." });
    }

    // Save IP and session in Redis (Expire in 1 hour)
    await fetch(
      `${UPSTASH_REDIS_REST_URL}/set/${req.userIP}/true?_token=${UPSTASH_REDIS_REST_TOKEN}&EX=20`
    );
    await fetch(
      `${UPSTASH_REDIS_REST_URL}/set/${req.userSession}/true?_token=${UPSTASH_REDIS_REST_TOKEN}&EX=20`
    );

    res.json({ success: true, coupon: coupon.code, timeLeft: req.timeLeft });
    // res.render("home.ejs", {
    //   coupon,
    //   abuseMessage: req.abuseMessage,
    //   timeLeft: req.timeLeft,
    // });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/", (req, res) => {
  res.redirect("/api/home");
});

app.get("/api/home", checkAbuse, (req, res) => {
  res.render("home.ejs", {
    coupon: null,
    abuseMessage: req.abuseMessage,
    timeLeft: req.timeLeft,
  });
});

const start = async () => {
  const connnetionDB = await mongoose.connect(DB_URL);
  console.log("Connected to DB");
  app.listen(PORT, () => {
    console.log("App listening to PORT " + PORT);
  });
};

start();
