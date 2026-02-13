import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Eye, EyeOff, Info } from 'lucide-react';
import MessagePopup from '../components/MessagePopup';
import API_BASE_URL from '../apiConfig';
import './Withdraw.css';

const Withdraw = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [feePercentage, setFeePercentage] = useState(5);
    const [minLimit, setMinLimit] = useState(2);
    const [selectedNet, setSelectedNet] = useState('TRC20-USDT');
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Message Popup state
    const [popup, setPopup] = useState({ isOpen: false, message: '', type: 'info' });

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setBalance(data.data.electronicWallet || 0);
                    setFeePercentage(data.data.withdrawalFee || 5);
                    setMinLimit(data.data.minWithdrawal || 2);
                }
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        };
        fetchBalance();
    }, [navigate]);

    const networks = [
        { id: 'TRC20-USDT', icon: 'T', color: '#26A17B' },
        { id: 'BEP20-USDT', icon: 'B', color: '#F3BA2F' },
        { id: 'POLYGON-USDT', icon: 'P', color: '#8247E5' }
    ];

    const handleAll = () => {
        setAmount(balance);
    };

    const calculateFee = () => {
        if (!amount) return "0.000000";
        return (parseFloat(amount) * (feePercentage / 100)).toFixed(6);
    };

    const calculateArrival = () => {
        if (!amount) return 0;
        const fee = parseFloat(calculateFee());
        const val = parseFloat(amount) - fee;
        return val > 0 ? val.toFixed(2) : 0;
    };

    const showMsg = (message, type = 'info') => {
        setPopup({ isOpen: true, message, type });
    };

    const handleConfirm = async () => {
        if (!address || !amount || !password) {
            showMsg("Please fill in all fields", "warning");
            return;
        }
        if (parseFloat(amount) < minLimit) {
            showMsg(`Minimum withdrawal is ${minLimit} USDT`, "warning");
            return;
        }
        if (parseFloat(amount) > balance) {
            showMsg("Insufficient balance", "error");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    walletAddress: address,
                    network: selectedNet,
                    securityPassword: password
                })
            });

            const data = await response.json();

            if (data.success) {
                showMsg("Withdrawal request submitted successfully!", "success");
                setTimeout(() => {
                    navigate('/record');
                }, 2000);
            } else {
                showMsg(data.message || "Withdrawal failed", "error");
            }
        } catch (error) {
            console.error('Withdrawal error:', error);
            showMsg("Network error. Please try again later.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="withdraw-page-container">
            {/* Header */}
            <div className="withdraw-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="header-title">Withdraw</h2>
                <button className="record-btn" onClick={() => navigate('/record', { state: { type: 'withdraw' } })}>
                    <FileText size={20} />
                </button>
            </div>

            {/* Asset Card */}
            <div className="asset-display-card">
                <span className="asset-label">Currently available assets(USDT)</span>
                <h1 className="asset-value">{parseFloat(balance).toFixed(6)}</h1>
            </div>

            {/* Mainnet Selection */}
            <div className="form-section">
                <span className="section-title">Select Mainnet</span>
                <div className="network-grid">
                    {networks.map((net) => (
                        <div
                            key={net.id}
                            className={`network-chip ${selectedNet === net.id ? 'active' : ''}`}
                            onClick={() => setSelectedNet(net.id)}
                        >
                            <div className="net-icon" style={{ background: net.color }}>{net.icon}</div>
                            <span>{net.id}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Withdrawal Address */}
            <div className="form-section">
                <span className="section-title">Withdrawal address</span>
                <div className="input-box">
                    <input
                        type="text"
                        placeholder="Please enter or long press to paste the withdrawal address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
            </div>

            {/* Withdrawal Amount */}
            <div className="form-section">
                <span className="section-title">Withdrawal amount</span>
                <div className="input-box">
                    <input
                        type="number"
                        placeholder="Please enter the transfer amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <button className="all-btn" onClick={handleAll}>All</button>
                </div>
                <p className="limit-text">Minimum withdrawal amount: {parseFloat(minLimit).toFixed(3)}USDT Maximum withdrawal amount: 99999999.00USDT</p>
            </div>

            {/* Security Password */}
            <div className="form-section">
                <span className="section-title">Security password</span>
                <div className="input-box">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Security password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="summary-section">
                <div className="summary-row">
                    <span>Fee:</span>
                    <span>{calculateFee()} USDT</span>
                </div>
                <div className="summary-row">
                    <span>Actual arrival:</span>
                    <span>{calculateArrival()} USDT</span>
                </div>
            </div>

            {/* Confirm Button */}
            <button
                className="confirm-btn"
                onClick={handleConfirm}
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
            >
                {loading ? 'Processing...' : 'Confirm'}
            </button>

            {/* Reminder */}
            <div className="warm-reminder">
                <div className="reminder-header">
                    <Info size={16} />
                    <span>Warm reminder</span>
                </div>
                <p>
                    The minimum withdrawal amount for BEP20 is 2USDT, and the minimum withdrawal amount for TRC20 is 2USDT. It supports 24-hour withdrawals. The withdrawal fee is {feePercentage}% (because taxes need to be paid, a withdrawal fee is required). Depending on the time and region of each country, the fastest time for withdrawal is 1 minute and the slowest time is 24 hours. Please wait patiently. If your account does not arrive within 24 hours, please contact online customer service.
                </p>
            </div>

            {/* Message Popup */}
            <MessagePopup
                isOpen={popup.isOpen}
                message={popup.message}
                type={popup.type}
                onClose={() => setPopup({ ...popup, isOpen: false })}
            />
        </div>
    );
};

export default Withdraw;
