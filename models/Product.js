import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  sku: { 
    type: String, 
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z0-9-]+$/, 'SKU can only contain letters, numbers, and hyphens']
  },
  barcode: String,
  category: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subCategory: String,
  brand: String,
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  costPrice: { 
    type: Number, 
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  currentStock: { 
    type: Number, 
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  minimumStock: { 
    type: Number, 
    default: 10,
    min: [0, 'Minimum stock cannot be negative']
  },
  maximumStock: { 
    type: Number, 
    default: 1000,
    min: [1, 'Maximum stock must be at least 1']
  },
  reorderPoint: Number,
  reorderQuantity: Number,
  supplier: {
    name: String,
    contactEmail: String,
    contactPhone: String,
    address: String
  },
  location: {
    warehouse: String,
    zone: String,
    shelf: String,
    bin: String
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: { type: String, default: 'cm' }
  },
  images: [String],
  tags: [String],
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'discontinued'], 
    default: 'active' 
  },
  taxRate: { type: Number, default: 0 },
  isPerishable: { type: Boolean, default: false },
  expiryDate: Date,
  batchNumber: String,
  serialNumbers: [String],
  lastRestocked: Date,
  lastSold: Date,
  totalSold: { type: Number, default: 0 },
  averageMonthlySales: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound indexes for efficient queries
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ currentStock: 1, minimumStock: 1 });
ProductSchema.index({ name: 'text', description: 'text', sku: 'text' });

// Validation
ProductSchema.pre('save', function(next) {
  if (this.minimumStock >= this.maximumStock) {
    next(new Error('Minimum stock must be less than maximum stock'));
  }
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);