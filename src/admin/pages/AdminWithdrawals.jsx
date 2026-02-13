import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import './AdminWithdrawals.css';

const AdminWithdrawals = () => {
    const navigate = useNavigate();
    const [withdrawals, setWithdrawals] = useState([]);
    const [history, setHistory] = useState([]);
    const [historyFilter, setHistoryFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingWithdrawals();
        } else {
            fetchHistory();
        }
    }, [activeTab, historyFilter]);

    const fetchPendingWithdrawals = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/withdrawals/pending`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setWithdrawals(data.data);
            }
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/withdrawals/history?status=${historyFilter}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setHistory(data.data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        const confirmMsg = action === 'approve'
            ? 'Are you sure you want to approve this withdrawal?'
            : 'Are you sure you want to reject this withdrawal?';

        if (!confirm(confirmMsg)) return;

        try {
            const token = localStorage.getItem('token');
            const endpoint = `${API_BASE_URL}/admin/withdrawals/${id}/${action}`;
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                alert(`Withdrawal ${action}d successfully!`);
                if (activeTab === 'pending') fetchPendingWithdrawals();
                else fetchHistory();
            } else {
                alert(data.message || `Failed to ${action} withdrawal`);
            }
        } catch (error) {
            console.error(`Error ${action}ing withdrawal:`, error);
            alert(`Failed to ${action} withdrawal`);
        }
    };

    const getStatusBadge = (status) => {
        return <span className={`status-badge ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    };

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="admin-page-header">
                <button className="back-btn-circle" onClick={() => navigate('/admin/dashboard')}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="page-title">Manage Withdrawals</h2>
                <div style={{ width: '40px' }}></div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs" style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                <button
                    className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                    style={{ background: 'transparent', border: 'none', color: activeTab === 'pending' ? '#6366f1' : '#94a3b8', fontSize: '14px', fontWeight: '600', padding: '8px 16px', cursor: 'pointer', borderBottom: activeTab === 'pending' ? '2px solid #6366f1' : 'none' }}
                >
                    Pending Requests ({withdrawals.length})
                </button>
                <button
                    className={`admin-tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                    style={{ background: 'transparent', border: 'none', color: activeTab === 'history' ? '#6366f1' : '#94a3b8', fontSize: '14px', fontWeight: '600', padding: '8px 16px', cursor: 'pointer', borderBottom: activeTab === 'history' ? '2px solid #6366f1' : 'none' }}
                >
                    Withdrawal History
                </button>
            </div>

            {/* Withdrawals List */}
            <div className="admin-content">
                {activeTab === 'history' && (
                    <div className="filter-bar" style={{ marginBottom: '16px' }}>
                        <select
                            value={historyFilter}
                            onChange={(e) => setHistoryFilter(e.target.value)}
                            style={{ padding: '8px', borderRadius: '8px', background: '#1e293b', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <option value="all">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Rejected/Failed</option>
                        </select>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : (
                    <div className="withdrawals-list">
                        {(activeTab === 'pending' ? withdrawals : history).length > 0 ? (
                            (activeTab === 'pending' ? withdrawals : history).map((withdraw) => (
                                <div key={withdraw._id} className="withdraw-card">
                                    <div className="withdraw-header">
                                        <div className="user-info-admin">
                                            <span className="user-email">{withdraw.user?.email || withdraw.user?.mobile || 'Unknown'}</span>
                                            <span className="user-code">Code: {withdraw.user?.invitationCode}</span>
                                        </div>
                                        {getStatusBadge(withdraw.status)}
                                    </div>

                                    <div className="withdraw-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Amount:</span>
                                            <span className="detail-value amount">${withdraw.amount?.toFixed(2)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Fee:</span>
                                            <span className="detail-value" style={{ color: '#f59e0b' }}>${withdraw.fee?.toFixed(4) || '0.00'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Actual Arrival:</span>
                                            <span className="detail-value" style={{ color: '#10b981', fontWeight: 'bold' }}>${withdraw.finalAmount?.toFixed(2)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Wallet Address:</span>
                                            <span className="detail-value truncate">{withdraw.walletAddress || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Network:</span>
                                            <span className="detail-value">{withdraw.network || 'TRC20'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Date:</span>
                                            <span className="detail-value">{new Date(withdraw.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {activeTab === 'pending' && (
                                        <div className="withdraw-actions">
                                            <button
                                                className="approve-btn"
                                                onClick={() => handleAction(withdraw._id, 'approve')}
                                            >
                                                <CheckCircle size={18} />
                                                Approve
                                            </button>
                                            <button
                                                className="reject-btn"
                                                onClick={() => handleAction(withdraw._id, 'reject')}
                                            >
                                                <XCircle size={18} />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <Clock size={48} color="#334155" />
                                <p className="empty-text">No {activeTab} withdrawal requests</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminWithdrawals;
