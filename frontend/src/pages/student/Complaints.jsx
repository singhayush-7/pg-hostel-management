import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchTenantRequests, selectTenantRequests, selectJoinRequestLoading } from '../../store/slices/joinRequestSlice';
import { fetchComplaints, createComplaint, selectComplaints, selectComplaintsLoading } from '../../store/slices/complaintSlice';
import { Plus, MessageSquare, AlertCircle, X, Building2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_COMPLAINTS = [];

export default function StudentComplaints() {
  const dispatch = useDispatch();
  const requests = useSelector(selectTenantRequests);
  const isLoading = useSelector(selectJoinRequestLoading);

  const complaints = useSelector(selectComplaints);
  const isComplaintsLoading = useSelector(selectComplaintsLoading);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ issue: '', priority: 'Medium' });

  useEffect(() => {
    dispatch(fetchTenantRequests());
    dispatch(fetchComplaints());
  }, [dispatch]);

  const approvedRequest = requests.find(req => req.status === 'Approved');

  const handleRaiseComplaint = async (e) => {
    e.preventDefault();
    if (!newComplaint.issue.trim()) {
      toast.error('Please describe your issue');
      return;
    }
    
    try {
      await dispatch(createComplaint({
        issue: newComplaint.issue,
        priority: newComplaint.priority
      })).unwrap();
      
      setIsModalOpen(false);
      setNewComplaint({ issue: '', priority: 'Medium' });
      toast.success('Complaint raised successfully!');
    } catch (error) {
      toast.error(error || 'Failed to raise complaint');
    }
  };

  if (isLoading || isComplaintsLoading) {
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
          <h1 className="text-2xl font-bold text-surface-900">My Complaints</h1>
          <p className="text-surface-500 text-sm mt-0.5">Report issues and track their resolution status</p>
        </div>
        {approvedRequest && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Raise Complaint
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {complaints.length > 0 ? complaints.map(cmp => (
            <div key={cmp._id} className="card p-5 border-border bg-white hover:shadow-md transition-shadow group flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl mt-1 ${cmp.status === 'Resolved' ? 'bg-success-50 text-success-500' : cmp.status === 'Open' ? 'bg-primary-50 text-primary-500' : 'bg-warning-50 text-warning-500'}`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-surface-900">{cmp._id.substring(cmp._id.length - 6).toUpperCase()}</span>
                      <span className="text-xs text-surface-500">• {new Date(cmp.createdAt).toLocaleDateString()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cmp.priority === 'High' ? 'bg-danger-50 text-danger-600' : 'bg-surface-100 text-surface-600'}`}>{cmp.priority} Priority</span>
                    </div>
                    <h3 className="text-lg font-bold text-surface-900 leading-tight">{cmp.issue}</h3>
                    <span className={`inline-block mt-2 badge ${cmp.status === 'Resolved' ? 'badge-success' : cmp.status === 'Open' ? 'badge-primary' : 'badge-warning'}`}>
                      {cmp.status}
                    </span>
                  </div>
                </div>
              </div>

              {cmp.replies && cmp.replies.length > 0 && (
                <div className="mt-2 pt-4 border-t border-border space-y-3">
                  <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider">Communication History</h4>
                  <div className="space-y-3">
                    {cmp.replies.map((reply, idx) => (
                      <div key={idx} className={`p-3 rounded-lg text-sm ${reply.sender === 'Owner' ? 'bg-primary-50 border border-primary-100 ml-4' : 'bg-surface-50 border border-border mr-4'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold ${reply.sender === 'Owner' ? 'text-primary-700' : 'text-surface-700'}`}>{reply.sender}</span>
                          <span className="text-[10px] text-surface-500">{new Date(reply.time).toLocaleDateString()}</span>
                        </div>
                        <p className={`text-sm ${reply.sender === 'Owner' ? 'text-primary-900' : 'text-surface-700'}`}>{reply.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div className="card p-8 border-border bg-white text-center border-dashed">
              <MessageSquare className="w-12 h-12 text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500 text-sm">No complaints raised yet. You're all good!</p>
            </div>
          )}
        </div>

        {approvedRequest && (
          <div className="card p-6 bg-surface-50 border-border text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-bold text-surface-900 mb-2">Need Help?</h3>
            <p className="text-surface-500 text-sm mb-6">Contact the property manager directly for urgent issues.</p>
            <a 
              href={`mailto:${approvedRequest.property?.owner?.email || 'manager@smartstay.com'}?subject=Urgent Assistance Needed - Room ${approvedRequest.room?.roomNumber}`}
              className="btn-secondary w-full flex justify-center items-center gap-2"
            >
              Contact Manager
            </a>
          </div>
        )}
      </div>

      {/* Raise Complaint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-bold text-lg text-surface-900">Raise New Complaint</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRaiseComplaint} className="p-5 space-y-4">
              <div>
                <label className="input-label">Issue Description</label>
                <textarea
                  value={newComplaint.issue}
                  onChange={(e) => setNewComplaint({...newComplaint, issue: e.target.value})}
                  className="input min-h-[100px] py-3"
                  placeholder="E.g. The AC in my room is not cooling properly..."
                  autoFocus
                />
              </div>
              
              <div>
                <label className="input-label">Priority</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Low', 'Medium', 'High'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewComplaint({...newComplaint, priority: p})}
                      className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                        newComplaint.priority === p 
                          ? 'border-primary-500 bg-primary-50 text-primary-600' 
                          : 'border-border bg-white text-surface-600 hover:border-surface-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                  disabled={isComplaintsLoading}
                >
                  {isComplaintsLoading ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
