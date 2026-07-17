const Room = require("../models/room.model");
const Property = require("../models/property.model");
const { cloudinary } = require("../config/cloudinary");

 
const parseBool = (val) => val === "true" || val === true;


const createRoom = async (propertyId, ownerId, body, uploadedFiles = []) => {
   
  const property = await Property.findById(propertyId);
  if (!property) {
    const error = new Error("Property not found");
    error.statusCode = 404;
    throw error;
  }
  if (property.owner.toString() !== ownerId) {
    const error = new Error("You are not authorized to add rooms to this property");
    error.statusCode = 403;
    throw error;
  }

  const { roomNumber, floor, type, capacity, rent, deposit, isAC, hasAttachedBath, hasWiFi, hasFood, description } = body;

  const images = uploadedFiles.map((f) => ({ public_id: f.filename, url: f.path }));

  const room = await Room.create({
    property: propertyId,
    roomNumber,
    floor: floor ? parseInt(floor) : 0,
    type,
    capacity: parseInt(capacity),
    rent: parseFloat(rent),
    deposit: deposit ? parseFloat(deposit) : 0,
    isAC: parseBool(isAC),
    hasAttachedBath: parseBool(hasAttachedBath),
    hasWiFi: parseBool(hasWiFi),
    hasFood: parseBool(hasFood),
    description,
    images,
  });

  return room;
};

 
const getRoomsByProperty = async (propertyId) => {
  const property = await Property.findById(propertyId).select("name owner");
  if (!property) {
    const error = new Error("Property not found");
    error.statusCode = 404;
    throw error;
  }

  const rooms = await Room.find({ property: propertyId }).sort({ roomNumber: 1 });
  return { rooms, property };
};

 
const getRoomById = async (roomId) => {
  const room = await Room.findById(roomId).populate("property", "name city area owner");
  if (!room) {
    const error = new Error("Room not found");
    error.statusCode = 404;
    throw error;
  }
  return room;
};

 
const updateRoom = async (roomId, ownerId, body, uploadedFiles = []) => {
  const room = await Room.findById(roomId).populate("property", "owner");
  if (!room) {
    const error = new Error("Room not found");
    error.statusCode = 404;
    throw error;
  }

  if (room.property.owner.toString() !== ownerId) {
    const error = new Error("You are not authorized to update this room");
    error.statusCode = 403;
    throw error;
  }

  const { roomNumber, floor, type, capacity, rent, deposit, isAC, hasAttachedBath, hasWiFi, hasFood, description, existingImages } = body;

  
  let images = [];
  if (existingImages) {
    const keepUrls = Array.isArray(existingImages) ? existingImages : [existingImages];
    const existing = room.images.filter((img) => keepUrls.includes(img.url));
    const removed = room.images.filter((img) => !keepUrls.includes(img.url));
    for (const img of removed) await cloudinary.uploader.destroy(img.public_id);
    images = existing;
  } else {
    for (const img of room.images) await cloudinary.uploader.destroy(img.public_id);
  }

  const newImages = uploadedFiles.map((f) => ({ public_id: f.filename, url: f.path }));
  images = [...images, ...newImages];

  const updated = await Room.findByIdAndUpdate(
    roomId,
    {
      roomNumber: roomNumber || room.roomNumber,
      floor: floor !== undefined ? parseInt(floor) : room.floor,
      type: type || room.type,
      capacity: capacity ? parseInt(capacity) : room.capacity,
      rent: rent ? parseFloat(rent) : room.rent,
      deposit: deposit !== undefined ? parseFloat(deposit) : room.deposit,
      isAC: isAC !== undefined ? parseBool(isAC) : room.isAC,
      hasAttachedBath: hasAttachedBath !== undefined ? parseBool(hasAttachedBath) : room.hasAttachedBath,
      hasWiFi: hasWiFi !== undefined ? parseBool(hasWiFi) : room.hasWiFi,
      hasFood: hasFood !== undefined ? parseBool(hasFood) : room.hasFood,
      description,
      images,
    },
    { new: true, runValidators: true }
  );

  return updated;
};

 
const deleteRoom = async (roomId, ownerId) => {
  const room = await Room.findById(roomId).populate("property", "owner");
  if (!room) {
    const error = new Error("Room not found");
    error.statusCode = 404;
    throw error;
  }

  if (room.property.owner.toString() !== ownerId) {
    const error = new Error("You are not authorized to delete this room");
    error.statusCode = 403;
    throw error;
  }

   
  for (const img of room.images) {
    await cloudinary.uploader.destroy(img.public_id);
  }

  await Room.findOneAndDelete({ _id: roomId });
};

module.exports = { createRoom, getRoomsByProperty, getRoomById, updateRoom, deleteRoom };
