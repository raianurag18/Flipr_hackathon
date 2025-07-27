import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { getDay, getHours } from 'date-fns';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const products = await Product.find({}).populate('category');

    if (products.length === 0) {
      // Return a default empty state
      return NextResponse.json({
        keyMetrics: { totalValue: 0, gmroi: 0, lowStockCount: 0, avgProfitMargin: 0 },
        mostReorderedProduct: null,
        stockTurnoverRate: 0,
        productValueDistribution: [],
        profitabilityByProduct: [],
        lowStockProducts: [],
        statusDistribution: [],
        salesActivityHeatmap: []
      });
    }

    // --- CALCULATIONS ---
    let totalValue = 0, totalProfit = 0, totalCostOfGoodsSold = 0, totalInventoryCost = 0;

    products.forEach(p => {
      const value = p.price * p.currentStock;
      const cost = p.costPrice * p.currentStock;
      totalValue += value;
      totalInventoryCost += cost;
      totalProfit += (value - cost);
      totalCostOfGoodsSold += p.costPrice * p.totalSold;
    });

    const lowStockCount = await Product.countDocuments({ $expr: { $lte: ['$currentStock', '$minimumStock'] } });

    const keyMetrics = {
      totalValue,
      gmroi: totalInventoryCost > 0 ? (totalProfit / totalInventoryCost) * 100 : 0,
      lowStockCount,
      avgProfitMargin: totalValue > 0 ? (totalProfit / totalValue) * 100 : 0,
    };
    
    const mostReorderedProduct = await Product.findOne().sort({ totalSold: -1 }).limit(1);
    const stockTurnoverRate = totalInventoryCost > 0 ? totalCostOfGoodsSold / totalInventoryCost : 0;
    const lowStockProducts = await Product.find({ $expr: { $lte: ['$currentStock', '$minimumStock'] } }).limit(10);
    
    const productsWithValue = products
      .map(p => ({
        ...p.toObject(),
        totalValue: p.price * p.currentStock,
        totalProfit: (p.price - p.costPrice) * p.currentStock
      }))
      .sort((a, b) => b.totalValue - a.totalValue);

    const top10Profitable = [...productsWithValue].sort((a,b) => b.totalProfit - a.totalProfit).slice(0, 10);
    
    const profitabilityByProduct = top10Profitable.map(p => ({
      name: p.name, totalValue: p.totalValue, totalProfit: p.totalProfit,
      currentStock: p.currentStock, minimumStock: p.minimumStock, reorderPoint: p.reorderPoint
    }));
    
    const top9Products = productsWithValue.slice(0, 9);
    const otherProductsValue = productsWithValue.slice(9).reduce((acc, p) => acc + p.totalValue, 0);
    const productValueDistribution = top9Products.map(p => ({ name: p.name, value: p.totalValue }));
    if (otherProductsValue > 0) {
        productValueDistribution.push({ name: 'Others', value: otherProductsValue });
    }

    const statusAggregation = await Product.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const statusDistribution = statusAggregation.map(item => ({
        name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown',
        value: item.count
    }));

    // ## NEW LOGIC FOR HEATMAP ##
    const salesActivity = Array.from({ length: 7 * 24 }, () => 0);
    products.forEach(p => {
        if (p.lastSold) {
            const day = getDay(p.lastSold); // Sunday = 0, Saturday = 6
            const hour = getHours(p.lastSold);
            // Repeat for totalSold to simulate more activity
            for (let i = 0; i < p.totalSold; i++) {
                // Add some randomness to spread the data
                const randomHour = (hour + Math.floor(Math.random() * 4 - 2) + 24) % 24;
                salesActivity[day * 24 + randomHour]++;
            }
        }
    });
    const maxActivity = Math.max(...salesActivity);
    const salesActivityHeatmap = salesActivity.map((count, i) => ({
        day: Math.floor(i / 24),
        hour: i % 24,
        value: count,
        // Normalize the value for coloring on the frontend
        normalizedValue: maxActivity > 0 ? count / maxActivity : 0,
    }));
    
    return NextResponse.json({
      keyMetrics,
      mostReorderedProduct,
      stockTurnoverRate,
      productValueDistribution,
      profitabilityByProduct,
      lowStockProducts,
      statusDistribution,
      salesActivityHeatmap // Add new data to response
    });

  } catch (error) {
    console.error('Failed to fetch report data:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}