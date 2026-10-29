import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Discount type must be percentage or fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Please provide discount value'],
      min: [1, 'Discount value must be at least 1'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: null, // Optional cap for percentage discounts
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expirationDate: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    usageLimit: {
      type: Number,
      default: 1000,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate discount for an order amount
couponSchema.methods.calculateDiscount = function (orderAmount) {
  const now = new Date();
  if (!this.isActive) {
    throw new Error('This coupon is currently inactive');
  }
  if (now > this.expirationDate) {
    throw new Error('This coupon has expired');
  }
  if (now < this.startDate) {
    throw new Error('This coupon is not yet active');
  }
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    throw new Error('This coupon usage limit has been reached');
  }
  if (orderAmount < this.minOrderValue) {
    throw new Error(`Minimum order value of $${this.minOrderValue} required for this coupon`);
  }

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discountValue;
  }

  return Math.min(discount, orderAmount);
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
