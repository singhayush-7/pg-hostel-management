const express = require('express');
const router = express.Router();
const {
  createRequest,
  getTenantRequests,
  getOwnerRequests,
  updateRequestStatus
} = require('../controllers/joinRequest.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { handleDocumentUpload } = require('../middleware/upload.middleware');

 
router.use(protect);

 
router.post(
  '/',
  authorize('student', 'tenant'),
  handleDocumentUpload, 
  createRequest
);

router.get(
  '/tenant',
  authorize('student', 'tenant'),
  getTenantRequests
);

 
router.get(
  '/owner',
  authorize('owner'),
  getOwnerRequests
);

router.patch(
  '/:id/status',
  authorize('owner'),
  updateRequestStatus
);

module.exports = router;
