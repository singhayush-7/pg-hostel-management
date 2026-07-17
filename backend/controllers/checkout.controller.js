const CheckoutRequest = require('../models/checkoutRequest.model');
const JoinRequest = require('../models/joinRequest.model');
const Room = require('../models/room.model');
const Notification = require('../models/Notification.model');

 
const createRequest = async (req, res, next) => {
  try {
    const { moveOutDate, reason } = req.body;
    const tenantId = req.user.id;

     
    const activeBooking = await JoinRequest.findOne({
      tenant: tenantId,
      status: { $in: ['Approved', 'Active'] }
    }).populate('room property');

    if (!activeBooking) {
      return res.status(400).json({ success: false, message: 'You do not have an active booking to check out from.' });
    }

     
    const existingCheckout = await CheckoutRequest.findOne({
      tenant: tenantId,
      booking: activeBooking._id,
      status: 'Pending'
    });

    if (existingCheckout) {
      return res.status(400).json({ success: false, message: 'You already have a pending check-out request.' });
    }

    const newRequest = await CheckoutRequest.create({
      tenant: tenantId,
      owner: activeBooking.owner,
      booking: activeBooking._id,
      property: activeBooking.property._id || activeBooking.property,
      room: activeBooking.room._id || activeBooking.room,
      moveOutDate,
      reason
    });

    
    await Notification.create({
      user: activeBooking.owner,
      title: 'New Check-out Request',
      message: `${req.user.name || 'A tenant'} requested check-out for Room ${activeBooking.room.roomNumber}.`,
      type: 'warning',
      link: '/owner/checkouts'
    });

    res.status(201).json({ success: true, message: 'Check-out request submitted successfully.', data: { checkoutRequest: newRequest } });
  } catch (error) {
    next(error);
  }
};

 
const getMyRequests = async (req, res, next) => {
  try {
    const requests = await CheckoutRequest.find({ tenant: req.user.id })
      .populate('property', 'name')
      .populate('room', 'roomNumber type')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, data: { checkoutRequests: requests } });
  } catch (error) {
    next(error);
  }
};

 
const getOwnerRequests = async (req, res, next) => {
  try {
    const requests = await CheckoutRequest.find({ owner: req.user.id })
      .populate('tenant', 'name email phone avatar')
      .populate('property', 'name')
      .populate('room', 'roomNumber rent')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, data: { checkoutRequests: requests } });
  } catch (error) {
    next(error);
  }
};

 
const approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const checkoutRequest = await CheckoutRequest.findOne({ _id: id, owner: req.user.id }).populate('tenant property room');

    if (!checkoutRequest) {
      return res.status(404).json({ success: false, message: 'Check-out request not found or unauthorized.' });
    }

    if (checkoutRequest.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Check-out request is already ${checkoutRequest.status}.` });
    }

     
    checkoutRequest.status = 'Approved';
    checkoutRequest.approvedAt = new Date();
    await checkoutRequest.save();

    
    await JoinRequest.findByIdAndUpdate(checkoutRequest.booking, { status: 'Completed' });

  
    const room = await Room.findById(checkoutRequest.room._id);
    if (room) {
      room.status = 'available';
      room.availableBeds = room.capacity;
      await room.save();
    }
 
    await Notification.create({
      user: checkoutRequest.tenant._id,
      title: 'Check-out Approved',
      message: `Your check-out request for Room ${room.roomNumber} has been approved.`,
      type: 'success',
      link: '/student/dashboard'
    });

    res.status(200).json({ success: true, message: 'Check-out approved successfully.', data: { checkoutRequest } });
  } catch (error) {
    next(error);
  }
};
 
const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    
    const checkoutRequest = await CheckoutRequest.findOne({ _id: id, owner: req.user.id }).populate('tenant room');

    if (!checkoutRequest) {
      return res.status(404).json({ success: false, message: 'Check-out request not found or unauthorized.' });
    }

    if (checkoutRequest.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Check-out request is already ${checkoutRequest.status}.` });
    }

    checkoutRequest.status = 'Rejected';
    checkoutRequest.rejectedAt = new Date();
    if (remark) {
      checkoutRequest.ownerRemark = remark;
    }
    await checkoutRequest.save();
 
    await Notification.create({
      user: checkoutRequest.tenant._id,
      title: 'Check-out Rejected',
      message: `Your check-out request for Room ${checkoutRequest.room.roomNumber} was rejected.`,
      type: 'error',
      link: '/student/dashboard'
    });

    res.status(200).json({ success: true, message: 'Check-out rejected successfully.', data: { checkoutRequest } });
  } catch (error) {
    next(error);
  }
};
 
const getRequest = async (req, res, next) => {
  try {
    const checkoutRequest = await CheckoutRequest.findById(req.params.id)
      .populate('tenant', 'name email phone avatar')
      .populate('property', 'name')
      .populate('room', 'roomNumber rent');
      
    if (!checkoutRequest) {
      return res.status(404).json({ success: false, message: 'Check-out request not found.' });
    }
    
    
    if (checkoutRequest.tenant._id.toString() !== req.user.id && checkoutRequest.owner.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.status(200).json({ success: true, data: { checkoutRequest } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getOwnerRequests,
  approveRequest,
  rejectRequest,
  getRequest
};
