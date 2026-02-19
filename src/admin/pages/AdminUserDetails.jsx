import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User as UserIcon,
    Wallet,
    TrendingUp,
    Users as UsersIcon,
    History,
    Shield,
    Lock,
    Unlock,
    Plus,
    Minus,
    Key,
    UserPlus,
    Download
} from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import './AdminUserDetails.css';

const AdminUserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('recharges');

    // Adjustment Modal State
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustForm, setAdjustForm] = useState({ amount: '', action: 'add', walletType: 'electronicWallet' });

    // Extra Controls State
    const [newParentCode, setNewParentCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/users/${id}/details`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustBalance = async () => {
        if (!adjustForm.amount || isNaN(adjustForm.amount)) return alert('Enter valid amount');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/users/${id}/adjust-balance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(adjustForm)
            });
            const result = await response.json();
            if (result.success) {
                alert(result.message);
                setShowAdjustModal(false);
                fetchUserDetails();
                setAdjustForm({ amount: '', action: 'add', walletType: 'electronicWallet' });
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Adjustment error:', error);
        }
    };

    const handleChangeParent = async () => {
        if (!newParentCode) return alert('Enter new parent invitation code');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/users/${id}/change-parent`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newParentCode })
            });
            const result = await response.json();
            if (result.success) {
                alert(result.message);
                setNewParentCode('');
                fetchUserDetails();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Change parent error:', error);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) return alert('Password must be at least 6 characters');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/users/${id}/reset-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword })
            });
            const result = await response.json();
            if (result.success) {
                alert(result.message);
                setNewPassword('');
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Reset password error:', error);
        }
    };

    const toggleBlock = async () => {
        if (!confirm(`Are you sure you want to ${data.user.isBlocked ? 'unblock' : 'block'} this user?`)) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/users/${id}/block`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                fetchUserDetails();
            }
        } catch (error) {
            console.error('Block toggle error:', error);
        }
    };

    if (loading && !data) return <div className="aud-container"><div className="loading-state">Loading user profile...</div></div>;

    const { user, earnings, teamSummary, downline, histories } = data;

    return (
        <div className="aud-container">
            {/* Header */}
            <div className="aud-header">
                <div className="aud-header-left">
                    <button className="back-btn-circle" onClick={() => navigate('/admin/users')}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="aud-title">User Management Panel</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={`aud-btn ${user.isBlocked ? 'aud-btn-primary' : 'aud-btn-danger'}`} onClick={toggleBlock}>
                        {user.isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
                        {user.isBlocked ? 'Unblock User' : 'Block User'}
                    </button>
                    <button className="aud-btn aud-btn-primary" onClick={() => window.print()}>
                        <Download size={18} /> Export Profile
                    </button>
                </div>
            </div>

            <div className="aud-grid">
                {/* Left Column: Basic Info & Extra Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="aud-card">
                        <h3 className="aud-card-title"><UserIcon size={18} /> Basic Information</h3>
                        <div className="info-row"><span className="info-label">User ID</span><span className="info-value">#{user.invitationCode}</span></div>
                        <div className="info-row"><span className="info-label">Email/Mobile</span><span className="info-value">{user.email || user.mobile}</span></div>
                        <div className="info-row"><span className="info-label">Parent (Upline)</span><span className="info-value">{user.referredBy?.email || user.referredBy?.mobile || 'Primary System'}</span></div>
                        <div className="info-row"><span className="info-label">Active Package</span><span className="info-value" style={{ color: '#f59e0b' }}>{user.currentPackageName}</span></div>
                        <div className="info-row"><span className="info-label">Joined On</span><span className="info-value">{new Date(user.createdAt).toLocaleDateString()}</span></div>
                        <div className="info-row">
                            <span className="info-label">Status</span>
                            <span className={`type-badge ${user.isBlocked ? 'type-expense' : 'type-income'}`}>
                                {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                            </span>
                        </div>
                    </div>

                    <div className="aud-card">
                        <h3 className="aud-card-title"><Shield size={18} /> Administrative Controls</h3>
                        <div className="control-grid">
                            <div className="action-card-mini">
                                <span className="acm-title"><UserPlus size={14} /> Change Parent</span>
                                <input
                                    className="acm-input"
                                    placeholder="New Parent Code"
                                    value={newParentCode}
                                    onChange={(e) => setNewParentCode(e.target.value)}
                                />
                                <button className="aud-btn aud-btn-primary" style={{ width: '100%', fontSize: '11px' }} onClick={handleChangeParent}>Update Parent</button>
                            </div>
                            <div className="action-card-mini">
                                <span className="acm-title"><Key size={14} /> Reset Password</span>
                                <input
                                    type="password"
                                    className="acm-input"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button className="aud-btn aud-btn-danger" style={{ width: '100%', fontSize: '11px' }} onClick={handleResetPassword}>Set Password</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Earnings & Wallet */}
                <div className="aud-card">
                    <h3 className="aud-card-title"><Wallet size={18} /> Financial Stats & Wallets</h3>
                    <div className="earnings-grid">
                        <div className="earning-box">
                            <span className="eb-label">Main Wallet</span>
                            <span className="eb-val">${user.electronicWallet.toFixed(2)}</span>
                        </div>
                        <div className="earning-box">
                            <span className="eb-label">Flexible Wallet</span>
                            <span className="eb-val">${user.flexibleWallet.toFixed(2)}</span>
                        </div>
                        <div className="earning-box">
                            <span className="eb-label">Total Deposits</span>
                            <span className="eb-val">${user.totalRecharge.toFixed(2)}</span>
                        </div>
                        <div className="earning-box">
                            <span className="eb-label">Daily ROI Earned</span>
                            <span className="eb-val">${earnings.selfIncome.toFixed(2)}</span>
                        </div>
                        <div className="earning-box">
                            <span className="eb-label">Team Level Income</span>
                            <span className="eb-val">${earnings.refCommission.toFixed(2)}</span>
                        </div>
                        <div className="earning-box" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                            <span className="eb-label">Total Withdrawn</span>
                            <span className="eb-val expense">${earnings.totalWithdrawn.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="wallet-controls">
                        <button className="aud-btn aud-btn-success" onClick={() => { setAdjustForm({ ...adjustForm, action: 'add' }); setShowAdjustModal(true); }}>
                            <Plus size={16} /> Load Funds
                        </button>
                        <button className="aud-btn aud-btn-danger" onClick={() => { setAdjustForm({ ...adjustForm, action: 'deduct' }); setShowAdjustModal(true); }}>
                            <Minus size={16} /> Deduct Funds
                        </button>
                    </div>
                </div>
            </div>

            {/* Team Summary */}
            <div className="aud-card" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                    <div className="eb-label">TOTAL UMBRELLA</div>
                    <div className="eb-val" style={{ color: 'white' }}>{teamSummary.totalTeam} USERS</div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                <div>
                    <div className="eb-label">ACTIVE PLAYERS</div>
                    <div className="eb-val" style={{ color: '#10b981' }}>{teamSummary.activeTeam} USERS</div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                <div>
                    <div className="eb-label">TEAM BUSINESS</div>
                    <div className="eb-val" style={{ color: '#6366f1' }}>${teamSummary.teamBusiness.toFixed(2)}</div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                <div>
                    <div className="eb-label">TOTAL COMMISSION Payout</div>
                    <div className="eb-val" style={{ color: '#f59e0b' }}>${teamSummary.totalCommission.toFixed(2)}</div>
                </div>
            </div>

            {/* Subordinate Tree */}
            <div className="tree-section">
                <h3 className="aud-card-title"><UsersIcon size={18} /> Visual Team Structure</h3>

                {['level1', 'level2', 'level3'].map((l, i) => (
                    <div key={l} style={{ marginBottom: '30px' }}>
                        <div className="tree-level-header">
                            <span>LEVEL {i + 1} MEMBERS</span>
                            <span>{downline[l].length} TOTAL</span>
                        </div>
                        {downline[l].length > 0 ? (
                            <div className="tree-grid">
                                {downline[l].map(sub => (
                                    <div key={sub._id} className="tree-user-card">
                                        <div className="tree-user-top">
                                            <span className="tree-user-id">#{sub.invitationCode}</span>
                                            <div className={`tree-status ${sub.totalRecharge > 0 ? 'active' : 'inactive'}`} title={sub.totalRecharge > 0 ? 'Active Depositor' : 'Idle User'}></div>
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', color: '#f1f5f9' }}>{sub.email || sub.mobile}</div>
                                        <div className="info-row" style={{ padding: '4px 0', fontSize: '11px' }}>
                                            <span style={{ color: '#64748b' }}>Deposit:</span>
                                            <span style={{ color: '#10b981' }}>${sub.totalRecharge.toFixed(2)}</span>
                                        </div>
                                        <div className="info-row" style={{ padding: '4px 0', fontSize: '11px' }}>
                                            <span style={{ color: '#64748b' }}>Income:</span>
                                            <span style={{ color: '#6366f1' }}>${sub.totalIncome.toFixed(2)}</span>
                                        </div>
                                        <button
                                            className="aud-btn aud-btn-primary"
                                            style={{ width: '100%', marginTop: '12px', padding: '5px', fontSize: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}
                                            onClick={() => {
                                                navigate(`/admin/users/${sub._id}/details`);
                                                window.scrollTo(0, 0);
                                            }}
                                        >
                                            Drill Down Information
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : <div className="empty-state" style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '10px' }}>No direct referrals at this level</div>}
                    </div>
                ))}
            </div>

            {/* History Tabs */}
            <div className="aud-card">
                <div className="aud-tabs">
                    <button className={`aud-tab ${activeTab === 'recharges' ? 'active' : ''}`} onClick={() => setActiveTab('recharges')}>Dep History</button>
                    <button className={`aud-tab ${activeTab === 'withdrawals' ? 'active' : ''}`} onClick={() => setActiveTab('withdrawals')}>With History</button>
                    <button className={`aud-tab ${activeTab === 'commissions' ? 'active' : ''}`} onClick={() => setActiveTab('commissions')}>Level Income</button>
                    <button className={`aud-tab ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}>Package History</button>
                </div>

                <div className="table-wrapper">
                    <table className="history-table">
                        {activeTab === 'recharges' && (
                            <>
                                <thead><tr><th>Amount</th><th>Method</th><th>Status</th><th>Time</th></tr></thead>
                                <tbody>
                                    {histories.recharges.length > 0 ? histories.recharges.map(h => (
                                        <tr key={h._id}>
                                            <td style={{ fontWeight: 600 }}>${h.amount.toFixed(2)}</td>
                                            <td>{h.paymentMethod}</td>
                                            <td><span className={`type-badge ${h.status === 'completed' ? 'type-income' : 'type-expense'}`}>{h.status}</span></td>
                                            <td>{new Date(h.createdAt).toLocaleString()}</td>
                                        </tr>
                                    )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No deposit records</td></tr>}
                                </tbody>
                            </>
                        )}
                        {activeTab === 'withdrawals' && (
                            <>
                                <thead><tr><th>Gross</th><th>Profit</th><th>Fee</th><th>Status</th></tr></thead>
                                <tbody>
                                    {histories.withdrawals.length > 0 ? histories.withdrawals.map(h => (
                                        <tr key={h._id}>
                                            <td style={{ fontWeight: 600 }}>${h.amount.toFixed(2)}</td>
                                            <td style={{ color: '#10b981' }}>${h.finalAmount.toFixed(2)}</td>
                                            <td style={{ color: '#ef4444' }}>${h.fee.toFixed(2)}</td>
                                            <td><span className={`type-badge ${h.status === 'approved' ? 'type-income' : 'type-expense'}`}>{h.status}</span></td>
                                        </tr>
                                    )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No withdrawal records</td></tr>}
                                </tbody>
                            </>
                        )}
                        {activeTab === 'commissions' && (
                            <>
                                <thead><tr><th>Source</th><th>Value</th><th>Lvl</th><th>Source Type</th></tr></thead>
                                <tbody>
                                    {histories.commissions.length > 0 ? histories.commissions.map(h => (
                                        <tr key={h._id}>
                                            <td>{h.from?.email || h.from?.mobile}</td>
                                            <td style={{ color: '#10b981', fontWeight: 600 }}>+${h.amount.toFixed(2)}</td>
                                            <td>L{h.level}</td>
                                            <td>{h.type}</td>
                                        </tr>
                                    )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No commission records</td></tr>}
                                </tbody>
                            </>
                        )}
                        {activeTab === 'packages' && (
                            <>
                                <thead><tr><th>Package Name</th><th>Price</th><th>Purchase Date</th><th>Current Status</th></tr></thead>
                                <tbody>
                                    {histories.packages.length > 0 ? histories.packages.map(h => (
                                        <tr key={h._id}>
                                            <td>{h.package?.name}</td>
                                            <td>${h.package?.unlockPrice}</td>
                                            <td>{new Date(h.createdAt).toLocaleDateString()}</td>
                                            <td><span className={`type-badge ${h.status === 'active' ? 'type-income' : 'type-expense'}`}>{h.status}</span></td>
                                        </tr>
                                    )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No package purchases</td></tr>}
                                </tbody>
                            </>
                        )}
                    </table>
                </div>
            </div>

            {/* Adjust Balance Modal */}
            {showAdjustModal && (
                <div className="aud-modal-overlay" onClick={() => setShowAdjustModal(false)}>
                    <div className="aud-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="aud-card-title">Manual Balance Correction</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <span className={`type-badge ${adjustForm.action === 'add' ? 'type-income' : 'type-expense'}`}>
                                {adjustForm.action === 'add' ? 'INJECTING FUNDS' : 'DEDUCTING FUNDS'}
                            </span>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Target Wallet</label>
                            <select className="modal-input" value={adjustForm.walletType} onChange={e => setAdjustForm({ ...adjustForm, walletType: e.target.value })}>
                                <option value="electronicWallet">Electronic Wallet (Main)</option>
                                <option value="flexibleWallet">Flexible Wallet (Daily)</option>
                                <option value="frozenWallet">Frozen Assets</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Adjustment Amount (USDT)</label>
                            <input
                                type="number"
                                className="modal-input"
                                placeholder="0.00"
                                value={adjustForm.amount}
                                onChange={e => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="aud-btn aud-btn-primary" style={{ flex: 1 }} onClick={handleAdjustBalance}>Confirm Change</button>
                            <button className="aud-btn aud-btn-danger" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserDetails;
