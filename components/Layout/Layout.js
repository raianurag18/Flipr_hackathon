'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import Sidebar from './Sidebar';
import { cn } from '../../lib/utils';

export default function Layout({ children }) {
  const { data: session } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

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
                    <h1 className="text-lg font-bold text-gray-900">Premium</h1>
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
                  <Bars3Icon className="h-6 w-6" />
                </button>

                {/* Mobile Logo */}
                <div className="flex items-center lg:hidden">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="ml-2 text-base font-bold text-gray-900">Premium</span>
                </div>

                {/* Desktop Search */}
                <div className="hidden md:block ml-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 w-48 lg:w-64 xl:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 lg:space-x-4">
                {/* Mobile Search Button */}
                <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 md:hidden">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <BellIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>

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
                              className={cn(
                                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              )}
                            >
                              Profile Settings
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={cn(
                                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              )}
                            >
                              Preferences
                            </button>
                          )}
                        </Menu.Item>
                      </div>
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
    </div>
  );
}