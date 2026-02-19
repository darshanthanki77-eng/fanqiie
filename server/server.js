const path = require('path');
// Try to load from root first, then server dir if needed
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.MONGODB_URI) {
    require('dotenv').config({ path: path.resolve(__dirname, '.env') });
}
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const trailerRoutes = require('./routes/trailerRoutes');
const packageRoutes = require('./routes/packageRoutes');
const rechargeRoutes = require('./routes/rechargeRoutes');
const withdrawRoutes = require('./routes/withdrawRoutes');
const incomeRoutes = require('./routes/incomeRoutes');

const taskRoutes = require('./routes/taskRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// Trust proxy for accurate IP tracking
app.set('trust proxy', true);

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trailers', trailerRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/recharge', rechargeRoutes);
app.use('/api/withdraw', withdrawRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/config', require('./routes/configRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
