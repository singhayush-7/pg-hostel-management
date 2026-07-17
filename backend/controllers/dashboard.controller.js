const Property = require("../models/Property.model");
const Room = require("../models/Room.model");
const Payment = require("../models/Payment.model");
const Complaint = require("../models/Complaint.model");
const JoinRequest = require("../models/JoinRequest.model");
const Notification = require("../models/Notification.model");
const Task = require("../models/Task.model");

 
exports.getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    
    const properties = await Property.find({ owner: ownerId }).lean();
    const propertyIds = properties.map((p) => p._id);

     
    const rooms = await Room.find({ property: { $in: propertyIds } }).lean();
 
    const propertiesWithStats = properties.map((prop) => {
      const propRooms = rooms.filter(
        (r) => r.property.toString() === prop._id.toString()
      );
      
      const totalRooms = propRooms.length;
       
      const occupiedRooms = propRooms.filter(r => r.status === 'occupied').length;
      const vacantRooms = totalRooms - occupiedRooms;
      const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
      
     
      const monthlyIncome = propRooms
        .filter(r => r.status === 'occupied')
        .reduce((sum, r) => sum + r.rent, 0);

      return {
        ...prop,
        totalRooms,
        occupiedRooms,
        vacantRooms,
        monthlyIncome,
        occupancyPercentage
      };
    });

     
    const pendingRequests = await JoinRequest.find({
      owner: ownerId,
      status: "Pending"
    })
      .populate("tenant", "name email avatar")
      .populate("property", "name")
      .populate("room", "roomNumber")
      .sort("-createdAt")
      .lean();

   
    const recentPayments = await Payment.find({ ownerId: ownerId })
      .populate("tenantId", "name")
      .populate("propertyId", "name")
      .populate("roomId", "roomNumber")
      .sort("-createdAt")
      .limit(5)
      .lean();

     
    const vacantRoomsList = rooms
      .filter((r) => r.status === 'available')
      .map((r) => {
        const prop = properties.find((p) => p._id.toString() === r.property.toString());
        return {
          ...r,
          property: prop ? prop.name : "Unknown Property",
        };
      });

     
    const maintenanceQueue = await Task.find({
      owner: ownerId,
      status: { $in: ["Scheduled", "In Progress"] }
    })
      .sort("date")
      .limit(5)
      .lean();

    
    const notifications = await Notification.find({ user: ownerId })
      .sort("-createdAt")
      .limit(5)
      .lean();

    
    const totalRooms = propertiesWithStats.reduce((sum, p) => sum + p.totalRooms, 0);
    const activeBookings = propertiesWithStats.reduce((sum, p) => sum + p.occupiedRooms, 0);
    const occupancyRate = totalRooms > 0 ? Math.round((activeBookings / totalRooms) * 100) : 0;
    
    const pendingComplaints = await Complaint.countDocuments({ owner: ownerId, status: "Open" });
    const inProgressMaintenance = maintenanceQueue.filter(c => c.status === 'In Progress').length;
    
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const allCompletedPayments = await Payment.find({ ownerId: ownerId, status: "Paid" });
    
    const todaysRevenue = allCompletedPayments
      .filter(p => new Date(p.paidAt || p.createdAt) >= today)
      .reduce((sum, p) => sum + p.amount, 0);
      
    const paymentsThisMonth = allCompletedPayments.filter(p => new Date(p.paidAt || p.createdAt) >= firstDayOfMonth);
    const monthlyRevenue = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);
    const totalRevenue = allCompletedPayments.reduce((sum, p) => sum + p.amount, 0);

    const totalExpectedIncome = propertiesWithStats.reduce((sum, p) => sum + p.monthlyIncome, 0);
    const rentDue = Math.max(0, totalExpectedIncome - monthlyRevenue);
    
     
    const uniqueTenantsPaid = new Set(paymentsThisMonth.map(p => p.tenantId?.toString())).size;
    const tenantsOwingRent = Math.max(0, activeBookings - uniqueTenantsPaid);
 
    res.status(200).json({
      success: true,
      data: {
        properties: propertiesWithStats,
        pendingRequests,
        recentPayments,
        vacantRooms: vacantRoomsList,
        maintenanceQueue,
        notifications,
        overview: {
          totalRooms,
          activeBookings,
          occupancyRate,
          todaysRevenue,
          monthlyRevenue,
          totalRevenue,
          rentDue,
          tenantsOwingRent,
          pendingBookings: pendingRequests.length,
          pendingComplaints,
          maintenance: inProgressMaintenance,
          rentDue,
          tenantsOwingRent,
          leaseExpiring: 0,
          todaysRevenue,
          monthlyRevenue,
          occupancyRate,
          totalRooms
        }
      }
    });

  } catch (error) {
    next(error);
  }
};
