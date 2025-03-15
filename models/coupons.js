const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: String,
  assigned: Boolean,
  title: String,
  description: String,
  image: {
    type: String,
    default: "https://unsplash.com/photos/text-hGLc8L-EcCM",
  },
});
const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
