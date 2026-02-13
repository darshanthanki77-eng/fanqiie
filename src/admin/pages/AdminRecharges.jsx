import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import './AdminRecharges.css';

const AdminRecharges = () => {
    const navigate = useNavigate();
    const [recharges, setRecharges] = useState([]);
    const [history, setHistory] = useState([]);
    const [historyFilter, setHistoryFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab, historyFilter]);

    const fetchData = async () => {
        setLoading(true);
        await fetchPendingRecharges();
        setLoading(false);
    };

    const fetchPendingRecharges = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/recharges/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setRecharges(data.data);
            }
        } catch (error) {
            console.error('Error fetching recharges:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/recharges/history?status=${historyFilter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setHistory(data.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleApprove = async (id) => {
        if (!confirm('Are you sure you want to approve this recharge?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/recharges/${id}/confirm`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                alert('Recharge approved successfully!');
                fetchPendingRecharges();
                if (activeTab === 'history') fetchHistory();
            } else {
                alert(data.message || 'Failed to approve recharge');
            }
        } catch (error) {
            console.error('Error approving recharge:', error);
            alert('Failed to approve recharge');
        }
    };

    const handleReject = async (id) => {
        if (!confirm('Are you sure you want to REJECT this recharge?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/recharges/${id}/reject`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                alert('Recharge rejected!');
                fetchPendingRecharges();
                if (activeTab === 'history') fetchHistory();
            } else {
                alert(data.message || 'Failed to reject recharge');
            }
        } catch (error) {
            console.error('Error rejecting recharge:', error);
            alert('Failed to reject recharge');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Completed</span>;
            case 'pending': return <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Pending</span>;
            case 'rejected': return <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Rejected</span>;
            default: return <span className="status-badge">{status}</span>;
        }
    };

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="admin-page-header">
                <button className="back-btn-circle" onClick={() => navigate('/admin/dashboard')}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="page-title">Manage Recharges</h2>
                <div style={{ width: '40px' }}></div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs" style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                <button
                    className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                    style={{ background: 'transparent', border: 'none', color: activeTab === 'pending' ? '#6366f1' : '#94a3b8', fontSize: '14px', fontWeight: '600', padding: '8px 16px', cursor: 'pointer', borderBottom: activeTab === 'pending' ? '2px solid #6366f1' : 'none' }}
                >
                    Pending Requests ({recharges.length})
                </button>
                <button
                    className={`admin-tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                    style={{ background: 'transparent', border: 'none', color: activeTab === 'history' ? '#6366f1' : '#94a3b8', fontSize: '14px', fontWeight: '600', padding: '8px 16px', cursor: 'pointer', borderBottom: activeTab === 'history' ? '2px solid #6366f1' : 'none' }}
                >
                    Recharge History
                </button>
            </div>

            {/* Recharges List */}
            <div className="admin-content">
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : activeTab === 'pending' ? (
                    <div className="recharges-list">
                        {recharges.length > 0 ? (
                            recharges.map((recharge) => (
                                <div key={recharge._id} className="recharge-card">
                                    <div className="recharge-header">
                                        <div className="user-info-admin">
                                            <span className="user-email">{recharge.user?.email || recharge.user?.mobile || 'Unknown'}</span>
                                            <span className="user-code">Code: {recharge.user?.invitationCode}</span>
                                        </div>
                                        {getStatusBadge(recharge.status)}
                                    </div>

                                    <div className="recharge-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Amount:</span>
                                            <span className="detail-value amount">${recharge.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Transaction ID:</span>
                                            <span className="detail-value">{recharge.transactionId}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Method:</span>
                                            <span className="detail-value">{recharge.paymentMethod || 'USDT'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Date:</span>
                                            <span className="detail-value">{new Date(recharge.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="recharge-actions" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                        <button
                                            className="approve-btn"
                                            onClick={() => handleApprove(recharge._id)}
                                            style={{ flex: 1, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                                        >
                                            <CheckCircle size={18} />
                                            Approve
                                        </button>
                                        <button
                                            className="reject-btn"
                                            onClick={() => handleReject(recharge._id)}
                                            style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <XCircle size={18} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No pending recharges</div>
                        )}
                    </div>
                ) : (
                    <div className="history-view">
                        <div className="filter-bar" style={{ marginBottom: '16px' }}>
                            <select
                                value={historyFilter}
                                onChange={(e) => setHistoryFilter(e.target.value)}
                                style={{ padding: '8px', borderRadius: '8px', background: '#1e293b', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="recharges-list">
                            {history.length > 0 ? (
                                history.map((recharge) => (
                                    <div key={recharge._id} className="recharge-card">
                                        <div className="recharge-header">
                                            <div className="user-info-admin">
                                                <span className="user-email">{recharge.user?.email || recharge.user?.mobile || 'Unknown'}</span>
                                                <span className="user-code">Code: {recharge.user?.invitationCode}</span>
                                            </div>
                                            {getStatusBadge(recharge.status)}
                                        </div>

                                        <div className="recharge-details">
                                            <div className="detail-row">
                                                <span className="detail-label">Amount:</span>
                                                <span className="detail-value amount">${recharge.amount.toFixed(2)}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Transaction ID:</span>
                                                <span className="detail-value">{recharge.transactionId}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Date:</span>
                                                <span className="detail-value">{new Date(recharge.createdAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">No history found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRecharges;
