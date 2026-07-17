import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  getOwnerCheckoutRequests, 
  approveCheckoutRequest, 
  rejectCheckoutRequest,
  selectCheckoutRequests,
  selectCheckoutLoading 
} from "../../store/slices/checkoutSlice";
import { fetchOwnerDashboard } from "../../store/slices/dashboardSlice";
import { 
  ClipboardList, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Home,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function OwnerCheckouts() {
  const dispatch = useDispatch();
  const requests = useSelector(selectCheckoutRequests);
  const isLoading = useSelector(selectCheckoutLoading);

  useEffect(() => {
    dispatch(getOwnerCheckoutRequests());
  }, [dispatch]);

  const handleApprove = async (id) => {
    if (window.confirm("Are you sure you want to approve this check-out? This will mark the room as Vacant and complete the booking.")) {
      try {
        await dispatch(approveCheckoutRequest(id)).unwrap();
        toast.success("Check-out request approved successfully");
        dispatch(fetchOwnerDashboard());  
      } catch (error) {
        toast.error(error || "Failed to approve check-out");
      }
    }
  };

  const handleReject = async (id) => {
    const remark = window.prompt("Reason for rejection:");
    if (remark !== null) {
      try {
        await dispatch(rejectCheckoutRequest({ id, remark })).unwrap();
        toast.success("Check-out request rejected");
      } catch (error) {
        toast.error(error || "Failed to reject check-out");
      }
    }
  };

  if (isLoading && requests.length === 0) {
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
          <h1 className="text-2xl font-bold text-surface-900">Check-out Requests</h1>
          <p className="text-sm text-surface-500 mt-1">Manage tenant move-outs and room vacancies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests && requests.length > 0 ? (
          requests.map((req) => (
            <div key={req._id} className="card p-6 border-border flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              <div className="flex-1 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden shrink-0">
                    {req.tenant?.avatar?.url ? (
                      <img src={req.tenant.avatar.url} alt={req.tenant.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary-600 font-bold text-lg">{req.tenant?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900 text-lg">{req.tenant?.name}</h3>
                    <p className="text-surface-500 text-sm">{req.tenant?.email} • {req.tenant?.phone}</p>
                  </div>
                  
                  {req.status === 'Pending' && (
                    <span className="ml-auto badge-warning text-xs">Pending Approval</span>
                  )}
                  {req.status === 'Approved' && (
                    <span className="ml-auto badge-success text-xs">Approved</span>
                  )}
                  {req.status === 'Rejected' && (
                    <span className="ml-auto badge-danger text-xs">Rejected</span>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-50 p-4 rounded-xl border border-border">
                  <div>
                    <p className="text-xs text-surface-500 flex items-center gap-1 mb-1">
                      <Home className="w-3.5 h-3.5" /> Property & Room
                    </p>
                    <p className="font-semibold text-surface-900">{req.property?.name} • Room {req.room?.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 flex items-center gap-1 mb-1">
                      <Clock className="w-3.5 h-3.5" /> Requested Move-out
                    </p>
                    <p className="font-semibold text-surface-900">
                      {new Date(req.moveOutDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                {req.reason && (
                  <div className="flex gap-2 p-3 bg-primary-50 text-primary-900 rounded-xl border border-primary-100 text-sm">
                    <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-primary-500" />
                    <p><span className="font-semibold">Reason:</span> {req.reason}</p>
                  </div>
                )}
                
                {req.ownerRemark && (
                  <div className="flex gap-2 p-3 bg-danger-50 text-danger-900 rounded-xl border border-danger-100 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-danger-500" />
                    <p><span className="font-semibold">Owner Remark:</span> {req.ownerRemark}</p>
                  </div>
                )}
                
                <p className="text-xs text-surface-400">
                  Submitted on {new Date(req.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              {req.status === 'Pending' && (
                <div className="flex md:flex-col gap-3 shrink-0">
                  <button 
                    onClick={() => handleApprove(req._id)}
                    className="flex-1 md:flex-none btn-primary bg-success-600 hover:bg-success-700 border-0 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button 
                    onClick={() => handleReject(req._id)}
                    className="flex-1 md:flex-none btn-secondary text-danger-600 hover:bg-danger-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-surface-300 p-12 text-center">
            <ClipboardList className="w-16 h-16 text-surface-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-surface-900 mb-2">No Check-out Requests</h3>
            <p className="text-surface-500 max-w-md mx-auto">
              You're all caught up. There are no pending check-out requests from any tenants at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
