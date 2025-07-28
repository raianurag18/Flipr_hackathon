import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';
import Category from '../../../models/Category';
import User from '../../../models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    await dbConnect();

    const searchRegex = new RegExp(query, 'i');
    const results = [];

    // Search Products
    const products = await Product.find({
      status: 'active',
      $or: [
        { name: searchRegex },
        { sku: searchRegex },
        { description: searchRegex }
      ]
    })
    .populate('category', 'name color')
    .limit(limit)
    .lean();

    products.forEach(product => {
      results.push({
        id: product._id.toString(),
        type: 'product',
        title: product.name,
        subtitle: `SKU: ${product.sku}`,
        description: product.description?.substring(0, 100) + (product.description?.length > 100 ? '...' : ''),
        category: product.category?.name || 'Uncategorized',
        categoryColor: product.category?.color || '#6B7280',
        price: product.price,
        stock: product.currentStock,
        image: product.image || null
      });
    });

    // Search Categories
    const categories = await Category.find({
      name: searchRegex,
      isActive: true
    })
    .limit(Math.floor(limit / 2))
    .lean();

    categories.forEach(category => {
      results.push({
        id: category._id.toString(),
        type: 'category',
        title: category.name,
        subtitle: 'Category',
        description: category.description || 'Product category',
        color: category.color || '#6B7280',
        icon: category.icon || '📦'
      });
    });

    // Search Users (Admin only)
    if (session.user.role === 'admin') {
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ],
        isActive: true
      })
      .select('name email role department')
      .limit(Math.floor(limit / 4))
      .lean();

      users.forEach(user => {
        results.push({
          id: user._id.toString(),
          type: 'user',
          title: user.name,
          subtitle: user.email,
          description: `${user.role} - ${user.department || 'N/A'}`,
          role: user.role
        });
      });
    }

    // Sort results by relevance (exact matches first)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(query.toLowerCase());
      const bExact = b.title.toLowerCase().includes(query.toLowerCase());
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return NextResponse.json({
      query,
      results: results.slice(0, limit),
      total: results.length
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { message: 'Search failed', error: error.message },
      { status: 500 }
    );
  }
}