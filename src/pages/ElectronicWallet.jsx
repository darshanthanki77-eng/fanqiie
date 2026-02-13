import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Film } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import './ElectronicWallet.css';

const ElectronicWallet = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // 1. Fetch latest user info for balance
                const authRes = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const authData = await authRes.json();
                if (authData.success) {
                    setBalance(authData.data.electronicWallet || 0);
                    // Update localStorage too
                    localStorage.setItem('user', JSON.stringify(authData.data));
                }

                // 2. Fetch transactions
                const txRes = await fetch(`${API_BASE_URL}/transactions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const txData = await txRes.json();
                if (txData.success) {
                    setTransactions(txData.data);
                }
            } catch (error) {
                console.error('Error fetching wallet data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, []);

    const getStatusText = (status) => {
        return status?.charAt(0).toUpperCase() + status?.slice(1);
    };

    return (
        <div className="wallet-page-container">
            {/* Header */}
            <div className="wallet-header">
                <button className="wallet-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="wallet-title">Electronic wallet</h2>
                <div style={{ width: '20px' }}></div>
            </div>

            {/* Assets Card */}
            <div className="assets-card">
                <div className="assets-card-content">
                    <span className="assets-label">Total Assets(USDT)</span>
                    <h1 className="assets-value">{Number(balance).toFixed(2)}</h1>
                    <button className="deposit-btn" onClick={() => navigate('/recharge')}>
                        Asset Deposit
                    </button>
                </div>
            </div>

            {/* Details Section */}
            <div className="details-section">
                <div className="details-header">
                    <h3 className="details-title">Asset Details</h3>
                    <button className="filter-btn">
                        All <ChevronDown size={14} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading assets...</div>
                ) : transactions.length > 0 ? (
                    <div className="asset-transactions">
                        {transactions.map(item => (
                            <div key={item.id} className="asset-tx-item">
                                <div className="tx-left">
                                    <span className="tx-name">{item.title}</span>
                                    <span className="tx-time">{new Date(item.date).toLocaleString()}</span>
                                </div>
                                <div className="tx-right">
                                    <span className={`tx-amount-val ${['withdraw', 'purchase'].includes(item.type) ? 'neg' : 'pos'}`}>
                                        {['withdraw', 'purchase'].includes(item.type) ? '-' : '+'}{Number(item.amount).toFixed(2)}
                                    </span>
                                    <span className="tx-status-label">{getStatusText(item.status)}</span>
                                    {item.method && <span className="tx-method-label">{item.method}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon-wrapper">
                            <Film size={60} color="#334155" fill="#1e293b" />
                        </div>
                        <p className="empty-text">No data yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ElectronicWallet;
