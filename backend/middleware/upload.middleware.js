const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary");

 
const propertyStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "smartstay/properties",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 800, crop: "limit", quality: "auto" }],
  },
});

 
const roomStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "smartstay/rooms",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1000, height: 700, crop: "limit", quality: "auto" }],
  },
});

 
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "smartstay/documents",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
  },
});

 
const imageFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
  }
};

const documentFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP, and PDF documents are allowed"), false);
  }
};

 
const uploadPropertyPhotos = multer({
  storage: propertyStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },  
}).array("photos", 5);

const uploadRoomImages = multer({
  storage: roomStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
}).array("images", 5);

const uploadDocuments = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },  
}).array("documents", 5);

 
const handlePropertyUpload = (req, res, next) => {
  uploadPropertyPhotos(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "Each image must be under 5MB" });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ success: false, message: "Maximum 5 images allowed" });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

const handleRoomUpload = (req, res, next) => {
  uploadRoomImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "Each image must be under 5MB" });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

const handleDocumentUpload = (req, res, next) => {
  uploadDocuments(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "Each document must be under 10MB" });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ success: false, message: "Maximum 5 documents allowed" });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = { handlePropertyUpload, handleRoomUpload, handleDocumentUpload };
