import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOwnerRequests, selectOwnerRequests, selectJoinRequestLoading, updateRequestStatus } from '../../store/slices/joinRequestSlice';
import { Calendar, CheckCircle, XCircle, Clock, ChevronRight, Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  Approved: { icon: CheckCircle, color: 'text-success-600', bg: 'bg-success-50 border-success-200', label: 'Confirmed' },
  Pending: { icon: Clock, color: 'text-warning-600', bg: 'bg-warning-50 border-warning-200', label: 'Pending' },
  Rejected: { icon: XCircle, color: 'text-danger-600', bg: 'bg-danger-50 border-danger-200', label: 'Cancelled' },
};

export default function Bookings() {
  const dispatch = useDispatch();
  const ownerRequests = useSelector(selectOwnerRequests) || [];
  const isLoading = useSelector(selectJoinRequestLoading);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    dispatch(fetchOwnerRequests());
  }, [dispatch]);

 
  const filteredBookings = ownerRequests.filter((req) => {
    const searchLower = searchTerm.toLowerCase();
    const tenantName = req.tenant?.name || '';
    const propName = req.property?.name || '';
    const reqId = req._id || '';

    const matchesSearch = 
      tenantName.toLowerCase().includes(searchLower) ||
      reqId.toLowerCase().includes(searchLower) ||
      propName.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    if (filteredBookings.length === 0) {
      toast.error("No data to export!");
      return;
    }
    
    const headers = ['Booking ID', 'Tenant Name', 'Property', 'Room', 'Date', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredBookings.map(req => {
        const tenantName = req.tenant?.name || 'Unknown';
        const propName = req.property?.name || 'Unknown';
        const roomNo = req.room?.roomNumber || 'Unknown';
        const date = new Date(req.createdAt).toLocaleDateString();
        const amount = `₹${req.room?.rent?.toLocaleString() || 0}`;
        return `"${req._id}","${tenantName}","${propName}","${roomNo}","${date}","${amount}","${req.status}"`;
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bookings_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Export successful!");
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Bookings</h1>
          <p className="text-surface-500 text-sm mt-0.5">Manage room reservations and applications</p>
        </div>
        <button 
          onClick={handleExport}
          className="btn-primary"
        >
          Export Data
        </button>
      </div>

      <div className="card bg-white border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by tenant name or booking ID..."
              className="input pl-10 bg-surface-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative w-full sm:w-auto">
            <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-surface-500 z-10 pointer-events-none" />
            <select
              className="btn-secondary w-full sm:w-auto pl-10 appearance-none bg-white cursor-pointer pr-8"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-surface-500 text-sm font-semibold">
                <th className="pb-3 pl-4">Tenant</th>
                <th className="pb-3">Property & Room</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && ownerRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-surface-500">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                    </div>
                    Loading bookings...
                  </td>
                </tr>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((req) => {
                  const StatusIcon = STATUS_CONFIG[req.status]?.icon || Clock;
                  const tenantName = req.tenant?.name || 'Unknown User';
                  const avatar = req.tenant?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tenantName)}&background=random`;
                  const propName = req.property?.name || 'Unknown Property';
                  const roomName = req.room ? `${req.room.roomNumber} (${req.room.type})` : 'Unknown Room';
                  const date = new Date(req.createdAt).toLocaleDateString();
                  const amount = req.room?.rent ? `₹${req.room.rent.toLocaleString()}` : 'N/A';
                  
                  return (
                    <tr key={req._id} className="border-b border-border last:border-0 hover:bg-surface-50 transition-colors group">
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <img src={avatar} alt={tenantName} className="w-10 h-10 rounded-full border border-border object-cover" />
                          <div>
                            <p className="font-bold text-surface-900">{tenantName}</p>
                            <p className="text-xs text-surface-500">{(req._id).slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="font-medium text-surface-900">{propName}</p>
                        <p className="text-sm text-surface-500">Room {roomName}</p>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-surface-700">
                          <Calendar className="w-4 h-4 text-surface-400" />
                          <span className="text-sm font-medium">{date}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="font-semibold text-surface-900">{amount}</span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[req.status]?.bg} ${STATUS_CONFIG[req.status]?.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {STATUS_CONFIG[req.status]?.label || req.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <button
                          onClick={() => setSelectedBooking({
                            id: req._id,
                            tenantName,
                            avatar,
                            property: propName,
                            room: roomName,
                            date,
                            amount
                          })}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center justify-end w-full gap-1"
                        >
                          Review <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-surface-500">
                    No bookings found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

 
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-50">
              <h2 className="text-lg font-bold text-surface-900">Booking Details</h2>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="text-surface-400 hover:text-surface-600 hover:bg-surface-200 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <img src={selectedBooking.avatar} alt={selectedBooking.tenantName} className="w-16 h-16 rounded-full border-2 border-border" />
                <div>
                  <h3 className="text-xl font-bold text-surface-900">{selectedBooking.tenantName}</h3>
                  <p className="text-surface-500 font-medium">{selectedBooking.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-surface-50 rounded-xl border border-border">
                  <p className="text-xs text-surface-500 mb-1">Property</p>
                  <p className="font-semibold text-surface-900 text-sm">{selectedBooking.property}</p>
                </div>
                <div className="p-3 bg-surface-50 rounded-xl border border-border">
                  <p className="text-xs text-surface-500 mb-1">Room</p>
                  <p className="font-semibold text-surface-900 text-sm">{selectedBooking.room}</p>
                </div>
                <div className="p-3 bg-surface-50 rounded-xl border border-border">
                  <p className="text-xs text-surface-500 mb-1">Move-in Date</p>
                  <p className="font-semibold text-surface-900 text-sm">{selectedBooking.date}</p>
                </div>
                <div className="p-3 bg-surface-50 rounded-xl border border-border">
                  <p className="text-xs text-surface-500 mb-1">Rent Amount</p>
                  <p className="font-semibold text-primary-600 text-sm">{selectedBooking.amount}</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-border bg-surface-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedBooking(null)}
                className="btn-secondary"
              >
                Close
              </button>
              {selectedBooking.status === 'Pending' && (
                <button 
                  onClick={() => {
                    toast.success(`Booking ${selectedBooking.id} approved!`);
                    setSelectedBooking(null);
                  }}
                  className="btn-primary"
                >
                  Approve Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
