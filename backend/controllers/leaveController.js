const Leave = require('../models/Leave');

const applyLeave = async (req, res) => {
  const { startDate, endDate, reason } = req.body;
  try {
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Please provide start date, end date, and reason' });
    }

    const newLeave = await Leave.create({
      userId: req.user?._id || req.user?.id,
      startDate,
      endDate,
      reason,
      status: 'Pending'
    });

    res.status(201).json(newLeave);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

const getTeamLeaveRequests = async (req, res) => {
  try {
    const requests = await Leave.find()
      .populate({ path: 'userId', select: 'name email role' })
      .sort({ createdAt: -1 });
      
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch leave requests' });
  }
};

const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const leaves = await Leave.find({ userId }).sort({ createdAt: -1 });

    const approvedDays = leaves
      .filter((l) => l.status === 'Approved')
      .reduce((total, l) => {
        const diff = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        return total + Math.max(diff, 1);
      }, 0);

    res.json({
      leaves,
      totalAllowance: 20,
      usedDays: approvedDays,
      remainingDays: Math.max(20 - approvedDays, 0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch your leaves' });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const rawStatus = req.body.status || '';
    const normalizedStatus =
      rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

    if (!['Approved', 'Rejected', 'Pending'].includes(normalizedStatus)) {
      return res.status(400).json({ message: `Invalid status: ${rawStatus}` });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: normalizedStatus,
        reviewedBy: req.user?._id || req.user?.id
      },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.json(leave);
  } catch (err) {
    console.error('Update Leave Status Error:', err);
    res.status(500).json({ message: err.message || 'Failed to update leave status' });
  }
};
const getTeamAvailability = async (req, res) => {
  try {
    const activeLeaves = await Leave.find({ status: 'Approved' }).populate('userId', 'name teamId');
    res.json(activeLeaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = { applyLeave, getMyLeaves, getTeamLeaveRequests, updateLeaveStatus, getTeamAvailability };