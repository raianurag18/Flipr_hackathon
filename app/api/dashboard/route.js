import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';
import Category from '../../../models/Category';
import InventoryMovement from '../../../models/InventoryMovement';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get basic stats
    const totalProducts = await Product.countDocuments({ status: 'active' });
    
    const lowStockProducts = await Product.countDocuments({
      status: 'active',
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    });

    const outOfStockProducts = await Product.countDocuments({
      status: 'active',
      currentStock: 0
    });

    // Calculate total inventory value
    const totalValueResult = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ['$currentStock', '$price'] }
          }
        }
      }
    ]);

    const totalValue = totalValueResult[0]?.totalValue || 0;

    // Get recent movements (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMovements = await InventoryMovement.countDocuments({
      timestamp: { $gte: sevenDaysAgo }
    });

    // Get recent activity
    const recentActivity = await InventoryMovement.find()
      .populate('productId', 'name sku')
      .populate('userId', 'name')
      .sort({ timestamp: -1 })
      .limit(10);

    // Get low stock alerts
    const lowStockItems = await Product.find({
      status: 'active',
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    })
    .populate('category', 'name')
    .sort({ currentStock: 1 })
    .limit(10);

    // Get top products by value
    const topProducts = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $addFields: {
          totalValue: { $multiply: ['$currentStock', '$price'] }
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      }
    ]);

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$currentStock', '$price'] } }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $project: {
          name: { $arrayElemAt: ['$categoryInfo.name', 0] },
          color: { $arrayElemAt: ['$categoryInfo.color', 0] },
          count: 1,
          totalValue: 1
        }
      }
    ]);

    return NextResponse.json({
      stats: {
        totalProducts,
        totalValue,
        lowStockItems: lowStockProducts,
        outOfStock: outOfStockProducts,
        recentMovements
      },
      recentActivity,
      lowStockItems,
      topProducts,
      categoryDistribution,
      alerts: [
        {
          type: 'critical',
          title: 'Out of Stock',
          message: `${outOfStockProducts} products are completely out of stock`,
          count: outOfStockProducts,
          color: 'red'
        },
        {
          type: 'warning',
          title: 'Low Stock',
          message: `${lowStockProducts} products are running low on inventory`,
          count: lowStockProducts,
          color: 'yellow'
        },
        {
          type: 'info',
          title: 'Recent Activity',
          message: `${recentMovements} inventory movements in the last 7 days`,
          count: recentMovements,
          color: 'blue'
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}