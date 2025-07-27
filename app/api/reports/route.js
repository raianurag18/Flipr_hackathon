import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request) {
  try {
    await dbConnect();
    const products = await Product.find({}).populate('category').lean();

    if (products.length === 0) {
      return NextResponse.json({
        keyMetrics: { totalValue: 0, gmroi: 0, lowStockCount: 0, avgProfitMargin: 0 },
        mostReorderedProduct: null,
        stockTurnoverRate: 0,
        productValueDistribution: [],
        profitabilityByProduct: [],
        lowStockProducts: [],
        profitMarginDistribution: [],
      });
    }

    // --- KEY METRICS CALCULATIONS ---
    let totalValue = 0, totalProfit = 0, totalCostOfGoodsSold = 0, totalInventoryCost = 0;

    products.forEach(p => {
      const value = p.price * p.currentStock;
      const cost = p.costPrice * p.currentStock;
      totalValue += value;
      totalInventoryCost += cost;
      totalProfit += (value - cost);
      totalCostOfGoodsSold += p.costPrice * p.totalSold;
    });

    const lowStockCount = products.filter(p => p.currentStock <= p.minimumStock).length;

    const keyMetrics = {
      totalValue,
      gmroi: totalInventoryCost > 0 ? (totalProfit / totalInventoryCost) * 100 : 0,
      lowStockCount,
      avgProfitMargin: totalValue > 0 ? (totalProfit / totalValue) * 100 : 0,
    };
    
    // --- OTHER REPORT WIDGETS ---
    const mostReorderedProduct = products.sort((a, b) => b.totalSold - a.totalSold)[0] || null;
    const stockTurnoverRate = totalInventoryCost > 0 ? totalCostOfGoodsSold / totalInventoryCost : 0;
    const lowStockProducts = products.filter(p => p.currentStock <= p.minimumStock).slice(0, 10);
    
    // --- CHART DATA PREPARATION ---
    const productsWithValue = products
      .map(p => ({
        ...p,
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

    // ## UPDATED LOGIC FOR PROFIT MARGIN DISTRIBUTION ##
    const marginBuckets = {
        "0-10%": { count: 0, products: [] },
        "10-20%": { count: 0, products: [] },
        "20-30%": { count: 0, products: [] },
        "30-40%": { count: 0, products: [] },
        "40-50%": { count: 0, products: [] },
        "50%+": { count: 0, products: [] }
    };

    products.forEach(p => {
        if (p.price > 0) {
            const margin = ((p.price - p.costPrice) / p.price) * 100;
            let bucketKey;
            if (margin < 10) bucketKey = "0-10%";
            else if (margin < 20) bucketKey = "10-20%";
            else if (margin < 30) bucketKey = "20-30%";
            else if (margin < 40) bucketKey = "30-40%";
            else if (margin < 50) bucketKey = "40-50%";
            else bucketKey = "50%+";
            
            marginBuckets[bucketKey].count++;
            marginBuckets[bucketKey].products.push(p.name); // Add product name to the list
        }
    });

    const profitMarginDistribution = Object.entries(marginBuckets).map(([name, data]) => ({
        name,
        "Products": data.count,
        "productList": data.products // Include the list of products
    }));

    // --- FINAL RESPONSE ---
    return NextResponse.json({
      keyMetrics,
      mostReorderedProduct,
      stockTurnoverRate,
      productValueDistribution,
      profitabilityByProduct,
      lowStockProducts,
      profitMarginDistribution,
    });

  } catch (error) {
    console.error('Failed to fetch report data:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}