import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOwnerRequests, selectOwnerRequests, selectJoinRequestLoading } from '../../store/slices/joinRequestSlice';
import { Search, Filter, Mail, Phone, MoreHorizontal, ShieldCheck, User, X, MapPin, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  'Active': 'bg-success-50 text-success-600 border-success-200',
  'Notice Period': 'bg-warning-50 text-warning-600 border-warning-200',
  'Evicted': 'bg-danger-50 text-danger-600 border-danger-200',
};

const RENT_COLORS = {
  'Paid': 'text-success-600',
  'Pending': 'text-warning-600',
  'Overdue': 'text-danger-600',
};

export default function Tenants() {
  const dispatch = useDispatch();
  const ownerRequests = useSelector(selectOwnerRequests) || [];
  const isLoading = useSelector(selectJoinRequestLoading);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    dispatch(fetchOwnerRequests());
  }, [dispatch]);

  const activeTenants = ownerRequests.filter(req => req.status === 'Approved');

  const filteredTenants = activeTenants.filter((req) => {
    const term = searchTerm.toLowerCase();
    const name = req.tenant?.name || '';
    const propName = req.property?.name || '';
    const id = req._id || '';

    return (
      name.toLowerCase().includes(term) ||
      id.toLowerCase().includes(term) ||
      propName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Tenants</h1>
          <p className="text-surface-500 text-sm mt-0.5">Manage and view all your active tenants</p>
        </div>
        <button 
          onClick={() => toast.success('Exporting tenant data...')}
          className="btn-primary"
        >
          Export CSV
        </button>
      </div>

      <div className="card bg-white border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by tenant name, ID, or property..."
              className="input pl-10 bg-surface-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => toast('Advanced filtering coming soon!', { icon: '🚧' })}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-surface-500 text-sm font-semibold">
                <th className="pb-3 pl-4">Tenant Details</th>
                <th className="pb-3">Property & Room</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Rent Status</th>
                <th className="pb-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && activeTenants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-surface-500">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                    </div>
                    Loading tenants...
                  </td>
                </tr>
              ) : filteredTenants.length > 0 ? (
                filteredTenants.map((req) => {
                  const tenantName = req.tenant?.name || 'Unknown User';
                  const avatar = req.tenant?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tenantName)}&background=random`;
                  const propName = req.property?.name || 'Unknown Property';
                  const roomName = req.room ? `${req.room.roomNumber} (${req.room.type})` : 'Unknown Room';
                  const date = new Date(req.createdAt).toLocaleDateString();
                  const phone = req.tenant?.phone || 'N/A';
                  const email = req.tenant?.email || 'N/A';
                  
                  return (
                    <tr key={req._id} className="border-b border-border last:border-0 hover:bg-surface-50 transition-colors group">
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <img src={avatar} alt={tenantName} className="w-10 h-10 rounded-full border border-border object-cover" />
                          <div>
                            <p className="font-bold text-surface-900">{tenantName}</p>
                            <p className="text-xs text-surface-500">{(req._id).slice(-6).toUpperCase()} • Joined {date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="font-medium text-surface-900">{propName}</p>
                        <p className="text-sm text-surface-500">Room {roomName}</p>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1 text-sm text-surface-600">
                          <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-surface-400" /> {phone}</span>
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-surface-400" /> {email}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS['Active']}`}>
                          Active
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`font-semibold text-sm ${RENT_COLORS['Paid']}`}>
                          Paid
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setSelectedTenant(req)}
                            className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <User className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => window.location.href = `mailto:${email}`}
                            className="p-2 text-surface-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                            title="Contact Tenant"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-surface-500">
                    No tenants found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
 
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-50">
              <h2 className="text-lg font-bold text-surface-900">Tenant Profile</h2>
              <button 
                onClick={() => setSelectedTenant(null)}
                className="text-surface-400 hover:text-surface-600 hover:bg-surface-200 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4">
                <img src={selectedTenant.tenant?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTenant.tenant?.name || 'Unknown User')}&background=random`} alt={selectedTenant.tenant?.name || 'Unknown User'} className="w-20 h-20 rounded-full border-2 border-border shadow-sm object-cover" />
                <div>
                  <h3 className="text-2xl font-bold text-surface-900">{selectedTenant.tenant?.name || 'Unknown User'}</h3>
                  <p className="text-surface-500 font-medium">{(selectedTenant._id).slice(-6).toUpperCase()}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 mt-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${STATUS_COLORS['Active']}`}>
                    Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl border border-border">
                  <div className="p-2 bg-white rounded-lg border border-border shadow-sm">
                    <MapPin className="w-4 h-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 font-medium">Accommodation</p>
                    <p className="text-sm font-semibold text-surface-900">{selectedTenant.property?.name || 'Unknown Property'} — Room {selectedTenant.room?.roomNumber || 'Unknown Room'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl border border-border">
                  <div className="p-2 bg-white rounded-lg border border-border shadow-sm">
                    <Calendar className="w-4 h-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 font-medium">Join Date</p>
                    <p className="text-sm font-semibold text-surface-900">{new Date(selectedTenant.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl border border-border">
                  <div className="p-2 bg-white rounded-lg border border-border shadow-sm">
                    <Phone className="w-4 h-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 font-medium">Contact Details</p>
                    <p className="text-sm font-semibold text-surface-900">{selectedTenant.tenant?.phone || 'N/A'}</p>
                    <p className="text-sm text-surface-600">{selectedTenant.tenant?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl border border-border">
                  <div className="p-2 bg-white rounded-lg border border-border shadow-sm">
                    <CreditCard className="w-4 h-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 font-medium">Current Rent Status</p>
                    <p className={`text-sm font-semibold ${RENT_COLORS['Paid']}`}>
                      Paid
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-border bg-surface-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedTenant(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
