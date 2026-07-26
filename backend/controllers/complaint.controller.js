const Complaint = require("../models/Complaint.model");
const JoinRequest = require("../models/joinRequest.model");
const Notification = require("../models/Notification.model");
 
exports.createComplaint = async (req, res, next) => {
  try {
    const { issue, priority } = req.body;

    if (!issue) {
      return res.status(400).json({ success: false, message: "Issue description is required" });
    }

     
    const approvedRequest = await JoinRequest.findOne({
      tenant: req.user.id,
      status: "Approved",
    }).populate("property");

    if (!approvedRequest) {
      return res.status(403).json({ success: false, message: "You don't have an active room assignment to raise a complaint for." });
    }

    const complaint = await Complaint.create({
      tenant: req.user.id,
      owner: approvedRequest.property.owner,
      property: approvedRequest.property._id,
      room: approvedRequest.room,
      issue,
      priority: priority || "Medium",
    });

    await Notification.create({
      user: approvedRequest.property.owner,
      title: 'New Maintenance Complaint',
      message: `A new complaint has been raised for ${approvedRequest.property.name}.`,
      type: 'warning',
      link: '/owner/complaints'
    });

    res.status(201).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

 
exports.getComplaints = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === "student") {
      query.tenant = req.user.id;
    } else if (req.user.role === "owner") {
      query.owner = req.user.id;
    }

    const complaints = await Complaint.find(query)
      .populate("tenant", "name email")
      .populate("property", "name")
      .populate("room", "roomNumber")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

 
exports.updateComplaint = async (req, res, next) => {
  try {
    const { status, replyText } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    
    if (
      complaint.owner.toString() !== req.user.id &&
      complaint.tenant.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to update this complaint" });
    }

    if (status && req.user.role === "owner") {
      complaint.status = status;
    }

    if (replyText) {
      const senderRole = req.user.role === "owner" ? "Owner" : "Tenant";
      complaint.replies.push({
        sender: senderRole,
        text: replyText,
      });
    }

    await complaint.save();

    
    await complaint.populate("tenant", "name email");
    await complaint.populate("property", "name");
    await complaint.populate("room", "roomNumber");

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};
