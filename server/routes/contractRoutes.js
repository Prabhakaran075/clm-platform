const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    createContract,
    getContracts,
    getContractById,
    updateContract,
    deleteContract,
} = require('../controllers/contractController');
const { extractContractData } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

router.route('/')
    .post(protect, authorize('Admin', 'StoreOwner', 'Manager', 'DeptManager'), upload.array('attachments', 10), createContract)
    .get(protect, getContracts);

router.post('/extract', protect, authorize('Admin', 'StoreOwner', 'Manager', 'DeptManager'), upload.single('file'), extractContractData);

router.route('/:id')
    .get(protect, getContractById)
    .put(protect, authorize('Admin', 'StoreOwner', 'Manager', 'DeptManager'), updateContract)
    .delete(protect, authorize('Admin', 'StoreOwner', 'Manager', 'DeptManager'), deleteContract);

module.exports = router;
