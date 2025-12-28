const { prisma } = require('../config/db');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/emailUtils');
const crypto = require('crypto');


// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.deletedAt) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.status !== 'Active') {
            const statusMsg = user.status === 'Suspended'
                ? 'Your account has been suspended. Please contact support.'
                : 'Your account is currently inactive.';
            return res.status(403).json({ message: statusMsg });
        }

        if (await bcrypt.compare(password, user.password)) {
            if (!user.isVerified) {
                return res.status(401).json({ message: 'Please verify your email address before logging in.' });
            }

            const token = generateToken(user.id);

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
};



// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role, mobile, businessName, businessCategory, businessDescription, department } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

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

        // Generate secure verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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
                avatar: avatarPath,
                isVerified: false,
                verificationToken: verificationToken,
                verificationExpires: otpExpires
            }
        });

        if (user) {
            const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

            // Send verification email
            const message = `Please verify your email by clicking the link: ${verificationUrl}`;
            const html = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; text-align: center; background-color: #f9fafb;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #4f46e5; margin-bottom: 24px; font-size: 28px;">Welcome to NexCLM</h2>
                        <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 32px;">
                            Thanks for signing up! To get started with your account, please verify your email address by clicking the button below.
                        </p>
                        <a href="${verificationUrl}" 
                           style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; transition: background-color 0.2s;">
                           Verify My Account
                        </a>
                        <p style="margin-top: 32px; font-size: 14px; color: #9ca3af;">
                            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                        </p>
                        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;">
                        <p style="font-size: 12px; color: #9ca3af; line-height: 18px;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="${verificationUrl}" style="color: #4f46e5; word-break: break-all;">${verificationUrl}</a>
                        </p>
                    </div>
                </div>
            `;

            const emailResult = await sendEmail({
                email,
                subject: 'Verify Your NexCLM Account',
                message,
                html
            });

            if (!emailResult.success) {
                return res.status(201).json({
                    message: 'Account created, but we failed to send the verification link.',
                    email: user.email,
                    emailError: true,
                    details: emailResult.error
                });
            }

            res.status(201).json({
                message: 'Registration successful. Please check your email for a verification link.',
                email: user.email
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Verify user password
// @route   POST /api/auth/verify-password
// @access  Private
const verifyPassword = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ message: 'Password verified' });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);
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

            const token = generateToken(updatedUser.id);

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
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
                token
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
const updateUserPassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both current and new passwords are required' });
        }

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
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.json({ message: 'Logged out successfully' });
};

// @desc    Check if email is already registered
// @route   GET /api/auth/check-email/:email
// @access  Public
const checkEmailAvailability = async (req, res, next) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            return res.json({ available: false, message: 'Email is already registered' });
        }

        res.json({ available: true, message: 'Email is available' });
    } catch (error) {
        console.error('Check email availability error:', error);
        res.status(500).json({
            message: 'Error checking email availability',
            error: error.message, // Temporarily enabled for debugging
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};



const resendVerificationOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Generate new secure verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.user.update({
            where: { email },
            data: {
                verificationToken: verificationToken,
                verificationExpires: otpExpires
            }
        });

        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

        const message = `Please verify your email by clicking the link: ${verificationUrl}`;
        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; text-align: center; background-color: #f9fafb;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #4f46e5; margin-bottom: 24px; font-size: 28px;">Verification Link Resent</h2>
                    <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 32px;">
                        You requested a new verification link for your NexCLM account. Please click the button below to verify your email address.
                    </p>
                    <a href="${verificationUrl}" 
                       style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; transition: background-color 0.2s;">
                       Verify My Account
                    </a>
                    <p style="margin-top: 32px; font-size: 14px; color: #9ca3af;">
                        This link will expire in 24 hours.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;">
                    <p style="font-size: 12px; color: #9ca3af; line-height: 18px;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${verificationUrl}" style="color: #4f46e5; word-break: break-all;">${verificationUrl}</a>
                    </p>
                </div>
            </div>
        `;

        const emailResult = await sendEmail({
            email,
            subject: 'New Verification Link - NexCLM',
            message,
            html
        });

        if (!emailResult.success) {
            return res.status(500).json({
                message: 'Failed to send verification email.',
                details: emailResult.error
            });
        }

        res.json({ message: 'A new verification link has been sent to your email.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify Email OTP during registration
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.verificationOTP !== otp || new Date() > user.verificationExpires) {
            return res.status(400).json({ message: 'Invalid or expired verification OTP' });
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                isVerified: true,
                verificationOTP: null,
                verificationExpires: null
            }
        });

        const token = generateToken(updatedUser.id);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            token,
            message: 'Email verified successfully. You are now logged in.'
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
            where: { email },
            data: {
                resetPasswordOTP: otp,
                resetPasswordExpires: otpExpires
            }
        });

        const message = `Your password reset OTP is ${otp}. It will expire in 10 minutes.`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #6366f1;">Password Reset OTP</h2>
                <p>You requested a password reset for your NexCLM account.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #1f2937;">
                    ${otp}
                </div>
                <p style="margin-top: 20px;">This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `;

        const emailSent = await sendEmail({
            email,
            subject: 'NexCLM Password Reset OTP',
            message,
            html
        });

        if (emailSent) {
            res.json({ message: 'OTP sent to your email' });
        } else {
            res.status(500).json({ message: 'Error sending email' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.resetPasswordOTP !== otp || new Date() > user.resetPasswordExpires) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        res.json({ message: 'OTP verified successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.resetPasswordOTP !== otp || new Date() > user.resetPasswordExpires) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                resetPasswordOTP: null,
                resetPasswordExpires: null
            }
        });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};


// @desc    Simplified Request OTP
// @route   POST /api/auth/request-otp
// @access  Public
const requestOTP = async (req, res, next) => {
    try {
        const { email, type } = req.body; // type: 'verification' or 'reset'

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const updateData = {};
        let subject = '';
        let title = '';

        if (type === 'reset') {
            updateData.resetPasswordOTP = otp;
            updateData.resetPasswordExpires = otpExpires;
            subject = 'Password Reset OTP - NexCLM';
            title = 'Password Reset OTP';
        } else {
            // Default to verification
            updateData.verificationOTP = otp;
            updateData.verificationExpires = otpExpires;
            subject = 'Verify Your NexCLM Account';
            title = 'Verification OTP';
        }

        await prisma.user.update({
            where: { email },
            data: updateData
        });

        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; text-align: center;">
                <h2 style="color: #6366f1;">${title}</h2>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #1f2937; margin: 20px auto; width: fit-content;">
                    ${otp}
                </div>
                <p>This OTP will expire in 10 minutes.</p>
            </div>
        `;

        const emailResult = await sendEmail({
            email,
            subject,
            message: `Your OTP is ${otp}`,
            html
        });

        if (!emailResult.success) {
            return res.status(500).json({
                message: 'Failed to send OTP email.',
                details: emailResult.error
            });
        }

        res.json({ message: 'OTP sent successfully to your email.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Simplified Verify OTP
// @route   POST /api/auth/verify-otp-unified
// @access  Public
const verifyOTPUnified = async (req, res, next) => {
    try {
        const { email, otp, type } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let isValid = false;
        if (type === 'reset') {
            isValid = user.resetPasswordOTP === otp && new Date() <= user.resetPasswordExpires;
        } else {
            isValid = user.verificationOTP === otp && new Date() <= user.verificationExpires;
        }

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // If it's verification, mark as verified and log in
        if (type !== 'reset') {
            const updatedUser = await prisma.user.update({
                where: { email },
                data: {
                    isVerified: true,
                    verificationOTP: null,
                    verificationExpires: null
                }
            });

            const token = generateToken(updatedUser.id);
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.json({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                token,
                message: 'Email verified and logged in successfully.'
            });
        }

        res.json({ message: 'OTP verified successfully.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify Email by Link
// @route   GET /api/auth/verify-link/:token
// @access  Public
const verifyEmailByLink = async (req, res, next) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }

        const user = await prisma.user.findUnique({
            where: { verificationToken: token }
        });

        if (!user || new Date() > user.verificationExpires) {
            return res.status(400).json({ message: 'Invalid or expired verification link' });
        }

        if (user.isVerified) {
            return res.status(200).json({ message: 'Email is already verified' });
        }

        const updatedUser = await prisma.user.update({
            where: { verificationToken: token },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationExpires: null
            }
        });

        const authToken = generateToken(updatedUser.id);

        res.cookie('jwt', authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            token: authToken,
            message: 'Email verified successfully. You are now logged in.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    authUser,
    registerUser,
    verifyPassword,
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
    logoutUser,
    forgotPassword,
    verifyOTP,
    resetPassword,
    verifyEmail,
    checkEmailAvailability,
    resendVerificationOTP,
    requestOTP,
    verifyOTPUnified,
    verifyEmailByLink
};



