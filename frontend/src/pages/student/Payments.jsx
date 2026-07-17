import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchTenantRequests, selectTenantRequests, selectJoinRequestLoading } from '../../store/slices/joinRequestSlice';
import { fetchPaymentHistory, selectPayments, selectPaymentLoading } from '../../store/slices/paymentSlice';
import { DollarSign, Clock, Download, FileText, CheckCircle2, Building2, Search } from 'lucide-react';
import { createPaymentOrder, verifyPayment } from '../../store/slices/paymentSlice';

export default function StudentPayments() {
  const dispatch = useDispatch();
  const requests = useSelector(selectTenantRequests);
  const isReqLoading = useSelector(selectJoinRequestLoading);
  
  const payments = useSelector(selectPayments);
  const isPayLoading = useSelector(selectPaymentLoading);
  
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchTenantRequests());
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  const approvedRequest = requests.find(req => req.status === 'Approved');

  if (isReqLoading || isPayLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const rent = approvedRequest?.room?.rent || 0;
  const isRentPaid = approvedRequest?.paymentStatus === 'Paid';

  const handlePayment = async (request) => {
    try {
      
      const orderAction = await dispatch(createPaymentOrder(request._id));
      if (createPaymentOrder.rejected.match(orderAction)) {
        alert(orderAction.payload || 'Failed to create order');
        return;
      }
      
      const orderData = orderAction.payload;

     
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
            dispatch(fetchTenantRequests());
            dispatch(fetchPaymentHistory());
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Rent & Payments</h1>
          <p className="text-surface-500 text-sm mt-0.5">Manage your rent, dues, and payment history</p>
        </div>
      </div>

      {approvedRequest && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 border-2 border-primary-500 bg-primary-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-bl-full -mr-8 -mt-8" />
            <div className="relative">
              <h3 className="text-lg font-bold text-primary-900 mb-1">Next Rent Due</h3>
              <p className="text-sm text-primary-700 mb-4">
                {isRentPaid ? 'Next month' : 'Due for current booking'}
              </p>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-bold text-primary-600">₹{rent}</span>
              </div>
              {isRentPaid ? (
                 <button className="btn-secondary w-full flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                   <CheckCircle2 className="w-4 h-4" /> Paid
                 </button>
              ) : (
                 <button onClick={() => handlePayment(approvedRequest)} className="btn-primary w-full flex items-center justify-center gap-2">
                   <DollarSign className="w-4 h-4" /> Pay Now
                 </button>
              )}
            </div>
          </div>

          <div className="card p-6 border-border flex flex-col justify-center text-center">
            <div className={`w-16 h-16 ${isRentPaid ? 'bg-success-50' : 'bg-warning-50'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {isRentPaid ? (
                <CheckCircle2 className="w-8 h-8 text-success-500" />
              ) : (
                <Clock className="w-8 h-8 text-warning-500" />
              )}
            </div>
            <h3 className="text-lg font-bold text-surface-900">
              {isRentPaid ? 'All Clear!' : 'Action Required'}
            </h3>
            <p className="text-surface-500 text-sm">
              {isRentPaid 
                ? 'You have no pending dues for previous months.' 
                : 'Please pay your pending rent to confirm your stay.'}
            </p>
          </div>
        </div>
      )}

      <div className="card bg-white border border-border p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-surface-900">Payment History</h3>
        </div>
        
        <div className="space-y-4">
          {payments && payments.length > 0 ? payments.map((hist) => (
            <div key={hist._id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-surface-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-surface-100 rounded-lg text-surface-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-surface-900">Room {hist.roomId?.roomNumber}</p>
                  <p className="text-xs text-surface-500">
                    {new Date(hist.paidAt).toLocaleDateString()} • Txn: {hist.paymentId}
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="font-bold text-surface-900 mb-1 flex items-center gap-4">
                  ₹{hist.amount}
                  
                  <button onClick={() => window.print()} className="btn-secondary text-xs px-2 py-1 flex items-center gap-1">
                    <Download className="w-3 h-3" /> Receipt
                  </button>
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-600 bg-success-50 px-2 py-0.5 rounded-md border border-success-200">
                  <CheckCircle2 className="w-3 h-3" /> {hist.status}
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center py-6 text-surface-500 text-sm bg-surface-50 rounded-xl border border-dashed border-border">
              No payment history available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
