'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        console.error('Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change with debouncing
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    
    // Debounce search requests
    const timeoutId = setTimeout(() => {
      performSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [performSearch]);

  // Navigate to detailed search results
  const goToSearchResults = (query) => {
    if (query && query.trim()) {
      setShowResults(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Select a search result
  const selectResult = (result) => {
    setShowResults(false);
    setSearchTerm('');
    
    // Navigate based on result type
    switch (result.type) {
      case 'product':
        router.push(`/products?highlight=${result.id}`);
        break;
      case 'category':
        router.push(`/products?category=${result.id}`);
        break;
      case 'user':
        if (result.id === 'admin') {
          router.push(`/users?highlight=${result.id}`);
        }
        break;
      default:
        router.push('/products');
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const value = {
    searchTerm,
    searchResults,
    isSearching,
    showResults,
    handleSearchChange,
    goToSearchResults,
    selectResult,
    clearSearch,
    setShowResults
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};