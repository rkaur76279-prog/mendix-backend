import mongoose from 'mongoose';

const serviceItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  subcategoryId: { type: String },
  price: { type: Number, required: true },
  duration: { type: String, default: '30-45 mins' },
  rating: { type: Number, default: 4.9 },
  reviewsCount: { type: Number, default: 120 },
  image: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  fullDescription: { type: String, default: '' },
  included: [{ type: String }],
  notIncluded: [{ type: String }],
  keywords: [{ type: String }]
}, { _id: false });

const subcategorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  services: [serviceItemSchema]
}, { _id: false });

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  startingPrice: { type: Number, default: 249 },
  startingPriceDisplay: { type: String, default: '₹249' },
  rating: { type: Number, default: 4.9 },
  reviewsCount: { type: Number, default: 500 },
  icon: { type: String, default: 'Zap' },
  badge: { type: String, default: '' },
  image: { type: String, default: '' },
  subcategories: [subcategorySchema]
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
