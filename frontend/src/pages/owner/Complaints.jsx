import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComplaints, updateComplaint, selectComplaints, selectComplaintsLoading } from '../../store/slices/complaintSlice';
import { AlertCircle, Clock, CheckCircle2, MessageSquare, Search, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Complaints() {
  const dispatch = useDispatch();
  const complaints = useSelector(selectComplaints);
  const isLoading = useSelector(selectComplaintsLoading);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  const filteredComplaints = complaints.filter(cmp => {
    const term = searchTerm.toLowerCase();
    return (
      cmp.issue?.toLowerCase().includes(term) ||
      cmp.tenant?.name?.toLowerCase().includes(term) ||
      cmp._id.toLowerCase().includes(term) ||
      cmp.room?.roomNumber?.toLowerCase().includes(term)
    );
  });

  const summary = {
    open: complaints.filter(c => c.status === 'Open').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const updated = await dispatch(updateComplaint({ id: selectedComplaint._id, status: newStatus })).unwrap();
      setSelectedComplaint(updated);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error || "Failed to update status");
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
      const updated = await dispatch(updateComplaint({ id: selectedComplaint._id, replyText: replyText.trim() })).unwrap();
      setSelectedComplaint(updated);
      setReplyText('');
      toast.success("Reply sent!");
    } catch (error) {
      toast.error(error || "Failed to send reply");
    }
  };

  if (isLoading && complaints.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Complaints Hub</h1>
          <p className="text-surface-500 text-sm mt-0.5">Manage and resolve tenant issues</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search issues, tenants..." 
            className="input pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map(cmp => (
              <div key={cmp.id} className="card p-5 border-border bg-white hover:shadow-md transition-shadow group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl mt-1 ${cmp.priority === 'High' ? 'bg-danger-50 text-danger-500' : cmp.priority === 'Medium' ? 'bg-warning-50 text-warning-500' : 'bg-primary-50 text-primary-500'}`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-surface-900">{cmp._id.substring(cmp._id.length - 6).toUpperCase()}</span>
                      <span className="text-xs text-surface-500">• {new Date(cmp.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-surface-900 leading-tight">{cmp.issue}</h3>
                    <p className="text-sm text-surface-500 font-medium mt-1">
                      Reported by <span className="text-surface-700">{cmp.tenant?.name || 'Unknown'}</span> (Room {cmp.room?.roomNumber || 'Unknown'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col justify-between sm:items-end gap-3 sm:gap-2 border-t sm:border-0 border-border pt-4 sm:pt-0">
                  <span className={`badge ${cmp.status === 'Open' ? 'badge-danger' : cmp.status === 'In Progress' ? 'badge-warning' : 'badge-success'}`}>
                    {cmp.status}
                  </span>
                  <button 
                    onClick={() => setSelectedComplaint(cmp)}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Reply / View
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="card p-8 text-center text-surface-500 bg-white border-border">
              No complaints found matching "{searchTerm}"
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6 bg-white border-border">
            <h3 className="text-base font-bold text-surface-900 mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-surface-600">
                  <AlertCircle className="w-4 h-4 text-danger-500" /> Open
                </div>
                <span className="font-bold text-surface-900">{summary.open}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-surface-600">
                  <Clock className="w-4 h-4 text-warning-500" /> In Progress
                </div>
                <span className="font-bold text-surface-900">{summary.inProgress}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border pt-4">
                <div className="flex items-center gap-2 text-surface-600">
                  <CheckCircle2 className="w-4 h-4 text-success-500" /> Resolved
                </div>
                <span className="font-bold text-surface-900">{summary.resolved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-50 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-surface-900">{selectedComplaint._id.substring(selectedComplaint._id.length - 6).toUpperCase()}</h2>
                <p className="text-sm text-surface-500">Reported by {selectedComplaint.tenant?.name} (Room {selectedComplaint.room?.roomNumber})</p>
              </div>
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="text-surface-400 hover:text-surface-600 hover:bg-surface-200 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              <div className="bg-surface-50 p-4 rounded-xl border border-border">
                <h3 className="font-bold text-surface-900 mb-2">{selectedComplaint.issue}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-surface-500">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</span>
                  <select 
                    value={selectedComplaint.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="text-xs font-semibold bg-white border border-border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-surface-900">Communication History</h4>
                {selectedComplaint.replies.length === 0 ? (
                  <p className="text-sm text-surface-500 italic">No replies yet.</p>
                ) : (
                  selectedComplaint.replies.map((reply, idx) => (
                    <div key={idx} className="bg-primary-50 border border-primary-100 p-3 rounded-lg ml-8">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-primary-700">{reply.sender}</span>
                        <span className="text-xs text-primary-400">{new Date(reply.time).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-primary-900">{reply.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-border bg-surface-50 shrink-0">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type your reply..." 
                  className="input flex-1"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                />
                <button 
                  onClick={handleSendReply}
                  className="btn-primary px-4 flex items-center justify-center shrink-0"
                  disabled={!replyText.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
