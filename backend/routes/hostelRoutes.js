const express = require('express');
const router = express.Router();
const { 
  getAllHostels, 
  getHostelsByProgram, 
  createHostel, 
  updateHostel, 
  deleteHostel,
  getRoomsByHostel,
  getAvailableRoomsByHostel,
  createRoom,
  bulkCreateRooms,
  updateRoom,
  deleteRoom
} = require('../controllers/hostelController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Hostel routes
router.route('/')
  .get(protect, authorize('admin', 'super_admin'), getAllHostels)
  .post(protect, authorize('admin', 'super_admin'), createHostel);

router.get('/program/:programId', protect, authorize('admin', 'super_admin', 'student'), getHostelsByProgram);

router.route('/:id')
  .put(protect, authorize('admin', 'super_admin'), updateHostel)
  .delete(protect, authorize('admin', 'super_admin'), deleteHostel);

// Room routes
router.route('/:hostelId/rooms')
  .get(protect, authorize('admin', 'super_admin'), getRoomsByHostel)
  .post(protect, authorize('admin', 'super_admin'), createRoom);

router.post('/:hostelId/rooms/bulk', protect, authorize('admin', 'super_admin'), bulkCreateRooms);

router.get('/:hostelId/rooms/available', protect, authorize('admin', 'super_admin', 'student'), getAvailableRoomsByHostel);

router.route('/room/:id')
  .put(protect, authorize('admin', 'super_admin'), updateRoom)
  .delete(protect, authorize('admin', 'super_admin'), deleteRoom);

module.exports = router;
