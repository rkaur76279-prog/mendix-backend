import mongoose from 'mongoose';

const VALID_INQUIRY_TYPES = [
  'Booking Support',
  'Service Information',
  'Booking Cancellation',
  'Rescheduling Request',
  'Payment or Refund Issue',
  'Account Support',
  'Feedback and Suggestions',
  'Other',
];

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      maxlength: [120, 'Email cannot exceed 120 characters'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [25, 'Phone number cannot exceed 25 characters'],
    },
    inquiryType: {
      type: String,
      required: [true, 'Inquiry type is required'],
      enum: {
        values: VALID_INQUIRY_TYPES,
        message: '{VALUE} is not a valid inquiry type',
      },
      default: 'Booking Support',
    },
    bookingId: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Booking ID cannot exceed 50 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [3, 'Subject must be at least 3 characters'],
      maxlength: [150, 'Subject cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

contactSchema.index({ createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
