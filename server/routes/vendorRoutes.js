const express = require('express');
const router = express.Router();
const {
    createVendor,
    getVendors,
    getVendorById,
    updateVendor,
    deleteVendor
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('Admin', 'StoreOwner', 'Manager', 'DeptManager'), createVendor)
    .get(protect, getVendors);

router.route('/:id')
    .get(protect, getVendorById)
    .put(protect, authorize('Admin', 'StoreOwner', 'Manager', 'DeptManager'), updateVendor)
    .delete(protect, authorize('Admin', 'StoreOwner', 'Manager', 'DeptManager'), deleteVendor);

module.exports = router;
