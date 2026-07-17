import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOwnerDashboard, selectDashboardData } from '../../store/slices/dashboardSlice';
import { fetchPaymentHistory, selectPayments } from '../../store/slices/paymentSlice';
import { DollarSign, ArrowUpRight, ArrowDownRight, Search, Download, CheckCircle, Clock } from 'lucide-react';

export default function Payments() {
  const dispatch = useDispatch();
  const dashboardData = useSelector(selectDashboardData);
  const recentPayments = useSelector(selectPayments);

  useEffect(() => {
    dispatch(fetchOwnerDashboard());
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  const overview = dashboardData?.overview || {};

  const monthlyRevenue = overview.monthlyRevenue || 0;
  const totalRevenue = overview.totalRevenue || 0;
  const rentDue = overview.rentDue || 0;
  const tenantsOwingRent = rentDue === 0 ? 0 : (overview.tenantsOwingRent || 0);
  const lastPayment = recentPayments?.length > 0 ? recentPayments[0] : null;
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Payments & Revenue</h1>
          <p className="text-surface-500 text-sm mt-0.5">Track rent collection and financial history</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-primary-600 text-white border-0 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary-100 font-medium">Total Revenue (This Month)</p>
              <h2 className="text-3xl font-bold mt-2">₹{monthlyRevenue.toLocaleString('en-IN')}</h2>
            </div>
            <div className="p-3 bg-primary-500 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-primary-100">
            <span className="font-semibold">Current Month</span>
          </div>
        </div>
        
        <div className="card p-6 border-border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-surface-500 font-medium">Pending Dues</p>
              <h2 className="text-3xl font-bold mt-2 text-surface-900">₹{rentDue.toLocaleString('en-IN')}</h2>
            </div>
            <div className="p-3 bg-warning-50 rounded-xl">
              <Clock className="w-6 h-6 text-warning-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-surface-500">
            {tenantsOwingRent === 0 ? (
              <span className="text-success-600 font-semibold">No tenants have overdue rent</span>
            ) : (
              <><span className="font-semibold text-warning-600">{tenantsOwingRent} Tenants</span> have overdue rent</>
            )}
          </div>
        </div>


        <div className="card p-6 border-border bg-success-50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-surface-600 font-medium">All-Time Revenue</p>
              <h2 className="text-3xl font-bold mt-2 text-surface-900">₹{totalRevenue.toLocaleString('en-IN')}</h2>
            </div>
            <div className="p-3 bg-success-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-surface-600">
            Across all properties
          </div>
        </div>
      </div>

      <div className="card bg-white border border-border p-4 mt-8">
        <h3 className="text-lg font-bold text-surface-900 mb-4 px-2">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-surface-500 text-sm font-semibold">
                <th className="pb-3 pl-4">Transaction ID</th>
                <th className="pb-3">Tenant & Room</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments && recentPayments.length > 0 ? recentPayments.map((payment) => (
                <tr key={payment._id} className="border-b border-border last:border-0 hover:bg-surface-50 transition-colors">
                  <td className="py-4 pl-4 font-medium text-surface-900">{(payment.paymentId || payment._id).slice(-8).toUpperCase()}</td>
                  <td className="py-4">
                    <p className="font-bold text-surface-900">{payment.tenantId?.name || 'Unknown'}</p>
                    <p className="text-xs text-surface-500">Room {payment.roomId?.roomNumber || 'Unknown'}</p>
                  </td>
                  <td className="py-4 text-surface-700">{payment.paymentMethod || 'Razorpay'}</td>
                  <td className="py-4 text-surface-700">{new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 font-bold text-surface-900">₹{payment.amount.toLocaleString('en-IN')}</td>
                  <td className="py-4">
                    {payment.status === 'Paid' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-600 bg-success-50 px-2.5 py-1 rounded-full border border-success-200">
                        <CheckCircle className="w-3.5 h-3.5" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning-600 bg-warning-50 px-2.5 py-1 rounded-full border border-warning-200">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-surface-500">
                    No recent transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
