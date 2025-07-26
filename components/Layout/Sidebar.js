'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon,
  CubeIcon,
  ChartBarIcon,
  BellIcon,
  UsersIcon,
  CogIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  BuildingStorefrontIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon, 
    permission: 'view_inventory',
    description: 'Overview & Analytics'
  },
  { 
    name: 'Products', 
    href: '/products', 
    icon: CubeIcon, 
    permission: 'view_inventory',
    description: 'Manage Products'
  },
  { 
    name: 'Inventory', 
    href: '/inventory', 
    icon: ArchiveBoxIcon, 
    permission: 'view_inventory',
    description: 'Stock Management'
  },
  { 
    name: 'Recent Activities', 
    href: '/activities', 
    icon: ClockIcon, 
    permission: 'view_inventory',
    description: 'View All Activities'
  },
  { 
    name: 'Categories', 
    href: '/categories', 
    icon: BuildingStorefrontIcon, 
    permission: 'manage_categories',
    description: 'Product Categories'
  },
  { 
    name: 'Reports', 
    href: '/reports', 
    icon: ChartBarIcon, 
    permission: 'view_reports',
    description: 'Analytics & Reports'
  },
  { 
    name: 'Alerts', 
    href: '/alerts', 
    icon: BellIcon, 
    permission: 'view_inventory',
    description: 'Stock Alerts'
  },
  // { 
  //   name: 'Users', 
  //   href: '/users', 
  //   icon: UsersIcon, 
  //   permission: 'manage_users',
  //   description: 'User Management'
  // },
  // { 
  //   name: 'Settings', 
  //   href: '/settings', 
  //   icon: CogIcon, 
  //   permission: 'system_settings',
  //   description: 'System Settings'
  // }
];

export default function Sidebar({ session, collapsed, onToggleCollapse }) {
  const pathname = usePathname();

  const hasPermission = (permission) => {
    return session?.user?.role === 'admin' || 
           session?.user?.permissions?.includes(permission);
  };

  const filteredNavigation = navigation.filter(item => 
    hasPermission(item.permission)
  );

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white border-r border-gray-200 shadow-xl flex flex-col"
    >
      {/* Logo Section */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </motion.div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="ml-3"
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Premium
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Inventory</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon className={cn(
                  'flex-shrink-0 h-6 w-6',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                )} />
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3 flex-1"
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className={cn(
                        'text-xs mt-0.5',
                        isActive ? 'text-blue-100' : 'text-gray-500'
                      )}>
                        {item.description}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute right-2 w-2 h-2 bg-white rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {session?.user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-3 flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.role}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}