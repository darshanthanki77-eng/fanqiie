const User = require('../models/User');
const jwt = require('jsonwebtoken');
const WithdrawFee = require('../models/WithdrawFee');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { email, mobile, dialCode, loginPassword, securityPassword, invitationCode: refCode } = req.body;

        // Validate that either email or mobile is provided
        if (!email && !mobile) {
            return res.status(400).json({
                success: false,
                message: 'Please provide either email or mobile number'
            });
        }

        // Check if user already exists
        let existingUser;
        if (email) {
            existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        if (mobile) {
            existingUser = await User.findOne({ mobile, dialCode });
            if (existingUser) return res.status(400).json({ success: false, message: 'Mobile number already registered' });
        }

        // Handle Referral
        let upline = null;
        if (refCode) {
            upline = await User.findOne({ invitationCode: refCode });
        }

        // Generate unique invitation code for new user
        let newInviteCode;
        let isCodeUnique = false;
        while (!isCodeUnique) {
            newInviteCode = Math.floor(100000 + Math.random() * 900000).toString();
            const codeExists = await User.findOne({ invitationCode: newInviteCode });
            if (!codeExists) isCodeUnique = true;
        }

        const userData = {
            loginPassword,
            securityPassword,
            invitationCode: newInviteCode,
            referredBy: upline ? upline._id : null
        };

        if (email) userData.email = email;
        if (mobile) {
            userData.mobile = mobile;
            userData.dialCode = dialCode;
        }

        const user = await User.create(userData);

        // Update team size for uplines (up to 3 levels)
        if (upline) {
            await User.findByIdAndUpdate(upline._id, { $inc: { teamSize: 1 } });

            // Level 2
            if (upline.referredBy) {
                await User.findByIdAndUpdate(upline.referredBy, { $inc: { teamSize: 1 } });

                // Level 3
                const uplineLv2 = await User.findById(upline.referredBy);
                if (uplineLv2 && uplineLv2.referredBy) {
                    await User.findByIdAndUpdate(uplineLv2.referredBy, { $inc: { teamSize: 1 } });
                }
            }
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    mobile: user.mobile,
                    dialCode: user.dialCode,
                    invitationCode: user.invitationCode,
                    createdAt: user.createdAt,
                    electronicWallet: user.electronicWallet,
                    flexibleWallet: user.flexibleWallet
                },
                token
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, mobile, dialCode, loginPassword } = req.body;

        // Validate input
        if (!loginPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide password'
            });
        }

        if (!email && !mobile) {
            return res.status(400).json({
                success: false,
                message: 'Please provide either email or mobile number'
            });
        }

        // Find user
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (mobile) {
            user = await User.findOne({ mobile, dialCode });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordMatch = await user.compareLoginPassword(loginPassword);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                mobile: user.mobile,
                dialCode: user.dialCode,
                invitationCode: user.invitationCode,
                electronicWallet: user.electronicWallet,
                flexibleWallet: user.flexibleWallet,
                frozenWallet: user.frozenWallet,
                totalIncome: user.totalIncome,
                totalCommission: user.totalCommission,
                totalRecharge: user.totalRecharge,
                totalWithdraw: user.totalWithdraw,
                teamSize: user.teamSize,
                isAdmin: user.isAdmin
            },
            redirectTo: user.isAdmin === 1 ? '/admin/dashboard' : '/home'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during login'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-loginPassword -securityPassword');

        // Get highest active package
        const UserPackage = require('../models/UserPackage');
        const latestPackage = await UserPackage.findOne({
            user: req.user.id,
            status: 'active'
        }).sort({ createdAt: -1 });

        // Get direct referrals count
        const directInvites = await User.countDocuments({ referredBy: req.user.id });

        // Get withdrawal settings
        const withdrawConfig = await WithdrawFee.findOne() || { feePercentage: 5, minWithdrawal: 2 };

        const userData = user.toObject();
        userData.highestPackage = latestPackage ? latestPackage.packageName : 'Trial';
        userData.directInvites = directInvites;
        userData.withdrawalFee = withdrawConfig.feePercentage;
        userData.minWithdrawal = withdrawConfig.minWithdrawal;
        userData.noSubordinateWithdrawPercent = withdrawConfig.noSubordinateWithdrawPercent || 100;

        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update login password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Please provide all password fields' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'New passwords do not match' });
        }

        const user = await User.findById(req.user.id);

        const isMatch = await user.compareLoginPassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid old password' });
        }

        user.loginPassword = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('UpdatePassword error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update security password
// @route   PUT /api/auth/update-security-password
// @access  Private
const updateSecurityPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Please provide all password fields' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'New passwords do not match' });
        }

        const user = await User.findById(req.user.id);

        const isMatch = await user.compareSecurityPassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid old security password' });
        }

        user.securityPassword = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Security password updated successfully' });
    } catch (error) {
        console.error('UpdateSecurityPassword error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    register,
    login,
    getMe,
    updatePassword,
    updateSecurityPassword
};
