import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide service name'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide service category'],
      trim: true,
      default: 'General',
    },
    currency: {
      type: String,
      default: 'INR',
    },
    section: {
      type: String,
      enum: ['popular', 'essential', 'directory'],
      default: 'popular',
    },
    tag: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Please provide a short description'],
      trim: true,
    },
    longDescription: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: String,
      default: '$79',
    },
    numericPrice: {
      type: Number,
      required: [true, 'Please provide base numeric price'],
      default: 79,
    },
    duration: {
      type: String,
      default: '1-2 hours',
    },
    image: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#3938AD',
    },
    accentColor: {
      type: String,
      default: '#8BECC0',
    },
    textColor: {
      type: String,
      default: '#FFFFFF',
    },
    badgeBg: {
      type: String,
      default: '#FF795B',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.9,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 120,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before save
serviceSchema.pre('save', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  next();
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;
