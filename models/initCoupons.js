const mongoose = require("mongoose");
const Coupon = require("./coupons.js");
require("dotenv").config();
const DB_URL = process.env.DATABASE_URL;
const coupons = [
  {
    assigned: false,
    code: "WELCOME20",
    title: "Welcome Offer",
    description: "Get 20% off on your first purchase. Start shopping now!",
    image: "20-percent-off.jpg",
  },
  {
    assigned: false,
    code: "FREESHIP",
    title: "Free Shipping",
    description:
      "Get free shipping on your order with this special coupon code.",
    image: "free-shipping.jpg",
  },
  {
    assigned: false,
    code: "DISCOUNT10",
    title: "Flat Discount",
    description:
      "Get 10% off on any one of your purchase. Limited time, hurry !",
    image: "10-percent-discount.png",
  },
  {
    assigned: false,
    code: "FESTIVE25",
    title: "Festive Offer",
    description:
      "Celebrate with us! Enjoy a 25% discount on all festive collections.",
    image: "25-percent-off.jpg",
  },
  {
    assigned: false,
    code: "REFER50",
    title: "Refer and save",
    description:
      "Refer a friend and both of you get ₹50 off on your next order!",
    image: "rs-50-off.jpeg",
  },
];

const initCoupons = async () => {
  await mongoose.connect(DB_URL);
  await Coupon.deleteMany({});
  await Coupon.insertMany(coupons);
  console.log("Data was initialised");
  const allCoupons = await Coupon.find({});
  console.log("All Coupons : \n" + allCoupons);
};

initCoupons();
