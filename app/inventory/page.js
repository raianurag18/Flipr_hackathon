'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatCurrency, formatDate, formatCompactCurrency } from '../../lib/utils';
import { toast } from 'react-hot-toast';

const StockUpdateModal = ({ product, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    type: 'in',
    quantity: '',
    reason: '',
    reference: '',
    notes: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/inventory/movement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          ...formData,
          quantity: parseInt(formData.quantity)
        })
      });

      if (response.ok) {
        toast.success('Stock updated successfully');
        onUpdate();
        onClose();
        setFormData({
          type: 'in',
          quantity: '',
          reason: '',
          reference: '',
          notes: '',
          location: ''
        });
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update stock');
      }
    } catch (error) {
      toast.error('Error updating stock');
    } finally {
      setLoading(false);
    }
  };

  const calculateNewStock = () => {
    const quantity = parseInt(formData.quantity) || 0;
    if (formData.type === 'in') {
      return product.currentStock + quantity;
    } else if (formData.type === 'out') {
      return Math.max(0, product.currentStock - quantity);
    } else if (formData.type === 'adjustment') {
      return quantity;
    }
    return product.currentStock;
  };

  const getTypeIcon = () => {
    switch (formData.type) {
      case 'in': return <ArrowUpIcon className="h-5 w-5 text-green-600" />;
      case 'out': return <ArrowDownIcon className="h-5 w-5 text-red-600" />;
      case 'adjustment': return <AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-600" />;
      case 'transfer': return <ArrowPathIcon className="h-5 w-5 text-purple-600" />;
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Update Stock</h2>
          <p className="text-gray-600 mt-1">{product.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Movement Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'in', label: 'Stock In', icon: ArrowUpIcon, color: 'green' },
                { value: 'out', label: 'Stock Out', icon: ArrowDownIcon, color: 'red' },
                { value: 'adjustment', label: 'Adjustment', icon: AdjustmentsHorizontalIcon, color: 'blue' },
                { value: 'transfer', label: 'Transfer', icon: ArrowPathIcon, color: 'purple' }
              ].map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      formData.type === type.value 
                        ? `border-${type.color}-500 bg-${type.color}-50` 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mx-auto mb-1 ${
                      formData.type === type.value ? `text-${type.color}-600` : 'text-gray-400'
                    }`} />
                    <div className={`text-xs font-medium ${
                      formData.type === type.value ? `text-${type.color}-700` : 'text-gray-600'
                    }`}>
                      {type.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select reason</option>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
              <option value="return">Return</option>
              <option value="damaged">Damaged</option>
              <option value="expired">Expired</option>
              <option value="theft">Theft</option>
              <option value="count_adjustment">Count Adjustment</option>
              <option value="transfer_in">Transfer In</option>
              <option value="transfer_out">Transfer Out</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Input
            label="Reference"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="PO#, Invoice#, etc."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes..."
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current Stock:</span>
              <span className="font-medium text-gray-900">{product.currentStock}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">New Stock:</span>
              <span className="font-medium text-gray-900">{calculateNewStock()}</span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center"
            >
              {getTypeIcon()}
              <span className="ml-2">
                {loading ? 'Updating...' : 'Update Stock'}
              </span>
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const MovementCard = ({ movement }) => {
  const getTypeColor = () => {
    switch (movement.type) {
      case 'in': return 'text-green-600 bg-green-100';
      case 'out': return 'text-red-600 bg-red-100';
      case 'adjustment': return 'text-blue-600 bg-blue-100';
      case 'transfer': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = () => {
    switch (movement.type) {
      case 'in': return <ArrowUpIcon className="h-4 w-4" />;
      case 'out': return <ArrowDownIcon className="h-4 w-4" />;
      case 'adjustment': return <AdjustmentsHorizontalIcon className="h-4 w-4" />;
      case 'transfer': return <ArrowPathIcon className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${getTypeColor()}`}>
            {getTypeIcon()}
          </div>
          <div className="ml-3">
            <h4 className="font-medium text-gray-900">
              {movement.productId?.name || 'Unknown Product'}
            </h4>
            <p className="text-sm text-gray-500">
              SKU: {movement.productId?.sku || 'N/A'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold ${
            movement.type === 'in' ? 'text-green-600' : 
            movement.type === 'out' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}
            {movement.quantity}
          </div>
          <div className="text-xs text-gray-500">
            {movement.previousStock} → {movement.newStock}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {movement.reason && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Reason:</span>
            <span className="capitalize text-gray-700">{movement.reason}</span>
          </div>
        )}
        
        {movement.reference && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Reference:</span>
            <span className="text-gray-700">{movement.reference}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center text-gray-500">
            <UserIcon className="h-4 w-4 mr-1" />
            <span>{movement.userId?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{formatDate(movement.timestamp)}</span>
          </div>
        </div>

        {movement.notes && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-gray-600 text-xs italic">{movement.notes}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function InventoryPage() {
  const { session } = useAuth(['view_inventory']);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchMovements();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchMovements = async () => {
    try {
      const response = await fetch('/api/inventory/movement?limit=20');
      const data = await response.json();
      setMovements(data.movements || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch movements');
      setLoading(false);
    }
  };

  const handleStockUpdate = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleUpdateComplete = () => {
    fetchProducts();
    fetchMovements();
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = filteredProducts.filter(product => 
    product.currentStock <= product.minimumStock
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">
              Track stock levels and manage inventory movements
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-100">
                <ArrowUpIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-red-100">
                <ArrowDownIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-100">
                <ArrowPathIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Recent Movements</p>
                <p className="text-2xl font-bold text-gray-900">{movements.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-purple-100">
                <AdjustmentsHorizontalIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCompactCurrency(
                    products.reduce((sum, product) => 
                      sum + (product.currentStock * product.price), 0
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Products Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Stock Levels</h2>
              </div>
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.slice(0, 10).map((product) => {
                    const isLowStock = product.currentStock <= product.minimumStock;
                    const isOutOfStock = product.currentStock === 0;
                    
                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{product.currentStock}</div>
                          <div className="text-xs text-gray-500">
                            Min: {product.minimumStock}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            isOutOfStock 
                              ? 'bg-red-100 text-red-800'
                              : isLowStock 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            onClick={() => handleStockUpdate(product)}
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Movements */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Recent Movements</h2>
              <p className="text-gray-600 mt-1">Latest inventory transactions</p>
            </div>
            
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {movements.length > 0 ? (
                movements.map((movement) => (
                  <MovementCard key={movement._id} movement={movement} />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">No movements found</div>
                  <div className="text-sm text-gray-500">
                    Stock movements will appear here
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock Update Modal */}
        {selectedProduct && (
          <StockUpdateModal
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUpdate={handleUpdateComplete}
          />
        )}
      </div>
    </Layout>
  );
}