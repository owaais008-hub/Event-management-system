import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CheckCircle2, XCircle, Trash2, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export default function BulkActions({ items, type, onSuccess }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const selectAll = () => {
    setSelectedItems(items.map(item => item._id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select items to approve');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/admin/bulk-approve', {
        type,
        ids: selectedItems
      });
      toast.success(`Successfully approved ${selectedItems.length} ${type}`);
      setSelectedItems([]);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to approve items');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select items to reject');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/admin/bulk-reject', {
        type,
        ids: selectedItems
      });
      toast.success(`Successfully rejected ${selectedItems.length} ${type}`);
      setSelectedItems([]);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to reject items');
    } finally {
      setLoading(false);
    }
  };

  if (selectedItems.length === 0 && !showMenu) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowMenu(true)}
        className="mb-4"
      >
        Bulk Actions
      </Button>
    );
  }

  return (
    <AnimatePresence>
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bulk Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedItems.length} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowMenu(false);
                    setSelectedItems([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={loading || selectedItems.length === 0}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Selected
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleBulkReject}
                  disabled={loading || selectedItems.length === 0}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

