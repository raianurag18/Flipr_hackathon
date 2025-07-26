'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CubeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ProductDetailModal from '../../components/ProductDetailModal';
import { formatCurrency, formatDisplayCurrency, cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

const ProductCard = ({ product, onEdit, onDelete, onView }) => {
  const getStockStatus = () => {
    if (product.currentStock === 0) return 'out-of-stock';
    if (product.currentStock <= product.minimumStock) return 'low-stock';
    return 'good';
  };

  const getStockColor = () => {
    switch (getStockStatus()) {
      case 'out-of-stock': return 'text-red-600 bg-red-100';
      case 'low-stock': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getStockPercentage = () => {
    return Math.min((product.currentStock / product.maximumStock) * 100, 100);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          <div className="flex items-center mt-2">
            <span 
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: product.category?.color || '#3B82F6' }}
            />
            <span className="text-sm text-gray-600">{product.category?.name}</span>
          </div>
        </div>
        {getStockStatus() === 'out-of-stock' && (
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
        )}
      </div>

      {/* Stock Level */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Stock Level</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor()}`}>
            {product.currentStock} units
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              getStockStatus() === 'out-of-stock' ? 'bg-red-500' :
              getStockStatus() === 'low-stock' ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${getStockPercentage()}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Min: {product.minimumStock}</span>
          <span>Max: {product.maximumStock}</span>
        </div>
      </div>

      {/* Price Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Selling Price</p>
          <p className="font-semibold text-gray-900">{formatDisplayCurrency(product.price)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Value</p>
          <p className="font-semibold text-gray-900">
            {formatDisplayCurrency(product.currentStock * product.price)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(product)}
          className="flex-1"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(product)}
          className="flex-1"
        >
          <PencilIcon className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(product)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

const ProductModal = ({ product, isOpen, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    price: '',
    costPrice: '',
    currentStock: '',
    minimumStock: '',
    maximumStock: '',
    supplier: {
      name: '',
      contactEmail: '',
      contactPhone: ''
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        category: product.category?._id || '',
        price: product.price || '',
        costPrice: product.costPrice || '',
        currentStock: product.currentStock || '',
        minimumStock: product.minimumStock || '',
        maximumStock: product.maximumStock || '',
        supplier: {
          name: product.supplier?.name || '',
          contactEmail: product.supplier?.contactEmail || '',
          contactPhone: product.supplier?.contactPhone || ''
        }
      });
    } else {
      setFormData({
        name: '',
        description: '',
        sku: '',
        category: '',
        price: '',
        costPrice: '',
        currentStock: '',
        minimumStock: '10',
        maximumStock: '500',
        supplier: {
          name: '',
          contactEmail: '',
          contactPhone: ''
        }
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = product ? 'PUT' : 'POST';
      const url = product ? `/api/products/${product._id}` : '/api/products';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(product ? 'Product updated successfully' : 'Product created successfully');
        onSave();
        onClose();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Selling Price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <Input
              label="Cost Price"
              type="number"
              step="0.01"
              min="0"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Current Stock"
              type="number"
              min="0"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
              required
            />
            <Input
              label="Minimum Stock"
              type="number"
              min="0"
              value={formData.minimumStock}
              onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
              required
            />
            <Input
              label="Maximum Stock"
              type="number"
              min="1"
              value={formData.maximumStock}
              onChange={(e) => setFormData({ ...formData, maximumStock: e.target.value })}
              required
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Supplier Name"
                value={formData.supplier.name}
                onChange={(e) => setFormData({
                  ...formData,
                  supplier: { ...formData.supplier, name: e.target.value }
                })}
              />
              <Input
                label="Contact Email"
                type="email"
                value={formData.supplier.contactEmail}
                onChange={(e) => setFormData({
                  ...formData,
                  supplier: { ...formData.supplier, contactEmail: e.target.value }
                })}
              />
            </div>
            <div className="mt-4">
              <Input
                label="Contact Phone"
                value={formData.supplier.contactPhone}
                onChange={(e) => setFormData({
                  ...formData,
                  supplier: { ...formData.supplier, contactPhone: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
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
              className="flex-1"
            >
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function ProductsPage() {
  const { session } = useAuth(['view_inventory']);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [productToView, setProductToView] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      
      setProducts(data.products || []);
      setTotalPages(data.pagination?.pages || 1);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch products');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (product) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleViewProduct = (product) => {
    console.log('View product:', product);
    setProductToView(product);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setProductToView(null);
  };
  
  const handleEditFromDetail = (product) => {
    setIsDetailModalOpen(false);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">
              Manage your inventory products and stock levels
            </p>
          </div>
          <Button onClick={handleAddProduct} className="mt-4 lg:mt-0">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onView={handleViewProduct}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <CubeIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product'}
            </p>
            <Button onClick={handleAddProduct}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Your First Product
            </Button>
          </div>
        )}

        {/* Product Modal */}
        <AnimatePresence>
          <ProductModal
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={fetchProducts}
            categories={categories}
          />
        </AnimatePresence>

        {/* Product Detail Modal */}
        <AnimatePresence>
          <ProductDetailModal
            product={productToView}
            isOpen={isDetailModalOpen}
            onClose={handleCloseDetailModal}
            onEdit={handleEditFromDetail}
          />
        </AnimatePresence>
      </div>
    </Layout>
  );
}