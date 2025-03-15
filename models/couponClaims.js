const mongoose = require("mongoose");
const TIME = process.env.TIME;
const couponClaimSchema = new mongoose.Schema({
  coupon: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User collection
    ref: "Coupon",
  },
  sessionId: { type: String },
  userIp: { type: String, required: true },
  userAgent: { type: String, required: true },
  claimedAt: { type: Date, default: Date.now, expires: TIME },
});
const CouponClaim = mongoose.model("CouponClaim", couponClaimSchema);

module.exports = CouponClaim;
