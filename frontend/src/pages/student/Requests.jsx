import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTenantRequests, selectTenantRequests, selectJoinRequestLoading } from '../../store/slices/joinRequestSlice';
import { Building2, MapPin, Clock, FileText, CheckCircle2, XCircle, Search, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPaymentOrder, verifyPayment } from '../../store/slices/paymentSlice';

export default function StudentRequests() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const requests = useSelector(selectTenantRequests);
  const isLoading = useSelector(selectJoinRequestLoading);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchTenantRequests());
  }, [dispatch]);

  const handlePayment = async (request) => {
    try {
      
      const orderAction = await dispatch(createPaymentOrder(request._id));
      if (createPaymentOrder.rejected.match(orderAction)) {
        alert(orderAction.payload || 'Failed to create order');
        return;
      }
      
      const orderData = orderAction.payload;

      // 2. Setup Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock_key_id',
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'SmartStay',
        description: `Rent for Room ${request.room?.roomNumber}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // 3. Verify Payment
          const verifyData = {
            bookingId: orderData.bookingId,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          };
          
          const verifyAction = await dispatch(verifyPayment(verifyData));
          if (verifyPayment.fulfilled.match(verifyAction)) {
            alert('Payment Successful!');
            dispatch(fetchTenantRequests()); // Refresh requests to show Paid status
          } else {
            alert('Payment Verification Failed!');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on('payment.failed', function (response) {
        alert('Payment Failed: ' + response.error.description);
      });
      
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert('Something went wrong during payment initialization.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="badge badge-success flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>;
      case 'Rejected':
        return <span className="badge badge-danger flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      case 'Completed':
        return <span className="badge badge-success flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'Active':
        return <span className="badge badge-success flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>;
      case 'Cancelled':
        return <span className="badge badge-surface flex items-center gap-1 text-surface-600 bg-surface-100 border border-surface-200"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      case 'Pending':
        return <span className="badge badge-warning flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      default:
        return <span className="badge badge-surface flex items-center gap-1">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const activeReqs = requests.filter(req => ['Pending', 'Approved', 'Active'].includes(req.status));
  const historyReqs = requests.filter(req => ['Completed', 'Rejected', 'Cancelled'].includes(req.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">My Requests</h1>
          <p className="text-surface-500 mt-1">Track the status of your room joining requests.</p>
        </div>
        <Link to="/properties" className="btn-primary flex items-center gap-2">
          <Search className="w-4 h-4" />
          Browse Properties
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-surface-300 p-12 text-center">
          <FileText className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-surface-900 mb-2">No Requests Found</h3>
          <p className="text-surface-500 mb-6 max-w-sm mx-auto">
            You haven't requested to join any properties yet. Find your perfect stay today!
          </p>
          <Link to="/properties" className="btn-primary">Browse Properties</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {activeReqs.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-surface-900 mb-4">Current Requests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeReqs.map(req => (
                  <div key={req._id} className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                          <Building2 className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-surface-900 text-lg">{req.property?.name || 'Property'}</h3>
                          <div className="flex items-center text-sm text-surface-500 gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{req.property?.area}, {req.property?.city}</span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="bg-surface-50 rounded-xl p-4 grid grid-cols-2 gap-4 text-sm mt-2">
                      <div>
                        <p className="text-surface-500 mb-1">Room Number</p>
                        <p className="font-semibold text-surface-900">{req.room?.roomNumber}</p>
                      </div>
                      <div>
                        <p className="text-surface-500 mb-1">Rent</p>
                        <p className="font-semibold text-surface-900">₹{req.room?.rent}/mo</p>
                      </div>
                      <div>
                        <p className="text-surface-500 mb-1">Room Type</p>
                        <p className="font-semibold text-surface-900 capitalize">{req.room?.type} Sharing</p>
                      </div>
                      <div>
                        <p className="text-surface-500 mb-1">Requested On</p>
                        <p className="font-semibold text-surface-900">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {req.message && (
                      <div className="text-sm mt-4 border-t border-border pt-4">
                        <p className="font-medium text-surface-700 mb-1">Your Message:</p>
                        <p className="text-surface-600 bg-surface-50 p-3 rounded-lg">{req.message}</p>
                      </div>
                    )}
                    
                    {/* Payment Section */}
                    {req.status === 'Approved' && (
                      <div className="mt-4 pt-4 border-t border-border">
                        {req.paymentStatus === 'Paid' ? (
                          <div className="bg-success-50 rounded-xl p-4 flex flex-col gap-2 border border-success-100">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-success-700 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" /> Payment Successful ✅
                              </span>
                              <span className="font-bold text-success-700">₹{req.room?.rent}</span>
                            </div>
                            <div className="text-sm text-success-600 flex justify-between">
                              <span>Txn ID: {req.paymentId}</span>
                              <span>{new Date(req.paidAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-surface-50 rounded-xl p-4 border border-surface-200">
                            <div>
                              <p className="text-sm font-medium text-surface-900">Rent Payment Pending</p>
                              <p className="text-xs text-surface-500">Pay now to confirm your stay.</p>
                            </div>
                            <button 
                              onClick={() => handlePayment(req)}
                              className="btn-primary flex items-center gap-2"
                            >
                              <CreditCard className="w-4 h-4" />
                              Pay ₹{req.room?.rent}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {historyReqs.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-surface-900 mb-4 pt-4 border-t border-border">Request History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75 hover:opacity-100 transition-opacity">
                {historyReqs.map(req => (
                  <div key={req._id} className="bg-surface-50 rounded-2xl border border-border p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-200 flex items-center justify-center shrink-0">
                          <Building2 className="w-6 h-6 text-surface-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-surface-900 text-lg">{req.property?.name || 'Property'}</h3>
                          <div className="flex items-center text-sm text-surface-500 gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{req.property?.area}, {req.property?.city}</span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="bg-white rounded-xl p-4 grid grid-cols-2 gap-4 text-sm mt-2 border border-border">
                      <div>
                        <p className="text-surface-500 mb-1">Room Number</p>
                        <p className="font-semibold text-surface-900">{req.room?.roomNumber}</p>
                      </div>
                      <div>
                        <p className="text-surface-500 mb-1">Rent</p>
                        <p className="font-semibold text-surface-900">₹{req.room?.rent}/mo</p>
                      </div>
                      <div>
                        <p className="text-surface-500 mb-1">Room Type</p>
                        <p className="font-semibold text-surface-900 capitalize">{req.room?.type} Sharing</p>
                      </div>
                      <div>
                        <p className="text-surface-500 mb-1">Requested On</p>
                        <p className="font-semibold text-surface-900">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
