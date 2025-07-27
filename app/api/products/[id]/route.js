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
export async function DELETE(request, { params }) {
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
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Check if product has any inventory movements
    const hasMovements = await InventoryMovement.findOne({ productId: params.id });
    
    if (hasMovements) {
      // If product has movements, don't delete - just mark as discontinued
      await Product.findByIdAndUpdate(params.id, {
        status: 'discontinued',
        updatedBy: session.user.id,
        updatedAt: new Date()
      });
      
      return NextResponse.json({
        message: 'Product marked as discontinued (has inventory history)',
        discontinued: true
      });
    } else {
      // If no movements, safe to delete completely
      await Product.findByIdAndDelete(params.id);
      
      return NextResponse.json({
        message: 'Product deleted successfully',
        deleted: true
      });
    }

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Error deleting product' },
      { status: 500 }
    );
  }
}