import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchTenantRequests, selectTenantRequests, selectJoinRequestLoading } from '../../store/slices/joinRequestSlice';
import { Wifi, Wind, Bath, Shield, MapPin, User, FileText, CheckCircle2, Building2, Search } from 'lucide-react';

export default function StudentRoom() {
  const dispatch = useDispatch();
  const requests = useSelector(selectTenantRequests);
  const isLoading = useSelector(selectJoinRequestLoading);

  useEffect(() => {
    dispatch(fetchTenantRequests());
  }, [dispatch]);

  const approvedRequest = requests.find(req => req.status === 'Approved' || req.status === 'Active');
  const historyRequests = requests.filter(req => req.status === 'Completed' || req.status === 'Cancelled' || req.status === 'Rejected');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!approvedRequest) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-dashed border-surface-300 p-12 text-center mt-6">
          <Building2 className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-surface-900 mb-2">No Active Room</h3>
          <p className="text-surface-500 mb-8 max-w-md mx-auto">
            You currently don't have an approved room assignment to view details for.
          </p>
          <Link to="/properties" className="btn-primary inline-flex items-center gap-2">
            <Search className="w-4 h-4" />
            Browse Properties
          </Link>
        </div>
        
        {historyRequests.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-surface-900 mb-4">Booking History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historyRequests.map(req => (
                <div key={req._id} className="card p-5 border border-border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-surface-900">Room {req.room?.roomNumber || 'N/A'}</h3>
                      <p className="text-surface-500 text-sm">{req.property?.name || 'Property Unavailable'}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      req.status === 'Completed' ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="text-sm text-surface-600 space-y-1">
                    <p>Rent: ₹{req.room?.rent || 0}</p>
                    <p>Booked on: {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const { room, property, owner } = approvedRequest;

  const startDate = new Date(approvedRequest.updatedAt || approvedRequest.createdAt);
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);
  const securityDeposit = room?.deposit || 0;
  const lockInPeriod = room?.lockInPeriod || property?.lockInPeriod || "6 Months";

  const handleDownloadAgreement = () => {
    const agreementContent = `
LEASE AGREEMENT
-------------------
Property: ${property?.name || "SmartStay Property"}
Address: ${property?.area || ""}, ${property?.city || ""}
Room Number: ${room?.roomNumber || "N/A"}
Tenant ID: ${approvedRequest.tenant || "N/A"}

Lease Terms:
- Start Date: ${startDate.toLocaleDateString()}
- End Date: ${endDate.toLocaleDateString()}
- Monthly Rent: INR ${room?.rent || 0}
- Security Deposit: INR ${securityDeposit}
- Lock-in Period: ${lockInPeriod}

This is a digitally generated lease agreement for your records.
    `;
    const blob = new Blob([agreementContent.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lease_Agreement_${room?.roomNumber || 'Room'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">My Room</h1>
          <p className="text-surface-500 text-sm mt-0.5">View your lease and room information</p>
        </div>
        <div className="badge-success px-3 py-1.5 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Active Lease
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="h-64 overflow-hidden relative">
              <img 
                src={room?.images?.[0]?.url || property?.photos?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80"}
                alt="Room Image" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-surface-900 shadow-sm">
                  Room {room?.roomNumber}
                </span>
                <span className="bg-primary-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm capitalize">
                  {room?.type} Sharing
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-surface-900">{property?.name}</h2>
                  <p className="text-surface-500 text-sm mt-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {property?.area}, {property?.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">₹{room?.rent}</p>
                  <p className="text-xs text-surface-500">per month</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
                {(room?.hasWiFi || property?.amenities?.includes("WiFi")) && (
                  <div className="flex flex-col items-center p-3 rounded-xl bg-surface-50 text-center">
                    <Wifi className="w-6 h-6 text-primary-500 mb-2" />
                    <span className="text-sm font-medium text-surface-900">Free WiFi</span>
                  </div>
                )}
                {(room?.isAC || property?.amenities?.includes("AC")) && (
                  <div className="flex flex-col items-center p-3 rounded-xl bg-surface-50 text-center">
                    <Wind className="w-6 h-6 text-primary-500 mb-2" />
                    <span className="text-sm font-medium text-surface-900">Air Conditioned</span>
                  </div>
                )}
                {room?.hasAttachedBath && (
                  <div className="flex flex-col items-center p-3 rounded-xl bg-surface-50 text-center">
                    <Bath className="w-6 h-6 text-primary-500 mb-2" />
                    <span className="text-sm font-medium text-surface-900">Attached Bath</span>
                  </div>
                )}
                {(room?.hasFood || property?.amenities?.includes("Food")) && (
                  <div className="flex flex-col items-center p-3 rounded-xl bg-surface-50 text-center">
                    <CheckCircle2 className="w-6 h-6 text-primary-500 mb-2" />
                    <span className="text-sm font-medium text-surface-900">Food Included</span>
                  </div>
                )}
                {property?.amenities?.includes("Security Guard") && (
                  <div className="flex flex-col items-center p-3 rounded-xl bg-surface-50 text-center">
                    <Shield className="w-6 h-6 text-primary-500 mb-2" />
                    <span className="text-sm font-medium text-surface-900">24x7 Security</span>
                  </div>
                )}
                {!(room?.hasWiFi || property?.amenities?.includes("WiFi")) && 
                 !(room?.isAC || property?.amenities?.includes("AC")) && 
                 !room?.hasAttachedBath && 
                 !(room?.hasFood || property?.amenities?.includes("Food")) && 
                 !property?.amenities?.includes("Security Guard") && (
                   <p className="col-span-2 sm:col-span-4 text-surface-500 text-sm text-center py-4">
                     No specific facilities listed.
                   </p>
                )}
              </div>
            </div>
          </div>
        </div>

       
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" /> Lease Agreement
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-surface-500">Start Date</span>
                <span className="font-semibold text-surface-900">
                  {startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-surface-500">End Date</span>
                <span className="font-semibold text-surface-900">
                  {endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-surface-500">Security Deposit</span>
                <span className="font-semibold text-surface-900">₹{securityDeposit}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-surface-500">Lock-in Period</span>
                <span className="font-semibold text-surface-900">{lockInPeriod}</span>
              </div>
            </div>
            
            <button 
              onClick={handleDownloadAgreement}
              className="btn-secondary w-full mt-6"
            >
              Download Agreement
            </button>
          </div>

          <div className="card p-6 bg-primary-600 text-white border-0">
            <h3 className="font-bold text-primary-100 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Property Manager
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center font-bold text-lg">
                {property?.owner?.name?.charAt(0) || "M"}
              </div>
              <div>
                <p className="font-bold">{property?.owner?.name || "Manager"}</p>
                <p className="text-sm text-primary-200">{property?.owner?.email}</p>
              </div>
            </div>
            <a 
              href={`mailto:${property?.owner?.email || 'manager@smartstay.com'}?subject=Inquiry from Tenant - Room ${room?.roomNumber}`}
              className="w-full py-2 mt-6 rounded-xl bg-white text-primary-600 font-bold hover:bg-primary-50 transition-colors flex items-center justify-center"
            >
              Contact Manager
            </a>
          </div>
        </div>
      </div>
      
      {historyRequests.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-surface-900 mb-4">Booking History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historyRequests.map(req => (
              <div key={req._id} className="card p-5 border border-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-surface-900">Room {req.room?.roomNumber || 'N/A'}</h3>
                    <p className="text-surface-500 text-sm">{req.property?.name || 'Property Unavailable'}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    req.status === 'Completed' ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <div className="text-sm text-surface-600 space-y-1">
                  <p>Rent: ₹{req.room?.rent || 0}</p>
                  <p>Booked on: {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
