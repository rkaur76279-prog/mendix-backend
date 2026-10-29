import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
      default: () => `MDX-${Math.floor(100000 + Math.random() * 900000)}`,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for guest checkout, auto-linked if user is logged in
    },
    customerInfo: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Customer email is required'],
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: [true, 'Customer phone is required'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Service address is required'],
        trim: true,
      },
      city: {
        type: String,
        trim: true,
        default: 'Chicago, IL',
      },
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: false,
    },
    serviceTitle: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    bookingDate: {
      type: String,
      required: [true, 'Booking date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      default: '09:00 AM - 11:00 AM',
    },
    proTier: {
      type: String,
      enum: ['Standard Certified', 'Master Specialist', 'Elite Craftsman'],
      default: 'Master Specialist',
    },
    customerInstructions: {
      type: String,
      trim: true,
      default: '',
    },
    priceBreakdown: {
      basePrice: {
        type: Number,
        required: true,
        default: 79,
      },
      tierSurcharge: {
        type: Number,
        default: 15,
      },
      discount: {
        type: Number,
        default: 0,
      },
      couponCode: {
        type: String,
        default: '',
      },
      total: {
        type: Number,
        required: true,
        default: 94,
      },
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'cash_on_arrival', 'online'],
      default: 'online',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    rejections: [
      {
        worker: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        workerName: {
          type: String,
          default: '',
        },
        reason: {
          type: String,
          default: '',
        },
        rejectedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
