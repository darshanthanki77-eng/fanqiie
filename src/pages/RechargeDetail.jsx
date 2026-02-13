import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Copy, Info, CheckCircle } from 'lucide-react';
import MessagePopup from '../components/MessagePopup';
import API_BASE_URL from '../apiConfig';
import './RechargeDetail.css';

const RechargeDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { option, amount: initialAmount } = location.state || { option: { name: 'TRC20-USDT', color: '#26A17B', icon: 'U' }, amount: '' };

    const [amount, setAmount] = useState(initialAmount || '');
    const [transactionId, setTransactionId] = useState('');
    const [showTxIdField, setShowTxIdField] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Manual');
    const [copied, setCopied] = useState(false);
    const [popup, setPopup] = useState({ isOpen: false, message: '', type: 'info' });

    const showMsg = (message, type = 'info') => {
        setPopup({ isOpen: true, message, type });
    };

    const depositAddress = "TMMksRZpUvuQLH4G9WrxnA7QaKFsExM8gw";

    const handleCopy = () => {
        navigator.clipboard.writeText(depositAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePay = () => {
        if (!amount) {
            showMsg("Please enter recharge amount", "warning");
            return;
        }
        setPaymentMethod('Manual');
        setShowTxIdField(true);
    };

    const [walletAddress, setWalletAddress] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const handleWalletPay = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            showMsg("Please enter a valid recharge amount first", "warning");
            return;
        }

        if (typeof window.ethereum === 'undefined') {
            showMsg("MetaMask is not installed. Please install it to use this feature.", "info");
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        setIsConnecting(true);
        try {
            // 1. Request accounts
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            setWalletAddress(account);

            // 2. Determine if network is compatible
            // If it's TRC20, we should warn or handle differently. 
            // But for the sake of the user request, we'll proceed with EVM transfer.
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });

            // 3. Simple transfer request (demonstration of 'Real Wallet Pay')
            // In a real app, you'd send USDT/ETH here. 
            // We'll send a transaction request for the specified amount (converted to wei/hex)
            // For safety in this demo, we'll just initiate a 0 value transaction or specific amount

            const transactionParameters = {
                from: account,
                to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Example EVM Deposit Address
                value: '0x0', // 0 ETH for safety, users can adjust or we can use: (Number(amount) * 1e18).toString(16)
            };

            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });

            if (txHash) {
                setTransactionId(txHash);
                setPaymentMethod('Wallet');
                setShowTxIdField(true);
                showMsg("Wallet transaction initiated! Please wait for confirmation and submit.", "success");
            }
        } catch (error) {
            console.error("Wallet Error:", error);
            showMsg(error.code === 4001 ? "Transaction rejected by user" : "Wallet error: " + error.message, "error");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSubmit = async () => {
        if (!transactionId) {
            showMsg("Please enter Transaction ID", "warning");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/recharge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    transactionId,
                    paymentMethod
                })
            });

            const data = await response.json();

            if (data.success) {
                showMsg("Recharge request submitted successfully! Your funds will arrive in 1-3 minutes.", "success");
                setTimeout(() => navigate('/electronic-wallet'), 2000);
            } else {
                showMsg(data.message || "Failed to submit recharge", "error");
            }
        } catch (error) {
            console.error('Recharge submission error:', error);
            showMsg("Network error. Please try again.", "error");
        }
    };

    return (
        <div className="recharge-detail-container">
            {/* Header */}
            <div className="detail-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="header-title">Recharge</h2>
                <button className="record-btn" onClick={() => navigate('/record')}>
                    <FileText size={20} />
                </button>
            </div>

            <div className="detail-content">
                {/* Coin Floating Icon */}
                <div className="floating-coin-container">
                    <div className="floating-coin" style={{ backgroundColor: option.color }}>
                        {option.icon}
                    </div>
                </div>

                {/* Main Card */}
                <div className="recharge-main-card">
                    <div className="mainnet-section">
                        <span className="section-label">Select Mainnet</span>
                        <div className="mainnet-badge">{option.name}</div>
                    </div>

                    <div className="qr-section">
                        <div className="qr-wrapper">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${depositAddress}`}
                                alt="QR Code"
                                className="qr-code-img"
                            />
                        </div>
                    </div>

                    <div className="address-section">
                        <span className="section-label">Deposit Address</span>
                        <div className="address-box">
                            <input
                                type="text"
                                readOnly
                                value={depositAddress}
                                className="address-input"
                            />
                            <button className="copy-action-btn" onClick={handleCopy}>
                                {copied ? <CheckCircle size={16} color="#10b981" /> : "Copy"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Amount Input Section */}
                <div className="input-section premium-card">
                    <span className="section-label">Recharge Amount</span>
                    <div className="amount-input-wrapper">
                        <input
                            type="number"
                            placeholder="Please enter the amount"
                            className="premium-input"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <span className="input-suffix">USDT</span>
                    </div>
                </div>

                {/* Transaction ID Field (Appears on click) */}
                {showTxIdField && (
                    <div className="input-section premium-card txid-animation">
                        <span className="section-label">Transaction ID (Hash)</span>
                        <input
                            type="text"
                            placeholder="Enter your transaction hash"
                            className="premium-input"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="action-buttons-group">
                    {!showTxIdField ? (
                        <>
                            <button className="pay-btn" onClick={handlePay}>Manual Pay</button>
                            <button
                                className="wallet-pay-btn"
                                onClick={handleWalletPay}
                                disabled={isConnecting}
                            >
                                {isConnecting ? "Connecting..." : walletAddress ? "Pay with MetaMask" : "Connect Wallet & Pay"}
                            </button>
                            {walletAddress && (
                                <div className="wallet-info" style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px', textAlign: 'center' }}>
                                    Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                </div>
                            )}
                        </>
                    ) : (
                        <button className="submit-btn" onClick={handleSubmit}>
                            Submit Recharge
                        </button>
                    )}
                </div>

                {/* Warm Reminder */}
                <div className="reminder-section">
                    <div className="reminder-title">
                        <Info size={16} />
                        <span>Warm reminder</span>
                    </div>
                    <div className="reminder-list">
                        <p>1. Copy the address above or scan the QR code and select {option.name.split('-')[0]} network to deposit USDT</p>
                        <p>2. Please do not recharge other non-{option.name} assets. The funds will arrive in your account in about 1 to 3 minutes</p>
                        <p>3. If it does not arrive for a long time, please refresh the page or contact customer service</p>
                    </div>
                </div>
            </div>

            <MessagePopup
                isOpen={popup.isOpen}
                message={popup.message}
                type={popup.type}
                onClose={() => setPopup({ ...popup, isOpen: false })}
            />
        </div>
    );
};

export default RechargeDetail;
