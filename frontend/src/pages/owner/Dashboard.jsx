import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { selectUser } from "../../store/slices/authSlice";
import { fetchOwnerDashboard, selectDashboardData, selectDashboardLoading } from "../../store/slices/dashboardSlice";
import { updateRequestStatus } from "../../store/slices/joinRequestSlice";
import toast from "react-hot-toast";
import { 
  Building2, 
  TrendingUp, 
  MessageSquareWarning, 
  Wallet,
  Home,
  AlertCircle,
  CalendarCheck,
  BedDouble,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Droplets,
  Wrench,
  Lightbulb,
  Users,
  ChevronLeft,
  Calendar as CalendarIcon,
  MessageSquare
} from "lucide-react";

const OwnerDashboard = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const dashboardData = useSelector(selectDashboardData);
  const isLoading = useSelector(selectDashboardLoading);
  const [isVacantRoomsModalOpen, setIsVacantRoomsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchOwnerDashboard());
  }, [dispatch]);

  const handleApproveReject = async (requestId, status) => {
    try {
      await dispatch(updateRequestStatus({ id: requestId, status })).unwrap();
      toast.success(`Request ${status.toLowerCase()} successfully!`);
      dispatch(fetchOwnerDashboard());  
    } catch (error) {
      toast.error(error || `Failed to ${status.toLowerCase()} request`);
    }
  };

  if (isLoading && !dashboardData.properties.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const {
    properties = [],
    pendingRequests = [],
    recentPayments = [],
    vacantRooms = [],
    maintenanceQueue = [],
    notifications = [],
    overview = {}
  } = dashboardData;

   
  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
   
    const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    const emptySlots = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + i + 1);
    
   
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="card p-5 h-full border border-surface-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-surface-900">Calendar</h3>
        </div>
        
        <div className="flex justify-between items-center mb-6 px-2">
          <button className="p-1 hover:bg-surface-100 rounded-lg text-surface-500"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-bold text-surface-900">{currentMonth}</span>
          <button className="p-1 hover:bg-surface-100 rounded-lg text-surface-500"><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="font-semibold text-surface-500 text-xs tracking-tight">{d}</div>
          ))}
          
          {emptySlots.map(day => (
            <div key={`empty-${day}`} className="text-surface-300 text-sm flex justify-center items-center h-8">{day}</div>
          ))}
          
          {days.map(day => {
            const isToday = day === today.getDate();
            return (
              <div key={day} className="flex justify-center items-center">
                <span className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-sm transition-colors ${
                  isToday ? 'bg-primary-500 text-white font-bold shadow-md' : 'text-surface-900 hover:bg-surface-100 cursor-pointer font-medium'
                }`}>
                  {day}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  // Helper for relative time
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const kpis = [
    { label: "Today's Revenue", value: `₹${overview.todaysRevenue?.toLocaleString() || "0"}`, subtext: "Total collected today", icon: Wallet, color: "text-primary-500", bg: "bg-primary-50" },
    { label: "Monthly Revenue", value: `₹${overview.monthlyRevenue?.toLocaleString() || "0"}`, subtext: "Total collected this month", icon: Building2, color: "text-success-500", bg: "bg-success-50" },
    { label: "Occupancy Rate", value: `${overview.occupancyRate || "0"}%`, subtext: "Across all properties", icon: Users, color: "text-warning-500", bg: "bg-warning-50" },
    { label: "Occupied Rooms", value: overview.activeBookings?.toString() || "0", subtext: `Out of ${overview.totalRooms || 0} total rooms`, icon: BedDouble, color: "text-primary-500", bg: "bg-primary-50" },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900"> welcome, {user?.name || "Owner"}</h1>
          <p className="text-sm text-surface-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}, {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

   
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-500">{kpi.label}</p>
                <h3 className="text-2xl font-bold text-surface-900 mt-0.5">{kpi.value}</h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {kpi.trend ? (
                <>
                  <span className={`font-bold ${kpi.trendUp ? 'text-success-600' : 'text-danger-600'}`}>
                    {kpi.trendUp ? '↑' : '↓'} {kpi.trend.replace('+', '')}
                  </span>
                  <span className="text-surface-500 font-medium">{kpi.subtext}</span>
                </>
              ) : (
                <span className="text-surface-500 font-medium">{kpi.subtext}</span>
              )}
            </div>
          </div>
        ))}
      </div>

       
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* My Properties */}
        <div className="card p-5 xl:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">My Properties</h3>
            <Link to="/properties" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</Link>
          </div>
          
          <div className="space-y-4 flex-1">
            {properties.length > 0 ? properties.map((prop) => (
              <div key={prop._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-white hover:border-primary-200 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-surface-100 flex items-center justify-center overflow-hidden shrink-0">
                    {prop.images && prop.images[0] ? (
                      <img src={prop.images[0]} alt={prop.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 text-surface-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-surface-900">{prop.name}</h4>
                    <p className="text-sm text-surface-500">{prop.totalRooms} Rooms</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 flex-1">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-success-600">{prop.occupiedRooms}</span>
                    <span className="text-xs font-medium text-surface-500">Occupied</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-warning-600">{prop.vacantRooms}</span>
                    <span className="text-xs font-medium text-surface-500">Vacant</span>
                  </div>
                  <div className="flex flex-col hidden md:flex">
                    <span className="text-lg font-bold text-surface-900">₹{prop.monthlyIncome?.toLocaleString()}</span>
                    <span className="text-xs font-medium text-surface-500">Monthly Income</span>
                  </div>
                  <Link to={`/properties/${prop._id}`} className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <Building2 className="w-12 h-12 text-surface-300 mb-3" />
                <p className="text-surface-500 font-medium">No properties found</p>
                <p className="text-sm text-surface-400 mt-1">Add a property to start managing.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Tenant Requests */}
        <div className="card p-5 xl:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Pending Tenant Requests</h3>
            <Link to="/owner/requests" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2">
            {pendingRequests.length > 0 ? pendingRequests.map((req) => (
              <div key={req._id} className="p-4 rounded-xl border border-border bg-white flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {req.tenant?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-surface-900 truncate">{req.tenant?.name || 'Unknown User'}</h4>
                    <p className="text-xs text-surface-500 truncate">{req.property?.name} • Room {req.room?.roomNumber}</p>
                    <p className="text-[10px] text-surface-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Requested {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveReject(req._id, "Approved")} className="flex-1 py-1.5 px-3 bg-success-50 hover:bg-success-100 text-success-700 text-xs font-bold rounded-lg transition-colors border border-success-200">
                    Approve
                  </button>
                  <button onClick={() => handleApproveReject(req._id, "Rejected")} className="flex-1 py-1.5 px-3 bg-danger-50 hover:bg-danger-100 text-danger-700 text-xs font-bold rounded-lg transition-colors border border-danger-200">
                    Reject
                  </button>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <CheckCircle2 className="w-12 h-12 text-success-300 mb-3" />
                <p className="text-surface-500 font-medium">All caught up!</p>
                <p className="text-sm text-surface-400 mt-1">No pending tenant requests.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Recent Payments */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Recent Payments</h3>
            <Link to="/owner/payments" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</Link>
          </div>
          <div className="space-y-4">
            {recentPayments.length > 0 ? recentPayments.map((payment) => (
              <div key={payment._id} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-surface-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success-50 text-success-600 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-900 group-hover:text-primary-600 transition-colors">{payment.tenantId?.name || "Unknown"}</p>
                    <p className="text-xs text-surface-500">Room {payment.roomId?.roomNumber} • {payment.propertyId?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-surface-900">₹{payment.amount?.toLocaleString()}</p>
                  <p className="text-xs text-surface-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Wallet className="w-10 h-10 text-surface-200 mx-auto mb-2" />
                <p className="text-sm text-surface-500">No recent payments</p>
              </div>
            )}
          </div>
        </div>

        {/* Vacant Rooms */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Vacant Rooms</h3>
            {vacantRooms.length > 4 && (
              <button onClick={() => setIsVacantRoomsModalOpen(true)} className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</button>
            )}
          </div>
          <div className="space-y-4">
            {vacantRooms.length > 0 ? vacantRooms.slice(0, 4).map((room) => (
              <div key={room._id} onClick={() => room.propertyId && navigate(`/owner/properties/${room.propertyId}/rooms`)} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-50 hover:border-primary-200 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-900">Room {room.roomNumber}</p>
                    <p className="text-xs text-surface-500 truncate max-w-[120px]">{room.property}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-surface-900">₹{room.rent?.toLocaleString()}</p>
                    <p className="text-[10px] text-surface-400">/ month</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${room.type === 'single' ? 'bg-success-50 text-success-600 border border-success-200' : 'bg-primary-50 text-primary-600 border border-primary-200'}`}>
                    {room.type?.toUpperCase()}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Home className="w-10 h-10 text-success-200 mx-auto mb-2" />
                <p className="text-sm text-surface-500">All rooms are occupied!</p>
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Queue */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Maintenance Queue</h3>
            <Link to="/owner/maintenance" className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</Link>
          </div>
          <div className="space-y-4">
            {maintenanceQueue.length > 0 ? maintenanceQueue.map((ticket) => (
              <div key={ticket._id} className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-surface-50 cursor-pointer transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${ticket.priority === 'High' ? 'bg-danger-50 text-danger-600' : ticket.priority === 'Medium' ? 'bg-warning-50 text-warning-600' : 'bg-primary-50 text-primary-600'}`}>
                    {ticket.priority === 'High' ? <AlertCircle className="w-5 h-5" /> : ticket.priority === 'Medium' ? <Wrench className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-900 group-hover:text-primary-600 transition-colors truncate max-w-[150px]">{ticket.title || ticket.issue}</p>
                    <p className="text-xs text-surface-500">
                      {ticket.date ? new Date(ticket.date).toLocaleDateString() : new Date(ticket.createdAt).toLocaleDateString()} • {typeof ticket.property === 'object' ? ticket.property?.name : ticket.property}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ticket.priority === 'High' ? 'bg-danger-50 text-danger-600 border-danger-200' : ticket.priority === 'Medium' ? 'bg-warning-50 text-warning-600 border-warning-200' : 'bg-surface-50 text-surface-600 border-surface-200'}`}>
                  {ticket.priority}
                </span>
              </div>
            )) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-success-200 mx-auto mb-2" />
                <p className="text-sm text-surface-500">No active maintenance tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
 
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          
          {/* Calendar */}
          <div className="w-full">
            {renderCalendar()}
          </div>

          {/* Action Required */}
          <div className="w-full">
            <div className="card p-5 border border-surface-200 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-surface-900">Action Required</h3>
                <Link to="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
              </div>

              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {/* Leases Expiring */}
                <div className="flex items-center justify-between p-4 bg-warning-50 rounded-xl cursor-pointer hover:bg-warning-100 transition-colors border border-warning-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-warning-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-surface-900">{overview.leaseExpiring || 0} leases expiring soon</h4>
                      <p className="text-xs text-surface-500 mt-0.5">Next 7 days</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-warning-500" />
                </div>

                {/* Rent Due */}
                <div className="flex items-center justify-between p-4 bg-danger-50 rounded-xl cursor-pointer hover:bg-danger-100 transition-colors border border-danger-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-danger-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-surface-900">₹{overview.rentDue?.toLocaleString() || "0"} rent due</h4>
                      <p className="text-xs text-surface-500 mt-0.5">From {overview.tenantsOwingRent || 0} tenants</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-danger-500" />
                </div>

                {/* Pending Approvals */}
                <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl cursor-pointer hover:bg-primary-100 transition-colors border border-primary-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-5 h-5 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-surface-900">{overview.pendingBookings || 0} pending booking approvals</h4>
                      <p className="text-xs text-surface-500 mt-0.5">Require your action</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities Column */}
          <div className="w-full">
            <div className="card p-5 h-full border border-surface-200 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-surface-900">Recent Activities</h3>
                <Link to="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
              </div>

              {notifications && notifications.length > 0 ? (
                <div className="space-y-4 flex-1">
                  {notifications.map((notif, idx) => {
                     
                    let Icon = AlertCircle;
                    let colorClass = "text-surface-500";
                    let bgClass = "bg-surface-50";

                    if (notif.message.toLowerCase().includes('booking') || notif.message.toLowerCase().includes('request')) {
                      Icon = CalendarIcon;
                      colorClass = "text-primary-500";
                      bgClass = "bg-primary-50";
                    } else if (notif.message.toLowerCase().includes('payment') || notif.message.toLowerCase().includes('rent')) {
                      Icon = Wallet;
                      colorClass = "text-success-500";
                      bgClass = "bg-success-50";
                    } else if (notif.message.toLowerCase().includes('complaint')) {
                      Icon = MessageSquare;
                      colorClass = "text-warning-500";
                      bgClass = "bg-warning-50";
                    } else if (notif.message.toLowerCase().includes('check-out') || notif.message.toLowerCase().includes('check out')) {
                      Icon = CalendarIcon;
                      colorClass = "text-danger-500";
                      bgClass = "bg-danger-50";
                    }

                    return (
                      <div key={notif._id || idx} className="flex gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
                          <Icon className={`w-5 h-5 ${colorClass}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-surface-900 leading-tight">
                            {notif.message}
                          </p>
                          <p className="text-xs text-surface-500 mt-1">{timeAgo(notif.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-surface-50 flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-surface-400" />
                  </div>
                  <h3 className="text-lg font-bold text-surface-900">No recent activities</h3>
                  <p className="text-surface-500 text-sm mt-1 max-w-sm">
                    Everything is caught up! New activities will appear here automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
          
        </div>

      </div>

      {isVacantRoomsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-50 shrink-0">
              <h2 className="text-lg font-bold text-surface-900">All Vacant Rooms</h2>
              <button onClick={() => setIsVacantRoomsModalOpen(false)} className="text-surface-400 hover:text-surface-600 hover:bg-surface-200 p-1.5 rounded-lg transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <div className="space-y-4">
                {vacantRooms.map((room) => (
                  <div key={room._id} onClick={() => navigate(`/owner/properties/${room.propertyId}/rooms`)} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-50 hover:border-primary-200 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                        <BedDouble className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-surface-900">Room {room.roomNumber}</p>
                        <p className="text-xs text-surface-500 truncate max-w-[200px]">{room.property}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-surface-900">₹{room.rent?.toLocaleString()}</p>
                        <p className="text-[10px] text-surface-400">/ month</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${room.type === 'single' ? 'bg-success-50 text-success-600 border border-success-200' : 'bg-primary-50 text-primary-600 border border-primary-200'}`}>
                        {room.type?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerDashboard;
