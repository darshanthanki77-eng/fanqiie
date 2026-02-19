import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Edit2, Ban, CheckCircle, Save, X, Lock, Filter, Shield, Users } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import './AdminUsers.css';

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBlocked, setFilterBlocked] = useState('all'); // all, active, blocked

    // Edit State
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({});

    // New Feature: Password Reset
    const [showPasswordReset, setShowPasswordReset] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockToggle = async (id, isBlocked) => {
        const action = isBlocked ? 'unblock' : 'block';
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/users/${id}/block`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                // Optimistic UI update
                setUsers(users.map(u => u._id === id ? { ...u, isBlocked: !isBlocked } : u));
                alert(`User ${action}ed successfully`);
            }
        } catch (error) {
            console.error('Error blocking user:', error);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditForm({
            email: user.email || '',
            mobile: user.mobile || '',
            electronicWallet: user.electronicWallet || 0,
            flexibleWallet: user.flexibleWallet || 0,
            frozenWallet: user.frozenWallet || 0,
            totalRecharge: user.totalRecharge || 0,
            totalWithdraw: user.totalWithdraw || 0,
            totalIncome: user.totalIncome || 0
        });
        setShowPasswordReset(false);
    };

    const handleUpdateUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const payload = { ...editForm };

            // Only include password if explicitly set and valid
            if (showPasswordReset && editForm.loginPassword && editForm.loginPassword.length >= 6) {
                payload.loginPassword = editForm.loginPassword;
            } else {
                delete payload.loginPassword;
            }

            const response = await fetch(`${API_BASE_URL}/admin/users/${editingUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                alert('User updated successfully');
                setEditingUser(null);
                fetchUsers();
            } else {
                alert(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.mobile?.includes(searchTerm) ||
            user.invitationCode?.includes(searchTerm) ||
            user._id.includes(searchTerm);

        const matchesFilter =
            filterBlocked === 'all' ? true :
                filterBlocked === 'blocked' ? user.isBlocked :
                    !user.isBlocked;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="admin-page-header">
                <div className="header-left">
                    <button className="back-btn-circle" onClick={() => navigate('/admin/dashboard')}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="page-title">Manage Users ({users.length})</h2>
                </div>
            </div>

            {/* Controls */}
            <div className="admin-controls">
                <div className="search-box">
                    <Search size={18} color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Search by email, mobile, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-box">
                    <Filter size={16} color="#94a3b8" />
                    <select
                        value={filterBlocked}
                        onChange={(e) => setFilterBlocked(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="blocked">Blocked Only</option>
                    </select>
                </div>
            </div>

            {/* Table View */}
            <div className="admin-content table-container">
                {loading ? (
                    <div className="loading-state">Loading users...</div>
                ) : filteredUsers.length > 0 ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User Info</th>
                                <th>Assets</th>
                                <th>Transactions</th>
                                <th>Team</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className={user.isBlocked ? 'row-blocked' : ''}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar-small">
                                                {(user.email || user.mobile || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-detail-text">
                                                <span className="primary-text">{user.email || user.mobile}</span>
                                                <span className="secondary-text">ID: {user.invitationCode}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="finance-cell">
                                            <span className="balance positive">${user.electronicWallet?.toFixed(2)}</span>
                                            <span className="secondary-text">Frozen: ${user.frozenWallet?.toFixed(2)}</span>
                                            <span className="commission-text">Comm: ${user.totalCommission?.toFixed(2)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="finance-cell">
                                            <span className="recharge-text">In: ${user.totalRecharge?.toFixed(2)}</span>
                                            <span className="withdraw-text">Out: ${user.totalWithdraw?.toFixed(2)}</span>
                                        </div>
                                    </td>
                                    <td>{user.teamSize || 0}</td>
                                    <td>
                                        <span className={`status-badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="date-cell">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="icon-action edit"
                                                style={{ color: '#6366f1' }}
                                                onClick={() => navigate(`/admin/users/${user._id}/details`)}
                                                title="Comprehensive User Profile"
                                            >
                                                <Shield size={16} />
                                            </button>
                                            <button
                                                className="icon-action view"
                                                onClick={() => navigate(`/downline-details?userId=${user._id}`)}
                                                title="View Downline Details"
                                            >
                                                <Users size={16} />
                                            </button>
                                            <button
                                                className="icon-action edit"
                                                onClick={() => handleEditClick(user)}
                                                title="Edit User"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className={`icon-action ${user.isBlocked ? 'unblock' : 'block'}`}
                                                onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                                                title={user.isBlocked ? "Unblock User" : "Block User"}
                                            >
                                                {user.isBlocked ? <CheckCircle size={16} /> : <Ban size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">No users found matching filters</div>
                )}
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="modal-overlay">
                    <div className="edit-modal user-edit-modal">
                        <div className="modal-header">
                            <h3>Edit User: {editingUser.email || editingUser.mobile}</h3>
                            <button className="close-btn" onClick={() => setEditingUser(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body-scroll">
                            <div className="edit-section">
                                <h4>Contact Info</h4>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mobile</label>
                                    <input
                                        type="text"
                                        value={editForm.mobile}
                                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="edit-section">
                                <h4>Financials (Admin Override)</h4>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Electronic Wallet</label>
                                        <input
                                            type="number"
                                            value={editForm.electronicWallet}
                                            onChange={(e) => setEditForm({ ...editForm, electronicWallet: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>Total Income</label>
                                        <input
                                            type="number"
                                            value={editForm.totalIncome}
                                            onChange={(e) => setEditForm({ ...editForm, totalIncome: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Total Recharge</label>
                                        <input
                                            type="number"
                                            value={editForm.totalRecharge}
                                            onChange={(e) => setEditForm({ ...editForm, totalRecharge: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>Total Withdraw</label>
                                        <input
                                            type="number"
                                            value={editForm.totalWithdraw}
                                            onChange={(e) => setEditForm({ ...editForm, totalWithdraw: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="edit-section danger-zone">
                                <div className="section-header">
                                    <h4>Security</h4>
                                    <button
                                        className="toggle-pw-btn"
                                        onClick={() => setShowPasswordReset(!showPasswordReset)}
                                    >
                                        {showPasswordReset ? 'Cancel' : 'Reset Password'}
                                    </button>
                                </div>
                                {showPasswordReset && (
                                    <div className="form-group password-reset-group">
                                        <label>New Login Password</label>
                                        <div className="input-with-icon">
                                            <Lock size={16} className="input-icon" />
                                            <input
                                                type="text"
                                                placeholder="Enter new 6+ char password"
                                                value={editForm.loginPassword || ''}
                                                onChange={(e) => setEditForm({ ...editForm, loginPassword: e.target.value })}
                                                className="password-input"
                                            />
                                        </div>
                                        <small className="warning-text">User will need to login with this new password immediately.</small>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="save-btn" onClick={handleUpdateUser}>
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
