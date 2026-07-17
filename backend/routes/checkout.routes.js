const express = require('express');
const {
  createRequest,
  getMyRequests,
  getOwnerRequests,
  approveRequest,
  rejectRequest,
  getRequest
} = require('../controllers/checkout.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();


router.use(protect);

 
router.post('/request', authorize('student'), createRequest);
router.get('/my-request', authorize('student'), getMyRequests);

 
router.get('/owner', authorize('owner', 'admin'), getOwnerRequests);
router.put('/:id/approve', authorize('owner', 'admin'), approveRequest);
router.put('/:id/reject', authorize('owner', 'admin'), rejectRequest);
 
router.get('/:id', getRequest);

module.exports = router;
