import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      default: 'homeowner',
    },
    city: {
      type: String,
      default: 'Nationwide',
    },
  },
  {
    timestamps: true,
  }
);

const Waitlist = mongoose.model('Waitlist', waitlistSchema);
export default Waitlist;
