import React, { useState, useEffect } from 'react';
import { ArrowLeft, Film, Wallet, ShoppingBag, ArrowUpRight, ArrowDownLeft, TrendingUp, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';
import './Record.css';

const Record = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('record'); // 'record' or 'history'
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/transactions`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setTransactions(data.data);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'approved':
                return '#10b981';
            case 'pending':
                return '#f59e0b';
            case 'failed':
            case 'rejected':
                return '#ef4444';
            default:
                return '#94a3b8';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'recharge':
                return <ArrowDownLeft size={18} color="#10b981" />;
            case 'withdraw':
                return <ArrowUpRight size={18} color="#ef4444" />;
            case 'purchase':
                return <ShoppingBag size={18} color="#6366f1" />;
            case 'commission':
                return <TrendingUp size={18} color="#a855f7" />;
            case 'earning':
                return <PlayCircle size={18} color="#10b981" />;
            default:
                return <Wallet size={18} color="#94a3b8" />;
        }
    };

    return (
        <div className="record-container">
            <div className="record-top-nav">
                <button className="back-btn-circle" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <div className="record-tabs-header">
                    <span
                        className={`record-tab ${tab === 'record' ? 'active' : ''}`}
                        onClick={() => setTab('record')}
                    >
                        Record
                    </span>
                    <span
                        className={`record-tab ${tab === 'history' ? 'active' : ''}`}
                        onClick={() => setTab('history')}
                    >
                        History record
                    </span>
                </div>
            </div>

            <div className="record-content">
                {loading ? (
                    <div className="loading-state">Loading records...</div>
                ) : transactions.length > 0 ? (
                    <div className="transactions-list">
                        {transactions.map((item) => (
                            <div key={item.id} className="transaction-item">
                                <div className="tx-icon-box">
                                    {getIcon(item.type)}
                                </div>
                                <div className="tx-details">
                                    <div className="tx-row-top">
                                        <span className="tx-title">{item.title}</span>
                                        <span className={`tx-amount ${['withdraw', 'purchase'].includes(item.type) ? 'neg' : 'pos'}`}>
                                            {['withdraw', 'purchase'].includes(item.type) ? '-' : '+'}{Number(item.amount).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="tx-row-bottom">
                                        <span className="tx-date">
                                            {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="tx-status" style={{ color: getStatusColor(item.status) }}>
                                            {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                                        </span>
                                        {item.type === 'recharge' && item.status !== 'completed' && (
                                            <button
                                                className="approve-test-btn"
                                                onClick={() => handleApprove(item.id)}
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <Film size={80} color="#4b5563" fill="#1f2937" />
                        </div>
                        <div className="empty-state-text">No data yet</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Record;
