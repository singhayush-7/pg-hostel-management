import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { selectUser } from "../../store/slices/authSlice";
import { fetchTenantRequests, selectTenantRequests, selectJoinRequestLoading } from "../../store/slices/joinRequestSlice";
import { fetchComplaints, selectComplaints } from "../../store/slices/complaintSlice";
import { getMyCheckoutRequest, submitCheckoutRequest, selectMyCheckoutRequests, selectCheckoutLoading, clearCheckoutSuccess, selectCheckoutSuccess } from "../../store/slices/checkoutSlice";
import { fetchPaymentHistory, selectPayments } from "../../store/slices/paymentSlice";
import { 
  CreditCard, 
  MessageSquareWarning, 
  Bell, 
  Home,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Wifi,
  Wind,
  Bath,
  Building2,
  Search
} from "lucide-react";

 

const roommates = [];
const notices = [];
 
const StudentDashboard = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  
  const requests = useSelector(selectTenantRequests);
  const isLoading = useSelector(selectJoinRequestLoading);
  const complaints = useSelector(selectComplaints);
  
  const myCheckouts = useSelector(selectMyCheckoutRequests);
  const isCheckoutLoading = useSelector(selectCheckoutLoading);
  const checkoutSuccess = useSelector(selectCheckoutSuccess);
  const payments = useSelector(selectPayments);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [moveOutDate, setMoveOutDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    dispatch(fetchTenantRequests());
    dispatch(fetchComplaints());
    dispatch(getMyCheckoutRequest());
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  useEffect(() => {
    if (checkoutSuccess) {
      setIsCheckoutModalOpen(false);
      dispatch(clearCheckoutSuccess());
      dispatch(getMyCheckoutRequest());
    }
  }, [checkoutSuccess, dispatch]);

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    dispatch(submitCheckoutRequest({ moveOutDate, reason }));
  };

  const approvedRequest = requests.find((req) => req.status === "Approved" || req.status === "Active");
  const completedRequest = requests.find((req) => req.status === "Completed");
  const pendingCheckout = myCheckouts.find(req => req.status === 'Pending');
  const approvedCheckout = myCheckouts.find(req => req.status === 'Approved');

  const isRentPaid = approvedRequest?.paymentStatus === 'Paid';

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
          <h1 className="text-2xl font-bold text-surface-900">👋 welcome, {user?.name || "Tenant"}</h1>
          <p className="text-sm text-surface-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}, {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {!approvedRequest ? (
        approvedCheckout || completedRequest ? (
          <div className="bg-white rounded-2xl border border-dashed border-success-300 p-12 text-center mt-6">
            <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-surface-900 mb-2">Booking Completed</h3>
            <p className="text-surface-500 mb-8 max-w-md mx-auto">
              You have successfully checked out of your room. You can now browse available properties and submit a new join request.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/properties" className="btn-primary flex items-center gap-2">
                <Search className="w-4 h-4" />
                Find New Property
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-surface-300 p-12 text-center mt-6">
            <Building2 className="w-16 h-16 text-surface-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-surface-900 mb-2">No Active Room Assigned</h3>
            <p className="text-surface-500 mb-8 max-w-md mx-auto">
              You currently do not have an approved room assignment. You can browse available properties and submit a join request to get started.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/properties" className="btn-primary flex items-center gap-2">
                <Search className="w-4 h-4" />
                Browse Properties
              </Link>
              <Link to="/student/requests" className="btn-secondary flex items-center gap-2">
                <FileText className="w-4 h-4" />
                View My Requests
              </Link>
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="font-semibold text-surface-900 mb-4">My Room</h3>
              <div className="flex gap-4 mb-5">
                <div className="w-24 h-24 rounded-xl bg-surface-100 flex items-center justify-center shrink-0">
                   <Building2 className="w-8 h-8 text-surface-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-surface-900">Room {approvedRequest.room?.roomNumber}</h4>
                  <p className="text-sm text-surface-500">{approvedRequest.property?.name}</p>
                  <div className="badge-success mt-2">
                    Occupied
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-500">Rent</span>
                  <span className="font-semibold text-surface-900">₹{approvedRequest.room?.rent} / month</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-500">Due Date</span>
                  <span className="font-medium text-surface-900">1st of Month</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-500">Status</span>
                  <span className={isRentPaid ? "badge-success text-xs" : "badge-warning text-xs"}>
                    {isRentPaid ? "Paid" : "Unpaid"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-500">Joined On</span>
                  <span className="font-medium text-surface-900">
                    {new Date(approvedRequest.updatedAt || approvedRequest.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <Link to="/student/room" className="btn-secondary w-full mt-6 flex justify-center">View Room Details</Link>
              {pendingCheckout ? (
                <div className="mt-4 p-4 rounded-xl bg-warning-50 border border-warning-200 text-center">
                  <p className="text-warning-800 font-semibold mb-1">Check-out Request</p>
                  <p className="text-warning-600 text-sm">Status: Pending Approval</p>
                </div>
              ) : (
                <button 
                  onClick={() => setIsCheckoutModalOpen(true)}
                  className="btn-primary bg-danger-600 hover:bg-danger-700 w-full mt-4 flex justify-center border-0"
                >
                  Request Check-out
                </button>
              )}
            </div>

          <div className="card p-5">
            <h3 className="font-semibold text-surface-900 mb-4">Roommates</h3>
            <div className="space-y-4">
              {roommates.length > 0 ? roommates.map((rm, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img src={rm.avatar} alt={rm.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-surface-900">{rm.name}</p>
                    <p className="text-xs text-surface-500">{rm.phone}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4 text-surface-500 text-sm">No roommates yet</div>
              )}
            </div>
          </div>
        </div>

       
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-surface-900">Rent Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-surface-50 border border-border">
                <p className="text-xs text-surface-500 mb-1">This Month</p>
                <p className="text-xl font-bold text-surface-900">₹{approvedRequest.room?.rent}</p>
                <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isRentPaid ? 'text-success-600 bg-success-50' : 'text-warning-600 bg-warning-50'}`}>
                  {isRentPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {isRentPaid ? 'Paid' : 'Unpaid'}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-50 border border-border">
                <p className="text-xs text-surface-500 mb-1">Next Due</p>
                <p className="text-xl font-bold text-surface-900">₹{approvedRequest.room?.rent}</p>
                <div className="mt-2 text-xs font-medium text-surface-500">
                  1st of Next Month
                </div>
              </div>
            </div>
            {isRentPaid ? (
              <button disabled className="btn-secondary w-full mb-6 flex justify-center opacity-50 cursor-not-allowed">
                Rent Paid
              </button>
            ) : (
              <Link to="/student/payments" className="btn-primary w-full mb-6 flex justify-center">Pay Rent Now</Link>
            )}

            <h4 className="text-sm font-semibold text-surface-900 mb-3">Payment History</h4>
            <div className="space-y-3">
              {payments && payments.length > 0 ? payments.slice(0, 3).map((hist) => (
                <div key={hist._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-100 text-surface-600">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-surface-900">
                      {new Date(hist.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-surface-900">₹{hist.amount}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success-50 text-success-600">
                      {hist.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-surface-500 text-sm bg-surface-50 rounded-xl">No payment history available</div>
              )}
            </div>
            <Link to="/student/payments" className="block w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium mt-4">
              View all payments
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-surface-900">Active Complaints</h3>
              </div>
              <div className="space-y-4">
                {complaints.length > 0 ? complaints.map((c) => (
                  <div key={c._id} className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <MessageSquareWarning className="w-5 h-5 text-surface-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-surface-900">{c.issue}</p>
                        <p className="text-xs text-surface-500 mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.status === 'Resolved' ? 'bg-success-50 text-success-600' : c.status === 'Open' ? 'bg-primary-50 text-primary-600' : 'bg-warning-50 text-warning-600'}`}>
                      {c.status}
                    </span>
                  </div>
                )) : (
                  <div className="text-center py-6 text-surface-500 text-sm">No active complaints</div>
                )}
              </div>
              <Link to="/student/complaints" className="block w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium mt-4">
                View all complaints
              </Link>
            </div>

            {/* Recent Notices */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-surface-900">Recent Notices</h3>
              </div>
              <div className="space-y-4">
                {notices.length > 0 ? notices.map((n, idx) => (
                  <div key={idx} className="flex gap-3">
                    <n.icon className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-surface-900">{n.title}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-surface-500 text-sm">No recent notices</div>
                )}
              </div>
              <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium mt-4" onClick={() => alert("Notices coming soon!")}>
                View all notices
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Check-out Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold text-surface-900">Request Check-out</h3>
              <p className="text-sm text-surface-500 mt-1">Please provide your move-out details.</p>
            </div>
            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Move-out Date</label>
                <input
                  type="date"
                  required
                  value={moveOutDate}
                  onChange={(e) => setMoveOutDate(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Reason (Optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  rows="3"
                  placeholder="Why are you moving out?"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-surface-600 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCheckoutLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-danger-600 hover:bg-danger-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isCheckoutLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
