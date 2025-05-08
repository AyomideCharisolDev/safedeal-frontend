import { useState, useEffect } from 'react';
import { 
  motion, AnimatePresence, useReducedMotion 
} from 'framer-motion';
import { 
  Clipboard, 
  Edit, 
  Trash2, 
  Check, 
  Search, 
  Filter, 
  ChevronDown, 
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  Eye,
  Shield,
  DollarSign
} from 'lucide-react';

// Types for our escrow data
interface Escrow {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: 'active' | 'pending' | 'completed' | 'disputed';
  buyer?: string;
  created: string;
  expiresAt?: string;
  description: string;
  condition: string;
  images: string[];
  deliveryOptions: DeliveryOption[];
  sellerLocation: string;
}

interface DeliveryOption {
  id: number;
  country: string;
  method: string;
  price: string;
}

// Main component
const ManageEscrows = () => {
  const shouldReduceMotion = useReducedMotion();
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Escrow | null,
    direction: 'ascending' | 'descending'
  }>({ key: 'created', direction: 'descending' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch escrow data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEscrows(mockEscrows);
      setIsLoading(false);
    }, 800);
  }, []);

  // Handle sorting
  const requestSort = (key: keyof Escrow) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort the escrows
  const sortedEscrows = [...escrows].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Filter escrows by search term and status
  const filteredEscrows = sortedEscrows.filter(escrow => {
    const matchesSearch = escrow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         escrow.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || escrow.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle copy link
  const handleCopyLink = (id: string) => {
    // In a real app, use the actual URL
    navigator.clipboard.writeText(`https://escrow.io/listing/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle delete escrow
  const handleDelete = (id: string) => {
    setEscrows(escrows.filter(escrow => escrow.id !== id));
    setShowDeleteConfirm(null);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: shouldReduceMotion ? 
      { opacity: 1 } : 
      { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: Escrow['status'] }) => {
    const statusStyles = {
      active: "bg-green-400/10 text-green-400 border-green-400/30",
      pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
      completed: "bg-blue-400/10 text-blue-400 border-blue-400/30",
      disputed: "bg-red-400/10 text-red-400 border-red-400/30"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen w-full mt-30  font-sans text-gray-10 flex relative overflow-hidden">
      {/*  */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <motion.span 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent font-bold"
            >
              Manage Escrows
            </motion.span>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 mt-2"
            >
              View and manage all your active escrow listings
            </motion.p>
          </div>
          
          {/* Filters & Search */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  className="block w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Search by title or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full md:w-auto flex items-center justify-between px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <div className="flex items-center">
                    <Filter size={18} className="text-gray-400 mr-2" />
                    <span>Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                  </div>
                  <ChevronDown size={18} className={`text-gray-400 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10"
                    >
                      <div className="py-1">
                        {['all', 'active', 'pending', 'completed', 'disputed'].map((status) => (
                          <button
                            key={status}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${statusFilter === status ? 'text-purple-400' : 'text-gray-300'}`}
                            onClick={() => {
                              setStatusFilter(status);
                              setIsFilterOpen(false);
                            }}
                          >
                            {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          
          {/* Escrows Table */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div 
                  animate={{ 
                    rotate: 360,
                    transition: { 
                      repeat: Infinity, 
                      duration: 1.5, 
                      ease: "linear" 
                    }
                  }}
                  className="w-12 h-12 border-4 border-gray-700 border-t-purple-500 rounded-full mb-4"
                />
                <p className="text-gray-400">Loading your escrows...</p>
              </div>
            ) : filteredEscrows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4"
                >
                  <AlertTriangle size={28} className="text-yellow-400" />
                </motion.div>
                <h3 className="text-lg font-medium text-gray-300 mb-1">No escrows found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || statusFilter !== 'all' ? 
                    "Try adjusting your filters or search term" : 
                    "You haven't created any escrows yet"}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                  Create New Escrow
                </motion.button>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="overflow-x-auto"
              >
                <table className="min-w-full divide-y divide-gray-900">
                  <thead className="bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-purple-400"
                        onClick={() => requestSort('title')}
                      >
                        <div className="flex items-center">
                          Item
                          {sortConfig.key === 'title' && (
                            <ArrowUpDown size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-purple-400"
                        onClick={() => requestSort('price')}
                      >
                        <div className="flex items-center">
                          Price
                          {sortConfig.key === 'price' && (
                            <ArrowUpDown size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-purple-400"
                        onClick={() => requestSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {sortConfig.key === 'status' && (
                            <ArrowUpDown size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-purple-400"
                        onClick={() => requestSort('created')}
                      >
                        <div className="flex items-center">
                          Created
                          {sortConfig.key === 'created' && (
                            <ArrowUpDown size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700 bg-gray-850">
                    {filteredEscrows.map((escrow) => (
                      <motion.tr 
                        key={escrow.id}
                        variants={itemVariants}
                        className="hover:bg-gray-750 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-md overflow-hidden">
                              {escrow.images.length > 0 ? (
                                <img src={escrow.images[0]} alt={escrow.title} className="h-10 w-10 object-cover" />
                              ) : (
                                <div className="h-10 w-10 flex items-center justify-center bg-gray-700">
                                  <Shield size={16} className="text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{escrow.title}</div>
                              <div className="text-xs text-gray-400">{escrow.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white flex items-center">
                            <DollarSign size={14} className="text-gray-400 mr-1" />
                            {escrow.price} {escrow.currency}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={escrow.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {new Date(escrow.created).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex space-x-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-full hover:bg-gray-700"
                              onClick={() => handleCopyLink(escrow.id)}
                              title="Copy link"
                            >
                              {copiedId === escrow.id ? (
                                <Check size={18} className="text-green-400" />
                              ) : (
                                <Clipboard size={18} className="text-gray-400 hover:text-purple-400" />
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-full hover:bg-gray-700"
                              title="View details"
                            >
                              <Eye size={18} className="text-gray-400 hover:text-purple-400" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-full hover:bg-gray-700"
                              title="Edit escrow"
                            >
                              <Edit size={18} className="text-gray-400 hover:text-purple-400" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-full hover:bg-gray-700"
                              onClick={() => setShowDeleteConfirm(escrow.id)}
                              title="Delete escrow"
                            >
                              <Trash2 size={18} className="text-gray-400 hover:text-red-400" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </div>
          
          {/* Footer/Pagination - could be added here */}
          <div className="mt-6 flex justify-between items-center text-sm text-gray-400">
            <div>
              Showing {filteredEscrows.length} of {escrows.length} escrows
            </div>
            <div className="flex space-x-2">
              <a href="#" className="text-purple-400 hover:underline flex items-center">
                <ExternalLink size={14} className="mr-1" />
                View Marketplace
              </a>
            </div>
          </div>
        </div>
      </main>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4">Delete Escrow</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this escrow? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 flex items-center justify-center hover:bg-gray-700"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                  className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mock data for demonstration
const mockEscrows: Escrow[] = [
  {
    id: "ESC-2025-0187",
    title: "Limited Edition Sneakers",
    price: 179.99,
    currency: "USDC",
    status: "active",
    created: "2025-04-10T10:30:00Z",
    expiresAt: "2025-05-10T10:30:00Z",
    description: "Brand new limited edition sneakers. Size 10. Never worn, still in original box with all accessories.",
    condition: "New",
    images: ['/api/placeholder/400/300'],
    deliveryOptions: [
      { id: 1, country: "Nigeria", method: "Standard shipping (3-5 business days)", price: "5.00" },
      { id: 2, country: "Nigeria", method: "Express shipping (1-2 business days)", price: "12.00" }
    ],
    sellerLocation: "Lagos, Nigeria"
  },
  {
    id: "ESC-2025-0174",
    title: "MacBook Pro M3 16-inch",
    price: 2499.99,
    currency: "USDC",
    status: "pending",
    buyer: "user12345",
    created: "2025-04-05T14:22:00Z",
    expiresAt: "2025-05-05T14:22:00Z",
    description: "MacBook Pro with M3 chip, 16GB RAM, 512GB SSD. Purchased in January 2025, like new condition.",
    condition: "Like New",
    images: ['/api/placeholder/400/300'],
    deliveryOptions: [
      { id: 1, country: "United States", method: "Express shipping (1-2 business days)", price: "30.00" },
      { id: 2, country: "Canada", method: "Standard shipping (3-5 business days)", price: "20.00" }
    ],
    sellerLocation: "Lagos, Nigeria"
  },
  {
    id: "ESC-2025-0163",
    title: "Vintage Film Camera Collection",
    price: 899.00,
    currency: "USDC",
    status: "completed",
    buyer: "collector42",
    created: "2025-03-22T09:15:00Z",
    description: "Collection of 5 vintage film cameras from the 1960s and 1970s. All functional and in excellent condition.",
    condition: "Good",
    images: ['/api/placeholder/400/300'],
    deliveryOptions: [
      { id: 1, country: "United Kingdom", method: "Premium shipping (Next day)", price: "25.00" },
      { id: 2, country: "Germany", method: "Standard shipping (3-5 business days)", price: "15.00" }
    ],
    sellerLocation: "Lagos, Nigeria"
  },
  {
    id: "ESC-2025-0145",
    title: "Gaming PC - RTX 4080, i9 13900K",
    price: 3200.00,
    currency: "USDC",
    status: "disputed",
    buyer: "gamer123",
    created: "2025-03-15T17:50:00Z",
    description: "Custom built gaming PC with RTX 4080, Intel i9 13900K, 64GB RAM, 2TB NVMe SSD, 4TB HDD.",
    condition: "New",
    images: ['/api/placeholder/400/300'],
    deliveryOptions: [
      { id: 1, country: "United States", method: "Premium shipping (Next day)", price: "50.00" }
    ],
    sellerLocation: "Lagos, Nigeria"
  },
  {
    id: "ESC-2025-0132",
    title: "Oil Painting - 'Sunset by the Lake'",
    price: 450.00,
    currency: "SOL",
    status: "active",
    created: "2025-04-18T11:00:00Z",
    expiresAt: "2025-05-18T11:00:00Z",
    description: "Original oil painting on canvas, 24x36 inches. Painted in 2024, gallery finish with certificate of authenticity.",
    condition: "New",
    images: ['/api/placeholder/400/300'],
    deliveryOptions: [
      { id: 1, country: "Australia", method: "Premium shipping (Next day)", price: "40.00" },
      { id: 2, country: "New Zealand", method: "Standard shipping (3-5 business days)", price: "25.00" }
    ],
    sellerLocation: "Lagos, Nigeria"
  },
  {
    id: "ESC-2025-0124",
    title: "Antique Wooden Bookshelf",
    price: 800.00,
    currency: "USDC",
    status: "active",
    created: "2025-04-15T13:45:00Z",
    expiresAt: "2025-05-15T13:45:00Z",
    description: "Authentic Victorian era wooden bookshelf, circa 1880. Solid oak with intricate carvings. 6ft tall, 4ft wide.",
    condition: "Good",
    images: ['/api/placeholder/400/300'],
    deliveryOptions: [
      { id: 1, country: "United Kingdom", method: "Standard shipping (3-5 business days)", price: "60.00" },
      { id: 2, country: "United Kingdom", method: "Local pickup", price: "0.00" }
    ],
    sellerLocation: "Lagos, Nigeria"
  }
];

export default ManageEscrows;