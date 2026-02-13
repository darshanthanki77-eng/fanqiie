const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return !v || /^\S+@\S+\.\S+$/.test(v);
            },
            message: 'Invalid email format'
        }
    },
    mobile: {
        type: String,
        trim: true
    },
    dialCode: {
        type: String
    },
    loginPassword: {
        type: String,
        required: [true, 'Login password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    securityPassword: {
        type: String,
        required: [true, 'Security password is required'],
        minlength: [4, 'Security password must be at least 4 characters']
    },
    invitationCode: {
        type: String
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Wallets
    electronicWallet: {
        type: Number,
        default: 0
    },
    flexibleWallet: {
        type: Number,
        default: 0
    },
    frozenWallet: {
        type: Number,
        default: 0
    },
    // Stats
    totalIncome: {
        type: Number,
        default: 0
    },
    totalCommission: {
        type: Number,
        default: 0
    },
    totalRecharge: {
        type: Number,
        default: 0
    },
    totalWithdraw: {
        type: Number,
        default: 0
    },
    teamSize: {
        type: Number,
        default: 0
    },
    isAdmin: {
        type: Number,
        default: 0,
        enum: [0, 1] // 0 = user, 1 = admin
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for unique email, mobile, and invitationCode
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ mobile: 1, dialCode: 1 }, { unique: true, sparse: true });
userSchema.index({ invitationCode: 1 }, { unique: true, sparse: true });

// Hash passwords before saving
userSchema.pre('save', async function () {
    if (!this.isModified('loginPassword') && !this.isModified('securityPassword')) {
        return;
    }

    try {
        if (this.isModified('loginPassword')) {
            const salt = await bcrypt.genSalt(10);
            this.loginPassword = await bcrypt.hash(this.loginPassword, salt);
        }

        if (this.isModified('securityPassword')) {
            const salt = await bcrypt.genSalt(10);
            this.securityPassword = await bcrypt.hash(this.securityPassword, salt);
        }
    } catch (error) {
        throw error;
    }
});

// Method to compare login password
userSchema.methods.compareLoginPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.loginPassword);
};

// Method to compare security password
userSchema.methods.compareSecurityPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.securityPassword);
};

module.exports = mongoose.model('User', userSchema);
