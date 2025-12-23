const { prisma } = require('../config/db');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user.id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, mobile, businessName, businessCategory, businessDescription, department } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let avatarPath = null;
    if (req.file) {
        avatarPath = `/uploads/${req.file.filename}`;
    }

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role || 'Manager',
            mobile,
            businessName,
            businessCategory,
            businessDescription,
            department: department || 'General',
            avatar: avatarPath
        }
    });

    if (user) {
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user.id)
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Verify user password
// @route   POST /api/auth/verify-password
// @access  Private
const verifyPassword = async (req, res) => {
    const { password } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({ message: 'Password verified' });
    } else {
        res.status(401).json({ message: 'Invalid password' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    if (user) {
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            mobile: user.mobile,
            businessName: user.businessName,
            businessCategory: user.businessCategory,
            businessDescription: user.businessDescription,
            department: user.department,
            avatar: user.avatar,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const fs = require('fs');
const path = require('path');

const updateUserProfile = async (req, res) => {
    const logFile = path.join(__dirname, '../debug.log');
    try {
        const logData = `[${new Date().toISOString()}] Update profile request: ${JSON.stringify({
            userId: req.user?.id,
            body: req.body,
            file: req.file ? req.file.filename : 'no file'
        })}\n`;
        fs.appendFileSync(logFile, logData);

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (user) {
            const updateData = {
                name: req.body.name || user.name,
                email: req.body.email || user.email,
                mobile: req.body.mobile || user.mobile,
                businessName: req.body.businessName || user.businessName,
                businessCategory: req.body.businessCategory || user.businessCategory,
                businessDescription: req.body.businessDescription || user.businessDescription,
                department: req.body.department || user.department,
            };

            if (req.body.removeAvatar === 'true') {
                updateData.avatar = null;
            }

            if (req.file) {
                updateData.avatar = `/uploads/${req.file.filename}`;
            }

            const updatedUser = await prisma.user.update({
                where: { id: req.user.id },
                data: updateData
            });

            res.json({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                mobile: updatedUser.mobile,
                businessName: updatedUser.businessName,
                businessCategory: updatedUser.businessCategory,
                businessDescription: updatedUser.businessDescription,
                department: updatedUser.department,
                avatar: updatedUser.avatar,
                token: generateToken(updatedUser.id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        const errorData = `[${new Date().toISOString()}] Update profile error: ${error.message}\n${error.stack}\n`;
        fs.appendFileSync(logFile, errorData);
        res.status(500).json({
            message: 'Error updating profile',
            details: error.message
        });
    }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
const updateUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });

    if (user && (await bcrypt.compare(currentPassword, user.password))) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(401).json({ message: 'Invalid current password' });
    }
};

module.exports = {
    authUser,
    registerUser,
    verifyPassword,
    getUserProfile,
    updateUserProfile,
    updateUserPassword
};
