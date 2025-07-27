'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  TagIcon,
  CubeIcon,
  ChartBarIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { formatDisplayCurrency, formatDate } from '../lib/utils';
import Button from './ui/Button';

const ProductDetailModal = ({ product, isOpen, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !product) return null;

  const getStockStatus = () => {
    if (product.currentStock === 0) return { status: 'out-of-stock', color: 'red', text: 'Out of Stock' };
    if (product.currentStock <= product.minimumStock) return { status: 'low-stock', color: 'yellow', text: 'Low Stock' };
    return { status: 'good', color: 'green', text: 'In Stock' };
  };

  const stockStatus = getStockStatus();
  const stockPercentage = Math.min((product.currentStock / product.maximumStock) * 100, 100);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: CubeIcon },
    { id: 'stock', name: 'Stock Details', icon: ChartBarIcon },
    { id: 'supplier', name: 'Supplier Info', icon: BuildingStorefrontIcon },
  ];

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4 shadow-md"
              style={{ backgroundColor: product.category?.color || '#3B82F6' }}
            >
              {product.category?.icon || '📦'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <div className="flex items-center mt-1 space-x-4">
                <span className="text-sm text-gray-600">SKU: {product.sku}</span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                  stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {stockStatus.text}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
              className="flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-100 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Selling Price</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {formatDisplayCurrency(product.price)}
                        </p>
                      </div>
                      <TagIcon className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Current Stock</p>
                        <p className="text-2xl font-bold text-green-900">
                          {product.currentStock.toLocaleString()}
                        </p>
                      </div>
                      <CubeIcon className="h-8 w-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Total Value</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {formatDisplayCurrency(product.currentStock * product.price)}
                        </p>
                      </div>
                      <ChartBarIcon className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600 font-medium">Profit Margin</p>
                        <p className="text-2xl font-bold text-orange-900">
                          {product.price && product.costPrice 
                            ? `${(((product.price - product.costPrice) / product.costPrice) * 100).toFixed(1)}%`
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <CalendarIcon className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium text-gray-900">{product.category?.name || 'Uncategorized'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brand:</span>
                        <span className="font-medium text-gray-900">{product.brand || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost Price:</span>
                        <span className="font-medium text-gray-900">
                          {formatDisplayCurrency(product.costPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                      {product.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Added:</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(product.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description || 'No description available for this product.'}
                    </p>
                    
                    {product.tags && product.tags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Tags:</h4>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'stock' && (
              <motion.div
                key="stock"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Stock Level Visualization */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Level Analysis</h3>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Current Stock Level</span>
                      <span className="font-medium text-gray-900">
                        {product.currentStock} / {product.maximumStock} units
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          stockStatus.color === 'red' ? 'bg-red-500' :
                          stockStatus.color === 'yellow' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${stockPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{product.currentStock}</p>
                      <p className="text-sm text-gray-600">Current Stock</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-700">{product.minimumStock}</p>
                      <p className="text-sm text-gray-600">Minimum Level</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-700">{product.maximumStock}</p>
                      <p className="text-sm text-gray-600">Maximum Level</p>
                    </div>
                  </div>
                </div>

                {/* Stock Alerts */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h3>
                  
                  <div className="space-y-3">
                    {product.currentStock === 0 && (
                      <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
                        <div>
                          <p className="font-medium text-red-800">Out of Stock</p>
                          <p className="text-sm text-red-600">Immediate restocking required</p>
                        </div>
                      </div>
                    )}
                    
                    {product.currentStock > 0 && product.currentStock <= product.minimumStock && (
                      <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
                        <div>
                          <p className="font-medium text-yellow-800">Low Stock Warning</p>
                          <p className="text-sm text-yellow-600">
                            Stock is below minimum level ({product.minimumStock} units)
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {product.currentStock > product.minimumStock && (
                      <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <p className="font-medium text-green-800">Stock Level Healthy</p>
                          <p className="text-sm text-green-600">No immediate action required</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock History Preview */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {product.lastRestocked && (
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          Last restocked: {formatDate(product.lastRestocked)}
                        </span>
                      </div>
                    )}
                    {product.updatedAt && (
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          Last updated: {formatDate(product.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'supplier' && (
              <motion.div
                key="supplier"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
                  
                  {product.supplier?.name ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 text-lg">
                          {product.supplier.name}
                        </h4>
                      </div>
                      
                      {product.supplier.contactEmail && (
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">Email</p>
                            <a 
                              href={`mailto:${product.supplier.contactEmail}`}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              {product.supplier.contactEmail}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {product.supplier.contactPhone && (
                        <div className="flex items-center">
                          <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">Phone</p>
                            <a 
                              href={`tel:${product.supplier.contactPhone}`}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              {product.supplier.contactPhone}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {product.supplier.address && (
                        <div className="flex items-start">
                          <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900">Address</p>
                            <p className="text-gray-600">{product.supplier.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BuildingStorefrontIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No supplier information available</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Edit this product to add supplier details
                      </p>
                    </div>
                  )}
                </div>

                {/* Reorder Information */}
                {(product.reorderPoint || product.reorderQuantity) && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Reorder Settings</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {product.reorderPoint && (
                        <div className="bg-orange-50 rounded-lg p-4">
                          <p className="text-sm text-orange-600 font-medium">Reorder Point</p>
                          <p className="text-2xl font-bold text-orange-900">
                            {product.reorderPoint} units
                          </p>
                        </div>
                      )}
                      
                      {product.reorderQuantity && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-blue-600 font-medium">Reorder Quantity</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {product.reorderQuantity} units
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetailModal;