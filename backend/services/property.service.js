const Property = require("../models/property.model");
const { cloudinary } = require("../config/cloudinary");

 
const parseBool = (val) => val === "true" || val === true;

 
const parseAmenities = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
};


const createProperty = async (ownerId, body, uploadedFiles = []) => {
  const { name, description, type, gender, address, city, area, pincode, amenities } = body;

  const photos = uploadedFiles.map((f) => ({
    public_id: f.filename,
    url: f.path,
  }));

  const property = await Property.create({
    name,
    description,
    type,
    gender,
    address,
    city,
    area,
    pincode,
    owner: ownerId,
    amenities: parseAmenities(amenities),
    photos,
  });

  return property;
};

 
const getAllProperties = async (queryParams) => {
  const {
    city, area, type, gender, minRent, maxRent,
    page = 1, limit = 12, search,
  } = queryParams;

  const filter = { isActive: true };

  if (city) filter.city = new RegExp(city, "i");
  if (area) filter.area = new RegExp(area, "i");
  if (type) filter.type = type;
  if (gender && gender !== "any") filter.gender = { $in: [gender, "any"] };
  if (search) filter.name = new RegExp(search, "i");

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Property.countDocuments(filter),
  ]);

  return {
    properties,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  };
};

 
const getMyProperties = async (ownerId) => {
  const properties = await Property.find({ owner: ownerId })
    .sort({ createdAt: -1 });
  return properties;
};
 
const getPropertyById = async (propertyId, requestingUserId = null) => {
  const property = await Property.findById(propertyId)
    .populate("owner", "name email phone avatar");

  if (!property) {
    const error = new Error("Property not found");
    error.statusCode = 404;
    throw error;
  }

  return property;
};

 
const updateProperty = async (propertyId, ownerId, body, uploadedFiles = []) => {
  const property = await Property.findById(propertyId);

  if (!property) {
    const error = new Error("Property not found");
    error.statusCode = 404;
    throw error;
  }

  if (property.owner.toString() !== ownerId) {
    const error = new Error("You are not authorized to update this property");
    error.statusCode = 403;
    throw error;
  }

  const { name, description, type, gender, address, city, area, pincode, amenities, existingPhotos } = body;

  
  let photos = [];
 
  if (existingPhotos) {
    const keepUrls = Array.isArray(existingPhotos) ? existingPhotos : [existingPhotos];
    const existing = property.photos.filter((p) => keepUrls.includes(p.url));

   
    const removedPhotos = property.photos.filter((p) => !keepUrls.includes(p.url));
    for (const photo of removedPhotos) {
      await cloudinary.uploader.destroy(photo.public_id);
    }

    photos = existing;
  } else {
    
    for (const photo of property.photos) {
      await cloudinary.uploader.destroy(photo.public_id);
    }
  }

  
  const newPhotos = uploadedFiles.map((f) => ({ public_id: f.filename, url: f.path }));
  photos = [...photos, ...newPhotos];

  const updated = await Property.findByIdAndUpdate(
    propertyId,
    {
      name: name || property.name,
      description,
      type: type || property.type,
      gender: gender || property.gender,
      address: address || property.address,
      city: city || property.city,
      area,
      pincode,
      amenities: parseAmenities(amenities),
      photos,
    },
    { new: true, runValidators: true }
  );

  return updated;
};

 
const deleteProperty = async (propertyId, ownerId) => {
  const property = await Property.findById(propertyId);

  if (!property) {
    const error = new Error("Property not found");
    error.statusCode = 404;
    throw error;
  }

  if (property.owner.toString() !== ownerId) {
    const error = new Error("You are not authorized to delete this property");
    error.statusCode = 403;
    throw error;
  }

  
  for (const photo of property.photos) {
    await cloudinary.uploader.destroy(photo.public_id);
  }

  await Property.findByIdAndDelete(propertyId);
};

module.exports = {
  createProperty,
  getAllProperties,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
