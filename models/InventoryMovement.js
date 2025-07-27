import mongoose from 'mongoose';

const InventoryMovementSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  type: {
    type: String,
    enum: ['in', 'out', 'transfer', 'adjustment'],
    required: [true, 'Movement type is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  previousStock: {
    type: Number,
    required: true,
    min: [0, 'Previous stock cannot be negative']
  },
  newStock: {
    type: Number,
    required: true,
    min: [0, 'New stock cannot be negative']
  },
  reason: {
    type: String,
    enum: [
      'purchase',
      'sale',
      'return',
      'damaged',
      'expired',
      'theft',
      'count_adjustment',
      'transfer_in',
      'transfer_out',
      'production',
      'consumption',
      'other'
    ]
  },
  reference: {
    type: String,
    trim: true,
    maxlength: [100, 'Reference cannot exceed 100 characters']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  location: {
    from: String,
    to: String,
    warehouse: String,
    zone: String,
    shelf: String
  },
  batchNumber: String,
  serialNumbers: [String],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  cost: {
    unitCost: Number,
    totalCost: Number,
    currency: { type: String, default: 'USD' }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: { type: String, default: 'web' }
  }
});

// Indexes for efficient queries
InventoryMovementSchema.index({ productId: 1, timestamp: -1 });
InventoryMovementSchema.index({ userId: 1, timestamp: -1 });
InventoryMovementSchema.index({ type: 1, timestamp: -1 });
InventoryMovementSchema.index({ timestamp: -1 });

// Calculate total cost before saving
InventoryMovementSchema.pre('save', function(next) {
  if (this.cost && this.cost.unitCost) {
    this.cost.totalCost = this.cost.unitCost * this.quantity;
  }
  next();
});

export default mongoose.models.InventoryMovement || 
  mongoose.model('InventoryMovement', InventoryMovementSchema);