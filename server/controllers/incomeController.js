const LevelIncome = require('../models/LevelIncome');

// @desc    Get my level income logs
// @route   GET /api/income/my
// @access  Private
const getMyIncomes = async (req, res) => {
    try {
        const incomes = await LevelIncome.find({ to: req.user.id })
            .populate('from', 'email mobile')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: incomes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get income summary (stats)
// @route   GET /api/income/stats
// @access  Private
const getIncomeStats = async (req, res) => {
    try {
        const stats = await LevelIncome.aggregate([
            { $match: { to: req.user.id } },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getMyIncomes,
    getIncomeStats
};
