const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  applyLeave,
  getMyLeaves,
  getTeamLeaveRequests,
  updateLeaveStatus,
  getTeamAvailability
} = require('../controllers/leaveController');

const router = express.Router();

router.post('/apply', protect, applyLeave);
router.post('/', protect, applyLeave);
router.get('/my-leaves', protect, getMyLeaves);
router.get('/team-requests', protect, getTeamLeaveRequests);
router.get('/all', protect, getTeamLeaveRequests);
router.get('/', protect, getTeamLeaveRequests);
router.get('/availability', protect, getTeamAvailability);
router.put('/:id/status', protect, updateLeaveStatus);
router.put('/:id', protect, updateLeaveStatus);
router.patch('/:id/status', protect, updateLeaveStatus);
router.patch('/:id', protect, updateLeaveStatus);

module.exports = router;