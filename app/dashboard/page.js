/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { useInventoryContext } from '../../context/InventoryContext';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  CubeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  BellIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Layout from '../../components/Layout/Layout';
import { formatCurrency, formatDate, formatDisplayCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';

const MobileStatCard = ({ title, value, change, icon: Icon, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className="text-xl lg:text-2xl font-bold text-gray-900">
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-1">
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-2 lg:p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

const MobileAlertCard = ({ type, title, message, count, color }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    className={`bg-white rounded-lg border-l-4 p-3 shadow-sm border-${color}-500`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center flex-1">
        <div className={`p-1.5 rounded-lg bg-${color}-100`}>
          <ExclamationTriangleIcon className={`h-4 w-4 text-${color}-600`} />
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {title}
          </h4>
          <p className="text-xs text-gray-600 truncate">
            {message}
          </p>
        </div>
      </div>
      <div className={`px-2 py-1 rounded-full bg-${color}-100 text-${color}-800 text-xs font-medium`}>
        {count}
      </div>
    </div>
  </motion.div>
);

const MobileActivityCard = ({ activity }) => {
  const type = activity.type;
  const action =
    type === 'in'
      ? 'Stock In'
      : type === 'out'
      ? 'Stock Out'
      : type === 'transfer'
      ? 'Transfer'
      : type === 'adjustment'
      ? 'Adjustment'
      : 'Activity';
  const product = activity.productId?.name || 'Unknown Product';
  const quantity = activity.quantity;
  const time = new Date(activity.timestamp).toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  });
  
  return(
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center flex-1 min-w-0">
        <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
          type === 'in' ? 'bg-green-500' :
          type === 'out' ? 'bg-red-500' :
          type === 'transfer' ? 'bg-yellow-500' :
          'bg-blue-500'
        }`}></div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 text-sm truncate">
            {action}
          </p>
          <p className="text-xs text-gray-600 truncate">
            {product}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <p className={`font-medium text-sm ${
          type === 'in' ? 'text-green-600' :
          type === 'out' ? 'text-red-600' :
          'text-blue-600'
        }`}>
          {type === 'in' ? '+' : ''}{quantity}
        </p>
        <p className="text-xs text-gray-500">
          {time}
        </p>
      </div>
    </motion.div>
  )
};

export default function Dashboard() {
  const { session } = useAuth();
  const { products, movements, loading } = useInventoryContext();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalProducts: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStock: 0,
      recentMovements: 0
    },
    recentActivity: [],
    alerts: [],
    topProducts: []
  });
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportReport = async () => {
    try {
      setExportLoading(true);
      toast.loading('Preparing dashboard report...', { id: 'export-toast' });

      // Fetch complete dashboard data for export
      const response = await fetch('/api/dashboard/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const exportData = await response.json();

      // Generate CSV content
      const csvContent = generateDashboardCSV(exportData, session);

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Dashboard report exported successfully!', { id: 'export-toast' });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.', { id: 'export-toast' });
    } finally {
      setExportLoading(false);
    }
  };

  // CSV generation function
  const generateDashboardCSV = (data, session) => {
    const currentDate = new Date().toLocaleDateString('en-IN');
    const currentTime = new Date().toLocaleTimeString('en-IN');

    let csvContent = `Dashboard Report\n`;
    csvContent += `Generated On: ${currentDate} ${currentTime}\n`;
    csvContent += `Generated By: ${session?.user?.name}\n\n`;

    // Summary Statistics
    csvContent += `SUMMARY STATISTICS\n`;
    csvContent += `Metric,Value\n`;
    csvContent += `Total Products,${data.stats.totalProducts}\n`;
    csvContent += `Total Inventory Value,₹${data.stats.totalValue.toLocaleString('en-IN')}\n`;
    csvContent += `Low Stock Items,${data.stats.lowStockItems}\n`;
    csvContent += `Out of Stock Items,${data.stats.outOfStock}\n`;
    csvContent += `Recent Movements (7 days),${data.stats.recentMovements}\n\n`;

    // Recent Activities
    csvContent += `RECENT ACTIVITIES\n`;
    csvContent += `Date,Action,Product,Quantity,User\n`;
    data.recentActivity.forEach(activity => {
      csvContent += `${activity.time},${activity.action},"${activity.product}",${activity.quantity},${activity.user || 'System'}\n`;
    });
    csvContent += `\n`;

    // Low Stock Items
    if (data.lowStockItems && data.lowStockItems.length > 0) {
      csvContent += `LOW STOCK ALERTS\n`;
      csvContent += `Product Name,SKU,Current Stock,Minimum Stock,Category\n`;
      data.lowStockItems.forEach(item => {
        csvContent += `"${item.name}",${item.sku},${item.currentStock},${item.minimumStock},"${item.category?.name || 'N/A'}"\n`;
      });
      csvContent += `\n`;
    }

    // Top Products
    if (data.topProducts && data.topProducts.length > 0) {
      csvContent += `TOP PERFORMING PRODUCTS\n`;
      csvContent += `Product Name,Sales Units,Revenue\n`;
      data.topProducts.forEach(product => {
        csvContent += `"${product.name}",${product.sales},₹${product.revenue.toLocaleString('en-IN')}\n`;
      });
      csvContent += `\n`;
    }

    // Category Distribution
    if (data.categoryDistribution && data.categoryDistribution.length > 0) {
      csvContent += `CATEGORY DISTRIBUTION\n`;
      csvContent += `Category,Product Count,Total Value\n`;
      data.categoryDistribution.forEach(category => {
        csvContent += `"${category.name || 'Uncategorized'}",${category.count},₹${(category.totalValue || 0).toLocaleString('en-IN')}\n`;
      });
    }

    return csvContent;
  };

  useEffect(() => {
    if (products && movements) {
      const totalValue = products.reduce((acc, p) => acc + (p.price * p.currentStock), 0);
      const lowStockProducts = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minimumStock);
      const outOfStockProducts = products.filter(p => p.currentStock === 0);
      const reorderRequiredProducts = lowStockProducts.filter(p => p.currentStock <= p.minimumStock / 2);

      const newAlerts = [
        {
          type: 'critical',
          title: 'Out of Stock',
          message: `${outOfStockProducts.length} products are completely out of stock`,
          count: outOfStockProducts.length,
          color: 'red'
        },
        {
          type: 'warning',
          title: 'Low Stock',
          message: `${lowStockProducts.length} products are running low on inventory`,
          count: lowStockProducts.length,
          color: 'yellow'
        },
        {
          type: 'info',
          title: 'Reorder Required',
          message: `${reorderRequiredProducts.length} products need immediate reordering`,
          count: reorderRequiredProducts.length,
          color: 'blue'
        }
      ];

      const topProducts = [...products]
        .sort((a, b) => (b.currentStock * b.price) - (a.currentStock * a.price))
        .slice(0, 4)
        .map(p => ({
          name: p.name,
          sales: p.currentStock, // Using current stock as a proxy for sales volume
          revenue: p.currentStock * p.price
        }));

      setDashboardData({
        stats: {
          totalProducts: products.length,
          totalValue,
          lowStockItems: lowStockProducts.length,
          outOfStock: outOfStockProducts.length,
          recentMovements: movements.length,
        },
        recentActivity: movements,
        alerts: newAlerts,
        topProducts: topProducts,
      });
    }
  }, [products, movements]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 lg:space-y-6">
        {/* Mobile Header */}
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Welcome back!
            </h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              Here's your inventory overview
            </p>
          </div>
          <div className="flex space-x-2 lg:space-x-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleExportReport}
              disabled={exportLoading}
              className="flex-1 lg:flex-none bg-white border border-gray-300 text-gray-700 hover:bg-gradient-to-r from-blue-600 to-purple-600 hover:text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              {exportLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                'Export Report'
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6">
          <MobileStatCard
            title="Products"
            value={dashboardData.stats.totalProducts.toLocaleString()}
            change="+12%"
            trend="up"
            icon={CubeIcon}
            color="blue"
          />
          <MobileStatCard
            title="Total Value"
            value={formatDisplayCurrency(dashboardData.stats.totalValue)}
            change="+8.2%"
            trend="up"
            icon={ChartBarIcon}
            color="green"
          />
          <MobileStatCard
            title="Low Stock"
            value={dashboardData.stats.lowStockItems}
            change="-5%"
            trend="down"
            icon={ExclamationTriangleIcon}
            color="orange"
          />
          <MobileStatCard
            title="Out of Stock"
            value={dashboardData.stats.outOfStock}
            change="+2"
            trend="up"
            icon={ExclamationTriangleIcon}
            color="red"
          />
          <div className="col-span-2 lg:col-span-1">
            <MobileStatCard
              title="Movements"
              value={dashboardData.stats.recentMovements}
              change="+24%"
              trend="up"
              icon={ArrowTrendingUpIcon}
              color="purple"
            />
          </div>
        </div>

        {/* Mobile Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                  Active Alerts
                </h2>
                <p className="text-xs lg:text-sm text-gray-600">
                  Critical notifications
                </p>
              </div>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {dashboardData.alerts && dashboardData.alerts.map((alert, index) => (
              <MobileAlertCard key={index} {...alert} />
            ))}
          </div>
        </div>

        {/* Mobile Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                    Recent Activity
                  </h2>
                  <p className="text-xs lg:text-sm text-gray-600">
                    Latest movements
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {dashboardData.recentActivity.slice(0, 4).map((activity, index) => (
                <MobileActivityCard key={activity._id || activity.id || index} activity={activity} />
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <ChartBarIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                    Top Products
                  </h2>
                  <p className="text-xs lg:text-sm text-gray-600">
                    Best sellers
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {dashboardData.topProducts && dashboardData.topProducts.map((product, index) => (
                <motion.div
                  key={`top-product-${index}`}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {product.sales} units
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-medium text-gray-900 text-sm">
                      {formatDisplayCurrency(product.revenue)}
                    </p>
                    <p className="text-xs text-green-600">
                      Revenue
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
