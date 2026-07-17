import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOwnerRequests, updateRequestStatus, selectOwnerRequests, selectJoinRequestLoading } from '../../store/slices/joinRequestSlice';
import { User, Building2, Calendar, FileText, Check, X, File, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OwnerRequests() {
  const dispatch = useDispatch();
  const requests = useSelector(selectOwnerRequests);
  const isLoading = useSelector(selectJoinRequestLoading);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    dispatch(fetchOwnerRequests());
  }, [dispatch]);

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;
    
    const resultAction = await dispatch(updateRequestStatus({ id, status }));
    if (updateRequestStatus.fulfilled.match(resultAction)) {
      toast.success(`Request ${status.toLowerCase()} successfully`);
    } else {
      toast.error(resultAction.payload || `Failed to ${status.toLowerCase()} request`);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'All') return true;
    return req.status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Join Requests</h1>
          <p className="text-surface-500 mt-1">Manage incoming requests from students/tenants.</p>
        </div>
        <div className="flex bg-white rounded-xl p-1 border border-border shadow-sm">
          {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status 
                  ? 'bg-primary-500 text-white shadow-sm' 
                  : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-surface-300 p-12 text-center">
          <FileText className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-surface-900 mb-2">No Requests Found</h3>
          <p className="text-surface-500">You don't have any {filter !== 'All' ? filter.toLowerCase() : ''} requests at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map(req => (
            <div key={req._id} className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {req.tenant?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900 text-lg">{req.tenant?.name}</h3>
                    <p className="text-sm text-surface-500">{req.tenant?.email}</p>
                  </div>
                </div>
                <span className={`badge ${
                  req.status === 'Approved' ? 'badge-success' : 
                  req.status === 'Rejected' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {req.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-surface-50 p-4 rounded-xl mb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-surface-500 text-xs font-medium mb-1 uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5" /> Property
                  </div>
                  <p className="font-semibold text-surface-900">{req.property?.name}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-surface-500 text-xs font-medium mb-1 uppercase tracking-wider">
                    <Check className="w-3.5 h-3.5" /> Room
                  </div>
                  <p className="font-semibold text-surface-900">{req.room?.roomNumber} (₹{req.room?.rent})</p>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5 text-surface-500 text-xs font-medium mb-1 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" /> Requested On
                  </div>
                  <p className="font-semibold text-surface-900">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {req.message && (
                <div className="mb-4 text-sm">
                  <p className="font-semibold text-surface-900 mb-1">Message:</p>
                  <p className="text-surface-600 bg-surface-50 p-3 rounded-lg border border-border">{req.message}</p>
                </div>
              )}

              {req.documents?.length > 0 && (
                <div className="mb-6">
                  <p className="font-semibold text-surface-900 text-sm mb-2">Documents:</p>
                  <div className="flex flex-wrap gap-2">
                    {req.documents.map((doc, i) => (
                      <a 
                        key={i} 
                        href={doc} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-50 border border-border rounded-lg text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                      >
                        <File className="w-3.5 h-3.5" /> Document {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {req.status === 'Pending' && (
                <div className="mt-auto pt-4 border-t border-border flex gap-3">
                  <button 
                    onClick={() => handleUpdateStatus(req._id, 'Rejected')}
                    className="btn-secondary flex-1 border-danger-200 text-danger-600 hover:bg-danger-50 hover:border-danger-300"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(req._id, 'Approved')}
                    className="btn-primary flex-1 bg-success-500 hover:bg-success-600 text-white"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
