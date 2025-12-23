const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    authUser,
    registerUser,
    verifyPassword,
    getUserProfile,
    updateUserProfile,
    updateUserPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

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

router.post('/login', authUser);
router.post('/register', upload.single('avatar'), registerUser);
router.post('/verify-password', protect, verifyPassword);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('avatar'), updateUserProfile);

router.put('/password', protect, updateUserPassword);

module.exports = router;
