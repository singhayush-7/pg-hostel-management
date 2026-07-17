const JoinRequest = require('../models/joinRequest.model');
const Room = require('../models/room.model');
const Property = require('../models/property.model');
const Notification = require('../models/Notification.model');
 

const createRequest = async (req, res, next) => {
  try {
    const { propertyId, roomId, message } = req.body;
    const tenantId = req.user.id;
 
    const room = await Room.findById(roomId);
    if (!room || room.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Room is not available.' });
    }
 
    const existingRequest = await JoinRequest.findOne({
      tenant: tenantId,
      status: { $in: ['Approved', 'Active'] }
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You already have an active room booking. You can only book one room at a time.' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const documents = req.files ? req.files.map(f => f.path || f.url) : [];

    const newRequest = await JoinRequest.create({
      tenant: tenantId,
      owner: property.owner,
      property: propertyId,
      room: roomId,
      message,
      documents
    });

    await Notification.create({
      user: property.owner,
      title: 'New Join Request',
      message: `New join request for ${property.name}, Room ${room.roomNumber}.`,
      type: 'info',
      link: '/owner/requests'
    });

    res.status(201).json({ success: true, message: 'Request submitted successfully.', data: { joinRequest: newRequest } });
  } catch (error) {
    next(error);
  }
};

const getTenantRequests = async (req, res, next) => {
  try {
    const requests = await JoinRequest.find({ tenant: req.user.id })
      .populate('property', 'name city area type photos amenities')
      .populate('room', 'roomNumber type rent images isAC hasAttachedBath hasWiFi hasFood deposit')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: { joinRequests: requests } });
  } catch (error) {
    next(error);
  }
};

const getOwnerRequests = async (req, res, next) => {
  try {
    const requests = await JoinRequest.find({ owner: req.user.id })
      .populate('tenant', 'name email phone')
      .populate('property', 'name photos amenities')
      .populate('room', 'roomNumber rent type images isAC hasAttachedBath hasWiFi hasFood deposit')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: { joinRequests: requests } });
  } catch (error) {
    next(error);
  }
};

const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;  
    const joinRequest = await JoinRequest.findById(id).populate('room');
    if (!joinRequest) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (joinRequest.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this request.' });
    }

    if (status === 'Approved') {
      const tenantActiveRequest = await JoinRequest.findOne({
        tenant: joinRequest.tenant,
        status: { $in: ['Approved', 'Active'] }
      });
      
      if (tenantActiveRequest) {
        return res.status(400).json({ success: false, message: 'This tenant already has an active room booking.' });
      }

      if (joinRequest.room.status !== 'available') {
        return res.status(400).json({ success: false, message: 'Room is no longer available.' });
      }
 
      const roomDoc = await Room.findById(joinRequest.room._id);
      roomDoc.status = 'occupied';
      await roomDoc.save();
 
      await JoinRequest.updateMany(
        { room: joinRequest.room._id, _id: { $ne: joinRequest._id }, status: 'Pending' },
        { status: 'Rejected' }
      );
    }

    joinRequest.status = status;
    await joinRequest.save();

    await Notification.create({
      user: joinRequest.tenant,
      title: `Request ${status}`,
      message: `Your request for Room ${joinRequest.room.roomNumber} has been ${status.toLowerCase()}.`,
      type: status === 'Approved' ? 'success' : 'error',
      link: '/tenant/requests'
    });

    res.status(200).json({ success: true, message: `Request ${status.toLowerCase()} successfully.`, data: { joinRequest } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getTenantRequests,
  getOwnerRequests,
  updateRequestStatus
};
