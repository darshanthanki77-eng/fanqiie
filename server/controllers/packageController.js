const Package = require('../models/Package');
const User = require('../models/User');
const UserPackage = require('../models/UserPackage');

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
const getPackages = async (req, res) => {
    try {
        const packages = await Package.find().sort({ order: 1 });
        res.status(200).json({
            success: true,
            count: packages.length,
            data: packages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a package
// @route   POST /api/packages
// @access  Private/Admin
const createPackage = async (req, res) => {
    try {
        const pkg = await Package.create(req.body);
        res.status(201).json({
            success: true,
            data: pkg
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update a package
// @route   PUT /api/packages/:id
// @access  Private/Admin
const updatePackage = async (req, res) => {
    try {
        const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!pkg) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        res.status(200).json({
            success: true,
            data: pkg
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a package
// @route   DELETE /api/packages/:id
// @access  Private/Admin
const deletePackage = async (req, res) => {
    try {
        const pkg = await Package.findByIdAndDelete(req.params.id);

        if (!pkg) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Package deleted'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Check wallet balance for package purchase
// @route   POST /api/packages/check-balance
// @access  Private
const checkWalletBalance = async (req, res) => {
    try {
        const { packageId } = req.body;
        const user = await User.findById(req.user.id);
        const pkg = await Package.findById(packageId);

        if (!pkg) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        // Use regex to remove non-numeric characters (except decimal point) before parsing
        const price = parseFloat(pkg.unlockPrice.toString().replace(/[^0-9.]/g, '')) || 0;
        const hasSufficientBalance = user.electronicWallet >= price;

        res.status(200).json({
            success: true,
            data: {
                hasSufficientBalance,
                currentBalance: user.electronicWallet,
                requiredAmount: price,
                deficit: hasSufficientBalance ? 0 : price - user.electronicWallet
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Purchase a package
// @route   POST /api/packages/purchase
// @access  Private
const purchasePackage = async (req, res) => {
    try {
        const { packageId } = req.body;
        const user = await User.findById(req.user.id);
        const pkg = await Package.findById(packageId);

        if (!pkg) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        const price = parseFloat(pkg.unlockPrice.toString().replace(/[^0-9.]/g, '')) || 0;

        if (user.electronicWallet < price) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        // Deduct balance
        user.electronicWallet -= price;
        await user.save();

        // Create UserPackage
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + pkg.validDays);

        const userPackage = await UserPackage.create({
            user: user._id,
            package: pkg._id,
            packageName: pkg.level,
            dailyEarnings: pkg.dailyEarnings,
            dailyIncome: pkg.dailyIncome,
            unlockPrice: pkg.unlockPrice,
            expiryDate,
            status: 'pending'
        });

        res.status(200).json({
            success: true,
            message: 'Package purchased successfully',
            data: userPackage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user purchased packages
// @route   GET /api/packages/my-packages
// @access  Private
const getUserPackages = async (req, res) => {
    try {
        const userPackages = await UserPackage.find({
            user: req.user.id,
            status: { $in: ['active', 'pending'] }
        }).populate('package');

        res.status(200).json({
            success: true,
            count: userPackages.length,
            data: userPackages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getPackages,
    createPackage,
    updatePackage,
    deletePackage,
    checkWalletBalance,
    purchasePackage,
    getUserPackages
};
