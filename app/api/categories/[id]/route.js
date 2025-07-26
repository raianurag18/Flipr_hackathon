import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '../../../../lib/mongodb';
import Category from '../../../../models/Category';
import Product from '../../../../models/Product';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = session.user.role === 'admin' || 
      session.user.permissions?.includes('manage_categories');
    
    if (!hasPermission) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = params;
    const body = await request.json();

    // Check if another category with same name exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${body.name}$`, 'i') },
      _id: { $ne: id }
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { message: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { message: 'Error updating category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = session.user.role === 'admin' || 
      session.user.permissions?.includes('manage_categories');
    
    if (!hasPermission) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = params;

    // Check if category has products
    const productCount = await Product.countDocuments({ 
      category: id, 
      status: 'active' 
    });

    if (productCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete category. It has ${productCount} products assigned to it.` },
        { status: 400 }
      );
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { message: 'Error deleting category' },
      { status: 500 }
    );
  }
}