import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '../../../../lib/mongodb';
import Product from '../../../../models/Product';
import InventoryMovement from '../../../../models/InventoryMovement';
import checkStockLevels from '../../../../lib/stockAlerter';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = session.user.role === 'admin' || 
      session.user.permissions?.includes('manage_inventory');
    
    if (!hasPermission) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();
    const { productId, type, quantity, reason, reference, notes, location } = body;

    // Validate input
    if (!productId || !type || !quantity) {
      return NextResponse.json(
        { message: 'Product ID, type, and quantity are required' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const previousStock = product.currentStock;
    let newStock;

    // Calculate new stock based on movement type
    switch (type) {
      case 'in':
        newStock = previousStock + parseInt(quantity);
        break;
      case 'out':
        newStock = Math.max(0, previousStock - parseInt(quantity));
        if (previousStock < parseInt(quantity)) {
          return NextResponse.json(
            { message: 'Insufficient stock for this operation' },
            { status: 400 }
          );
        }
        break;
      case 'adjustment':
        newStock = parseInt(quantity);
        break;
      case 'transfer':
        newStock = Math.max(0, previousStock - parseInt(quantity));
        break;
      default:
        return NextResponse.json(
          { message: 'Invalid movement type' },
          { status: 400 }
        );
    }

    // Create movement record
    const movement = new InventoryMovement({
      productId,
      type,
      quantity: parseInt(quantity),
      previousStock,
      newStock,
      reason,
      reference,
      notes,
      location,
      userId: session.user.id
    });

    await movement.save();

    // Prepare update object for product
    const updateData = {
      currentStock: newStock,
      updatedBy: session.user.id,
      updatedAt: new Date()
    };

    // Add specific updates based on movement type
    if (type === 'in') {
      updateData.lastRestocked = new Date();
    } else if (type === 'out') {
      // Update totalSold and lastSold for outbound movements (sales)
      updateData.totalSold = (product.totalSold || 0) + parseInt(quantity);
      updateData.lastSold = new Date();
    }

    // Update product with all the changes
    await Product.findByIdAndUpdate(productId, updateData);

    // Populate the movement for response
    await movement.populate([
      { path: 'productId', select: 'name sku' },
      { path: 'userId', select: 'name' }
    ]);

    // Check stock levels and send alerts if necessary
    await checkStockLevels();

    return NextResponse.json({
      message: 'Stock updated successfully',
      movement,
      newStock,
      totalSold: updateData.totalSold // Include totalSold in response
    });
  } catch (error) {
    console.error('Error in POST /api/inventory/movement:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;

    let query = {};
    if (productId) {
      query.productId = productId;
    }

    const skip = (page - 1) * limit;

    const movements = await InventoryMovement.find(query)
      .populate('productId', 'name sku')
      .populate('userId', 'name')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InventoryMovement.countDocuments(query);

    return NextResponse.json({
      movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching movements:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}