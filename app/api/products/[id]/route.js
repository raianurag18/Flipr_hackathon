import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '../../../../lib/mongodb';
import Product from '../../../../models/Product';
import InventoryMovement from '../../../../models/InventoryMovement';

// GET single product
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const product = await Product.findById(params.id)
      .populate('category', 'name color')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Error fetching product' },
      { status: 500 }
    );
  }
}

// UPDATE product
export async function PUT(request, { params }) {
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

    // Check if SKU already exists (excluding current product)
    if (body.sku) {
      const existingProduct = await Product.findOne({ 
        sku: body.sku, 
        _id: { $ne: params.id } 
      });
      if (existingProduct) {
        return NextResponse.json(
          { message: 'Product with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    const product = await Product.findByIdAndUpdate(
      params.id,
      {
        ...body,
        updatedBy: session.user.id,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('category', 'name color');

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Error updating product' },
      { status: 400 }
    );
  }
}

// DELETE product
export async function DELETE(request, context) {
  const id = context.params.id;

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

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Also delete associated inventory movements
    await InventoryMovement.deleteMany({ productId: id });
    
    // Now, delete the product itself
    await Product.findByIdAndDelete(id);
    
    return NextResponse.json({
      message: 'Product and associated movements deleted successfully',
      deleted: true
    });

  } catch (error) {
    console.error('Error in DELETE /api/products/[id]:', error);
    return NextResponse.json(
      { message: 'Error deleting product', error: error.message },
      { status: 500 }
    );
  }
}
