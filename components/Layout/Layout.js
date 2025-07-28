'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  XMarkIcon,
  CogIcon,
  CubeIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { useSearch } from '../../context/SearchContext';
import Sidebar from './Sidebar';
import { formatDisplayCurrency, cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import dynamic from 'next/dynamic';

const SyncManager = dynamic(() => import('../SyncManager'), { ssr: false });

const SearchResultItem = ({ result, onSelect }) => {
  const getIcon = () => {
    switch (result.type) {
      case 'product':
        return <CubeIcon className="h-5 w-5 text-blue-600" />;
      case 'category':
        return <TagIcon className="h-5 w-5 text-green-600" />;
      case 'user':
        return <UserIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <CubeIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBadgeColor = () => {
    switch (result.type) {
      case 'product': return 'bg-blue-100 text-blue-800';
      case 'category': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      whileHover={{ x: 4, backgroundColor: '#F9FAFB' }}
      onClick={() => onSelect(result)}
      className="flex items-center p-3 cursor-pointer border-b border-gray-100 last:border-b-0 group"
    >
      <div className="flex-shrink-0 mr-3">
        {result.type === 'category' ? (
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: result.color }}
          >
            {result.icon}
          </div>
        ) : (
          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
            {getIcon()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-1">
          <h4 className="font-medium text-gray-900 truncate mr-2">
            {result.title}
          </h4>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor()}`}>
            {result.type}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 truncate mb-1">
          {result.subtitle}
        </p>
        
        {result.description && (
          <p className="text-xs text-gray-500 truncate">
            {result.description}
          </p>
        )}

        {result.type === 'product' && (
          <div className="flex items-center mt-2 space-x-4">
            <span className="text-sm font-medium text-green-600">
              {formatDisplayCurrency(result.price)}
            </span>
            <span className="text-xs text-gray-500">
              Stock: {result.stock}
            </span>
          </div>
        )}
      </div>

      <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
    </motion.div>
  );
};

const SearchDropdown = () => {
  const { 
    searchResults, 
    isSearching, 
    showResults, 
    selectResult,
    goToSearchResults,
    searchTerm,
    setShowResults 
  } = useSearch();
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowResults]);

  if (!showResults) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
      >
        {isSearching ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Searching...</span>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <div className="p-3 border-b border-gray-100">
              <p className="text-sm text-gray-600">
                Found {searchResults.length} results
              </p>
            </div>
            
            <div className="max-h-80 overflow-hidden">
              {searchResults.map((result) => (
                <SearchResultItem
                  key={`${result.type}-${result.id}`}
                  result={result}
                  onSelect={selectResult}
                />
              ))}
            </div>

            <div className="p-3 border-t border-gray-100">
              <button
                onClick={() => goToSearchResults(searchTerm)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                View all results →
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No results found</p>
            <p className="text-sm text-gray-400">
              Try searching for products, categories, or SKUs
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default function Layout({ children }) {
  const { data: session } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [receiveLowStockAlerts, setReceiveLowStockAlerts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { 
    searchTerm, 
    handleSearchChange, 
    clearSearch, 
    goToSearchResults,
    showResults 
  } = useSearch();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      goToSearchResults(searchTerm);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  // Load user preferences
  useEffect(() => {
    console.log('Session data:', session);
    if (session?.user?.preferences) {
      console.log('User preferences found:', session.user.preferences);
      setReceiveLowStockAlerts(session.user.preferences.receiveLowStockAlerts);
    } else {
      console.log('No user preferences found in session.');
    }
  }, [session]);

  // Detect mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-sidebar')) {
        setMobileMenuOpen(false);
      }
      if (notificationMenuOpen && !event.target.closest('.notification-menu')) {
        setNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen, notificationMenuOpen]);

  // Save notification preferences
  const handleSaveNotificationSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiveLowStockAlerts }),
      });

      if (response.ok) {
        toast.success('Notification preferences saved successfully');
      } else {
        toast.error('Failed to save notification preferences');
      }
    } catch (error) {
      toast.error('An error occurred while saving preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="mobile-sidebar fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-lg font-bold text-gray-900">Stoqkify</h1>
                    <p className="text-xs text-gray-500 -mt-1">Inventory</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <Sidebar 
                session={session} 
                collapsed={false}
                onToggleCollapse={() => {}}
                isMobile={true}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex">
          <Sidebar 
            session={session}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            isMobile={false}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Mobile-Optimized Header */}
          <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
            <div className="flex items-center justify-between h-14 lg:h-16 px-3 lg:px-6">
              <div className="flex items-center flex-1">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden mr-2"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>

                {/* Desktop Sidebar Toggle */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-4"
                >
                  {sidebarCollapsed ? (
                    <ChevronRightIcon className="h-6 w-6" />
                  ) : (
                    <ChevronLeftIcon className="h-6 w-6" />
                  )}
                </button>

                {/* Mobile Logo */}
                <div className="flex items-center lg:hidden">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="ml-2 text-base font-bold text-gray-900">Stoqkify</span>
                </div>

                {/* Desktop Search */}
                <div className="hidden md:block ml-6">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search products, categories, SKUs..."
                        className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-200"
                      />
                      
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </form>
                  <SearchDropdown />
                </div>
              </div>

              <div className="flex items-center space-x-2 lg:space-x-4">
                {/* Mobile Search Button */}
                <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 md:hidden">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>

                {/* Enhanced Notifications Menu */}
                <div className="relative notification-menu">
                  <button 
                    onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                    className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-100 rounded-lg"
                  >
                    <BellIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                  </button>

                  {/* Notification Dropdown */}
                  <AnimatePresence>
                    {notificationMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
                            <button
                              onClick={() => setNotificationMenuOpen(false)}
                              className="p-1 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-100"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Settings Section */}
                        <div className="px-4 py-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900 flex items-center">
                              <CogIcon className="h-4 w-4 mr-2" />
                              Notification Settings
                            </h4>
                          </div>
                          
                          <div className="space-y-3">
                            {/* Low Stock Alerts Toggle */}
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700">Low Stock Alerts</label>
                                <p className="text-xs text-gray-500">Get notified via email when products run low</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer ml-3">
                                <input
                                  type="checkbox"
                                  checked={receiveLowStockAlerts}
                                  onChange={(e) => setReceiveLowStockAlerts(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>

                            {/* Save Button */}
                            <Button
                              onClick={handleSaveNotificationSettings}
                              disabled={isLoading}
                              className="w-full px-3 py-2"
                            >
                              {isLoading ? (
                                <div className="flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Saving...
                                </div>
                              ) : (
                                'Save Settings'
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="py-2"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center space-x-2 lg:space-x-3 text-sm rounded-lg p-1 lg:p-2 hover:bg-gray-100">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium text-xs lg:text-sm">
                        {session?.user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="font-medium text-gray-900 text-sm lg:text-base truncate max-w-24 lg:max-w-none">
                        {session?.user?.name}
                      </div>
                      <div className="text-xs text-gray-500">{session?.user?.role}</div>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400 hidden sm:block" />
                  </Menu.Button>

                  <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="px-1 py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => signOut()}
                              className={cn(
                                'group flex w-full items-center rounded-md px-2 py-2 text-sm text-red-600',
                                active ? 'bg-red-50' : ''
                              )}
                            >
                              Sign Out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 lg:p-6"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
      <SyncManager />
    </div>
  );
}
