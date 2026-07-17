const roomService = require("../services/room.service");

 
const createRoom = async (req, res, next) => {
  try {
    const room = await roomService.createRoom(
      req.params.propertyId,
      req.user.id,
      req.body,
      req.files || []
    );
    res.status(201).json({ success: true, message: "Room added successfully", data: { room } });
  } catch (error) { next(error); }
};
 
const getRoomsByProperty = async (req, res, next) => {
  try {
    const result = await roomService.getRoomsByProperty(req.params.propertyId);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};
 
const getRoomById = async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.roomId);
    res.status(200).json({ success: true, data: { room } });
  } catch (error) { next(error); }
};

 
const updateRoom = async (req, res, next) => {
  try {
    const room = await roomService.updateRoom(
      req.params.roomId,
      req.user.id,
      req.body,
      req.files || []
    );
    res.status(200).json({ success: true, message: "Room updated successfully", data: { room } });
  } catch (error) { next(error); }
};
 
const deleteRoom = async (req, res, next) => {
  try {
    await roomService.deleteRoom(req.params.roomId, req.user.id);
    res.status(200).json({ success: true, message: "Room deleted successfully" });
  } catch (error) { next(error); }
};

module.exports = { createRoom, getRoomsByProperty, getRoomById, updateRoom, deleteRoom };
