import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ExhibitorSearch() {
  const [exhibitors, setExhibitors] = useState([]);
  const [filteredExhibitors, setFilteredExhibitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchExhibitors();
  }, [fetchExhibitors]);

  const filterAndSortExhibitors = useCallback(() => {
    let result = [...exhibitors];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(exhibitor => 
        exhibitor.companyName.toLowerCase().includes(term) ||
        exhibitor.description.toLowerCase().includes(term) ||
        exhibitor.products.toLowerCase().includes(term) ||
        (exhibitor.category && exhibitor.category.toLowerCase().includes(term))
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      result = result.filter(exhibitor => 
        exhibitor.category === categoryFilter
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.companyName.localeCompare(b.companyName);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });
    
    setFilteredExhibitors(result);
  }, [exhibitors, searchTerm, categoryFilter, sortBy]);

  useEffect(() => {
    filterAndSortExhibitors();
  }, [exhibitors, searchTerm, categoryFilter, sortBy, filterAndSortExhibitors]);

  const fetchExhibitors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/exhibitors/approved');
      setExhibitors(res.data.exhibitors || []);
    } catch (err) {
      console.error('Error fetching exhibitors:', err);
      setError('Failed to load exhibitors');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get unique categories for filter dropdown
  const categories = [...new Set(exhibitors.map(e => e.category).filter(Boolean))].sort();

  if (loading) {
    return <div className="text-center py-8">Loading exhibitors...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3 text-red-800 dark:text-red-200 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Search Exhibitors</label>
            <input
              type="text"
              className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
              placeholder="Search by name, description, or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <select
              className="border border-gray-300 dark:border-slate-600 rounded px-3 py-2 w-full bg-white dark:bg-slate-800"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Company Name</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Exhibitors ({filteredExhibitors.length})
          </h2>
        </div>
        
        {filteredExhibitors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <p>No exhibitors found matching your criteria</p>
            <button 
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mt-4"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExhibitors.map((exhibitor) => (
              <div 
                key={exhibitor._id} 
                className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow"
              >
                {exhibitor.logoUrl && (
                  <img 
                    src={exhibitor.logoUrl} 
                    alt={exhibitor.companyName} 
                    className="w-16 h-16 object-contain mb-3"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                
                <h3 className="font-semibold text-lg">
                  <Link 
                    to={`/exhibitors/${exhibitor._id}`} 
                    className="hover:underline"
                  >
                    {exhibitor.companyName}
                  </Link>
                </h3>
                
                {exhibitor.category && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200">
                      {exhibitor.category}
                    </span>
                  </div>
                )}
                
                <p className="text-gray-700 dark:text-slate-300 mt-2 text-sm">
                  {exhibitor.description}
                </p>
                
                <div className="mt-3">
                  <div className="text-sm font-medium">Products/Services:</div>
                  <p className="text-gray-600 dark:text-slate-400 text-sm">
                    {exhibitor.products}
                  </p>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/exhibitors/${exhibitor._id}`}
                    className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm flex-1 text-center"
                  >
                    View Details
                  </Link>
                  
                  {exhibitor.booth && (
                    <button className="btn-secondary btn-sm">
                      Booth #{exhibitor.booth.number}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}