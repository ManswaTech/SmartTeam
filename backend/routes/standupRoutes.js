const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  generateStandup,
  getStandupHistory,
  getTeamStandups,
  updateStandup,
  deleteStandup,
  getActiveLeaves
} = require('../controllers/standupController');

const router = express.Router();

router.post('/generate', protect, generateStandup);
router.get('/history', protect, getStandupHistory);
router.get('/team', protect, getTeamStandups);
router.get('/active-leaves', protect, getActiveLeaves);
router.put('/:id', protect, updateStandup);
router.delete('/:id', protect, deleteStandup);

module.exports = router;