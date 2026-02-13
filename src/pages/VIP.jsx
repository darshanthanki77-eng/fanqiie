import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InsufficientBalancePopup from '../components/InsufficientBalancePopup';
import MessagePopup from '../components/MessagePopup';
import API_BASE_URL from '../apiConfig';
import './VIP.css';

const VIP = () => {
    const navigate = useNavigate();
    // Timer state
    const [timeLeft, setTimeLeft] = useState('18:27:29');
    const [vipLevels, setVipLevels] = useState([]);
    const [userPackages, setUserPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasingPackageId, setPurchasingPackageId] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState(0);
    const [showInsufficientBalancePopup, setShowInsufficientBalancePopup] = useState(false);

    // Message Popup state
    const [popup, setPopup] = useState({ isOpen: false, message: '', type: 'info' });

    // Effect to update timer (optional, just to make it alive)
    useEffect(() => {
        const timer = setInterval(() => {
            const date = new Date();
            const hours = 23 - date.getHours();
            const minutes = 59 - date.getMinutes();
            const seconds = 59 - date.getSeconds();

            const format = (num) => num.toString().padStart(2, '0');
            setTimeLeft(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch packages and user active packages
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch all available packages
                const packagesRes = await fetch(`${API_BASE_URL}/packages`);
                const packagesData = await packagesRes.json();
                if (packagesData.success) {
                    setVipLevels(packagesData.data);
                }

                // Fetch user active packages if logged in
                if (token) {
                    const myPackagesRes = await fetch(`${API_BASE_URL}/packages/my-packages`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const myPackagesData = await myPackagesRes.json();
                    if (myPackagesData.success) {
                        setUserPackages(myPackagesData.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Helper to get user's status for a package
    const getPackageUserStatus = (packageId) => {
        const up = userPackages.find(up => up.package && (up.package._id === packageId || up.package === packageId));
        return up ? up.status : null;
    };

    const showMsg = (message, type = 'info') => {
        setPopup({ isOpen: true, message, type });
    };

    // Handle package purchase with wallet check
    const handlePurchaseClick = async (pkg) => {
        if (pkg.isOpenSoon) return;

        setPurchasingPackageId(pkg._id);
        setSelectedPrice(pkg.unlockPrice);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                showMsg('Please login first', 'warning');
                setTimeout(() => navigate('/login'), 1500);
                return;
            }

            // Step 1: Check wallet balance
            const checkResponse = await fetch(`${API_BASE_URL}/packages/check-balance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ packageId: pkg._id })
            });

            const checkData = await checkResponse.json();

            if (!checkData.success) {
                showMsg(checkData.message || 'Failed to check balance', 'error');
                setPurchasingPackageId(null);
                return;
            }

            // Step 2: If insufficient balance, show popup
            if (!checkData.data.hasSufficientBalance) {
                setShowInsufficientBalancePopup(true);
                setPurchasingPackageId(null);
                return;
            }

            // Step 3: If sufficient balance, proceed with purchase
            const purchaseResponse = await fetch(`${API_BASE_URL}/packages/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ packageId: pkg._id })
            });

            const purchaseData = await purchaseResponse.json();

            if (purchaseData.success) {
                showMsg('Package purchased successfully!', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                showMsg(purchaseData.message || 'Purchase failed', 'error');
            }
        } catch (error) {
            console.error('Purchase error:', error);
            showMsg('Network error. Please try again.', 'error');
        } finally {
            setPurchasingPackageId(null);
        }
    };

    if (loading) {
        return (
            <div className="vip-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: '#fff' }}>Loading packages...</div>
            </div>
        );
    }

    return (
        <div className="vip-container">
            {/* Header */}
            <div className="vip-header">
                <h2>Member Center</h2>
            </div>

            {/* Dashboard */}
            <div className="vip-dashboard">
                <div className="vip-stats-row">
                    <div className="vip-stat-item">
                        <span className="vip-stat-value">0</span>
                        <span className="vip-stat-label">Today's Earnings(USDT)</span>
                    </div>
                    <div className="vip-stat-divider"></div>
                    <div className="vip-stat-item">
                        <span className="vip-stat-value">0.00</span>
                        <span className="vip-stat-label">Cumulative Earnings(USDT)</span>
                    </div>
                </div>

                <div className="vip-countdown">
                    <div className="countdown-timer">{timeLeft}</div>
                    <div className="countdown-label">Reset Countdown</div>
                </div>
            </div>

            {/* Special Package Label */}
            <div className="vip-section-header">
                <div className="special-package-badge">
                    Special Package
                </div>
            </div>

            {/* VIP List */}
            <div className="vip-levels-list">
                {vipLevels.map((vip) => (
                    <div key={vip.level} className="vip-level-card">
                        <div className="vip-card-header">
                            <span className="vip-level-title">
                                {vip.level.toLowerCase().includes('star') ? vip.level : `${vip.level}-star`}
                            </span>
                        </div>

                        <div className="vip-card-stats">
                            <div className="vip-card-stat-item">
                                <span className="vip-card-stat-value">{vip.dailyEarnings}Times</span>
                                <span className="vip-card-stat-label">Daily Earnings</span>
                            </div>
                            <div className="vip-card-stat-item">
                                <span className="vip-card-stat-value">{vip.validDays}Days</span>
                                <span className="vip-card-stat-label">Valid Time</span>
                            </div>
                            <div className="vip-card-stat-item">
                                <span className="vip-card-stat-value highlight">{vip.dailyIncome}USDT</span>
                                <span className="vip-card-stat-label">Daily income</span>
                            </div>
                        </div>

                        {vip.isOpenSoon || vip.unlockPrice === 'Comming Soon' ? (
                            <button className="vip-action-btn disabled">
                                Open soon
                            </button>
                        ) : getPackageUserStatus(vip._id) === 'active' ? (
                            <button className="vip-action-btn active-status" disabled>
                                ACTIVE
                            </button>
                        ) : getPackageUserStatus(vip._id) === 'pending' ? (
                            <button className="vip-action-btn pending-status" disabled>
                                PENDING
                            </button>
                        ) : (
                            <button
                                className="vip-action-btn"
                                onClick={() => handlePurchaseClick(vip)}
                                disabled={purchasingPackageId === vip._id}
                                style={{ opacity: purchasingPackageId === vip._id ? 0.7 : 1 }}
                            >
                                {purchasingPackageId === vip._id ? 'Processing...' : `${vip.unlockPrice} USDT Unlock now`}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Insufficient Balance Popup */}
            <InsufficientBalancePopup
                isOpen={showInsufficientBalancePopup}
                onClose={() => setShowInsufficientBalancePopup(false)}
                amount={selectedPrice}
            />

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

export default VIP;
