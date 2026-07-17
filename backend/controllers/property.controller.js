const propertyService = require("../services/property.service");

 
const createProperty = async (req, res, next) => {
  try {
    const property = await propertyService.createProperty(
      req.user.id,
      req.body,
      req.files || []
    );
    res.status(201).json({ success: true, message: "Property created successfully", data: { property } });
  } catch (error) { next(error); }
};
 
const getAllProperties = async (req, res, next) => {
  try {
    const result = await propertyService.getAllProperties(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

 
const getMyProperties = async (req, res, next) => {
  try {
    const properties = await propertyService.getMyProperties(req.user.id);
    res.status(200).json({ success: true, data: { properties } });
  } catch (error) { next(error); }
};

 
const getPropertyById = async (req, res, next) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id, req.user?.id);
    res.status(200).json({ success: true, data: { property } });
  } catch (error) { next(error); }
};

 
const updateProperty = async (req, res, next) => {
  try {
    const property = await propertyService.updateProperty(
      req.params.id,
      req.user.id,
      req.body,
      req.files || []
    );
    res.status(200).json({ success: true, message: "Property updated successfully", data: { property } });
  } catch (error) { next(error); }
};

 
const deleteProperty = async (req, res, next) => {
  try {
    await propertyService.deleteProperty(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: "Property deleted successfully" });
  } catch (error) { next(error); }
};

module.exports = { createProperty, getAllProperties, getMyProperties, getPropertyById, updateProperty, deleteProperty };
