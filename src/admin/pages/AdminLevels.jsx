import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, TrendingUp, Award, DollarSign } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import './AdminLevels.css';

const AdminLevels = () => {
    const navigate = useNavigate();
    const [userLevels, setUserLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUserLevels();
    }, []);

    const fetchUserLevels = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/user-levels`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUserLevels(data.data);
            }
        } catch (error) {
            console.error('Error fetching user levels:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = userLevels.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile?.includes(searchTerm) ||
        user.invitationCode?.includes(searchTerm)
    );

    return (
        <div className="admin-container">
            <div className="admin-page-header">
                <button className="back-btn-circle" onClick={() => navigate('/admin/dashboard')}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="page-title">User Levels & Commissions</h2>
                <div className="header-stats">
                    <span className="total-users-badge">{filteredUsers.length} Users</span>
                </div>
            </div>

            <div className="admin-controls">
                <div className="search-box">
                    <Search size={18} color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Search by email, mobile, or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="admin-content">
                {loading ? (
                    <div className="loading-state">Loading user data...</div>
                ) : filteredUsers.length > 0 ? (
                    <div className="levels-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Current Level</th>
                                    <th>Level Income (Comm.)</th>
                                    <th>Total Earnings</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="user-info-cell">
                                                <span className="user-main">{user.email || user.mobile}</span>
                                                <span className="user-sub">Code: {user.invitationCode}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`level-badge lvl-${user.currentLevel.toLowerCase().replace(' ', '-')}`}>
                                                <Award size={14} />
                                                {user.currentLevel}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="commission-cell">
                                                <TrendingUp size={16} color="#10b981" />
                                                <span className="commission-amt">${user.totalCommission.toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="income-cell">
                                                <DollarSign size={16} color="#6366f1" />
                                                <span className="income-amt">${user.totalIncome.toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-tag ${user.currentLevel === 'No Level' ? 'inactive' : 'active'}`}>
                                                {user.currentLevel === 'No Level' ? 'Idle' : 'Earning'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">No users matching search</div>
                )}
            </div>
        </div>
    );
};

export default AdminLevels;
