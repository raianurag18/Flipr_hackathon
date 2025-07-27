'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Layout from '../../components/Layout/Layout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

const ActivityCard = ({ activity, onClick }) => {
  const getTypeIcon = () => {
    switch (activity.type) {
      case 'in': return <ArrowUpIcon className="h-5 w-5 text-green-600" />;
      case 'out': return <ArrowDownIcon className="h-5 w-5 text-red-600" />;
      case 'adjustment': return <AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-600" />;
      case 'transfer': return <ArrowPathIcon className="h-5 w-5 text-purple-600" />;
      default: return <TagIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = () => {
    switch (activity.type) {
      case 'in': return 'text-green-600 bg-green-100 border-green-200';
      case 'out': return 'text-red-600 bg-red-100 border-red-200';
      case 'adjustment': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'transfer': return 'text-purple-600 bg-purple-100 border-purple-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getActionText = () => {
    switch (activity.type) {
      case 'in': return 'Stock In';
      case 'out': return 'Stock Out';
      case 'adjustment': return 'Stock Adjustment';
      case 'transfer': return 'Stock Transfer';
      default: return 'Unknown Action';
    }
  };

  return (
    <motion.div
      whileHover={{ x: 4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick(activity)}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className={`p-3 rounded-xl border ${getTypeColor()}`}>
            {getTypeIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
                {getActionText()}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                activity.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {activity.quantity > 0 ? '+' : ''}{activity.quantity}
              </span>
            </div>
            
            <p className="text-lg font-medium text-gray-800 truncate mb-1">
              {activity.productId?.name || 'Unknown Product'}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <TagIcon className="h-4 w-4 mr-1" />
                SKU: {activity.productId?.sku || 'N/A'}
              </span>
              
              <span className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                {activity.userId?.name || 'System'}
              </span>
              
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatDate(activity.timestamp)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">
            Stock Change
          </div>
          <div className="text-lg font-bold text-gray-900">
            {activity.previousStock} → {activity.newStock}
          </div>
          {activity.reason && (
            <div className="text-xs text-gray-500 mt-1 capitalize">
              {activity.reason}
            </div>
          )}
        </div>

        <div className="ml-4">
          <EyeIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>

      {activity.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 italic">
            "{activity.notes}"
          </p>
        </div>
      )}
    </motion.div>
  );
};

const ActivityDetailModal = ({ activity, isOpen, onClose }) => {
  if (!isOpen || !activity) return null;

  const getTypeIcon = () => {
    switch (activity.type) {
      case 'in': return <ArrowUpIcon className="h-6 w-6 text-green-600" />;
      case 'out': return <ArrowDownIcon className="h-6 w-6 text-red-600" />;
      case 'adjustment': return <AdjustmentsHorizontalIcon className="h-6 w-6 text-blue-600" />;
      case 'transfer': return <ArrowPathIcon className="h-6 w-6 text-purple-600" />;
      default: return <TagIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getActionText = () => {
    switch (activity.type) {
      case 'in': return 'Stock In';
      case 'out': return 'Stock Out';
      case 'adjustment': return 'Stock Adjustment';
      case 'transfer': return 'Stock Transfer';
      default: return 'Unknown Action';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {getTypeIcon()}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{getActionText()}</h2>
              <p className="text-gray-600">Activity Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Product Name</label>
                <p className="font-medium text-gray-900">{activity.productId?.name || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">SKU</label>
                <p className="font-medium text-gray-900">{activity.productId?.sku || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Movement Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Movement Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Movement Type</label>
                <p className="font-medium text-gray-900">{getActionText()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Quantity</label>
                <p className={`font-medium ${
                  activity.quantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {activity.quantity > 0 ? '+' : ''}{activity.quantity} units
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Previous Stock</label>
                <p className="font-medium text-gray-900">{activity.previousStock} units</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">New Stock</label>
                <p className="font-medium text-gray-900">{activity.newStock} units</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
            <div className="space-y-3">
              {activity.reason && (
                <div>
                  <label className="text-sm text-gray-600">Reason</label>
                  <p className="font-medium text-gray-900 capitalize">{activity.reason}</p>
                </div>
              )}
              
              {activity.reference && (
                <div>
                  <label className="text-sm text-gray-600">Reference</label>
                  <p className="font-medium text-gray-900">{activity.reference}</p>
                </div>
              )}
              
              {activity.notes && (
                <div>
                  <label className="text-sm text-gray-600">Notes</label>
                  <p className="font-medium text-gray-900">{activity.notes}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm text-gray-600">Performed By</label>
                <p className="font-medium text-gray-900">{activity.userId?.name || 'System'}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Date & Time</label>
                <p className="font-medium text-gray-900">{formatDate(activity.timestamp)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const FilterPanel = ({ isOpen, onClose, filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      type: '',
      reason: '',
      userId: '',
      dateFrom: '',
      dateTo: ''
    };
    setLocalFilters(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Filter Activities</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Movement Type
            </label>
            <select
              value={localFilters.type}
              onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
              <option value="adjustment">Stock Adjustment</option>
              <option value="transfer">Stock Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <select
              value={localFilters.reason}
              onChange={(e) => setLocalFilters({ ...localFilters, reason: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Reasons</option>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={localFilters.dateFrom}
                onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={localFilters.dateTo}
                onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default function ActivitiesPage() {
  const { session } = useAuth(['view_inventory']);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  const [filters, setFilters] = useState({
    type: '',
    reason: '',
    userId: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchActivities();
  }, [currentPage]);

  useEffect(() => {
    applyFilters();
  }, [activities, searchTerm, filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '100' // Fetch more for client-side filtering
      });

      const response = await fetch(`/api/inventory/movement?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.movements || []);
        setTotalPages(Math.ceil((data.pagination?.total || 0) / itemsPerPage));
      } else {
        toast.error('Failed to fetch activities');
        // Fallback with sample data
        setActivities([
          {
            _id: 'sample-1',
            type: 'in',
            quantity: 50,
            previousStock: 20,
            newStock: 70,
            reason: 'purchase',
            reference: 'PO-001',
            notes: 'Regular stock replenishment',
            timestamp: new Date(),
            productId: { name: 'MacBook Pro 16"', sku: 'MBP-16-001' },
            userId: { name: 'Admin' }
          },
          {
            _id: 'sample-2',
            type: 'out',
            quantity: -25,
            previousStock: 70,
            newStock: 45,
            reason: 'sale',
            reference: 'SALE-001',
            notes: 'Customer order fulfillment',
            timestamp: new Date(Date.now() - 3600000),
            productId: { name: 'iPhone 15 Pro', sku: 'IPH-15-001' },
            userId: { name: 'Staff User' }
          }
        ]);
      }
      setLoading(false);
    } catch (error) {
      toast.error('Error loading activities');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.productId?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(activity => activity.type === filters.type);
    }

    // Reason filter
    if (filters.reason) {
      filtered = filtered.filter(activity => activity.reason === filters.reason);
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(activity => new Date(activity.timestamp) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(activity => new Date(activity.timestamp) <= toDate);
    }

    setFilteredActivities(filtered);
  };

  const handleViewActivity = (activity) => {
    setSelectedActivity(activity);
    setIsDetailModalOpen(true);
  };

  const handleExport = async () => {
    try {
      // Simple CSV export
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Date,Type,Product,SKU,Quantity,Previous Stock,New Stock,Reason,Reference,User\n" +
        filteredActivities.map(activity => [
          formatDate(activity.timestamp),
          activity.type,
          activity.productId?.name || '',
          activity.productId?.sku || '',
          activity.quantity,
          activity.previousStock,
          activity.newStock,
          activity.reason || '',
          activity.reference || '',
          activity.userId?.name || ''
        ].join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inventory_activities_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Activities exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
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

  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recent Activities</h1>
            <p className="text-gray-600 mt-1">
              Complete history of all inventory movements and transactions
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <Button onClick={handleExport} variant="outline">
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-100">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-100">
                <ArrowUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Stock In</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activities.filter(a => a.type === 'in').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-red-100">
                <ArrowDownIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Stock Out</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activities.filter(a => a.type === 'out').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-purple-100">
                <AdjustmentsHorizontalIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Adjustments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activities.filter(a => a.type === 'adjustment').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name, SKU, user, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setIsFilterPanelOpen(true)}
                variant="outline"
                className="relative"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {getActiveFiltersCount() > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.type && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Type: {filters.type}
                  <button
                    onClick={() => setFilters({ ...filters, type: '' })}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.reason && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Reason: {filters.reason}
                  <button
                    onClick={() => setFilters({ ...filters, reason: '' })}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Date Range
                  <button
                    onClick={() => setFilters({ ...filters, dateFrom: '', dateTo: '' })}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {paginatedActivities.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
                </p>
              </div>

              <div className="space-y-3">
                {paginatedActivities.map((activity) => (
                  <ActivityCard
                    key={activity._id}
                    activity={activity}
                    onClick={handleViewActivity}
                  />
                ))}
              </div>

              {/* Pagination */}
              {Math.ceil(filteredActivities.length / itemsPerPage) > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: Math.ceil(filteredActivities.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
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
                    disabled={currentPage === Math.ceil(filteredActivities.length / itemsPerPage)}
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
                <ClockIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || getActiveFiltersCount() > 0
                  ? 'Try adjusting your search or filter criteria'
                  : 'Inventory movements will appear here when they occur'}
              </p>
            </div>
          )}
        </div>

        {/* Activity Detail Modal */}
        <AnimatePresence>
          <ActivityDetailModal
            activity={selectedActivity}
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
          />
        </AnimatePresence>

        {/* Filter Panel */}
        <AnimatePresence>
          <FilterPanel
            isOpen={isFilterPanelOpen}
            onClose={() => setIsFilterPanelOpen(false)}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </AnimatePresence>
      </div>
    </Layout>
  );
}