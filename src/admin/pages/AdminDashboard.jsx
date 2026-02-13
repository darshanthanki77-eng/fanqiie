import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Package,
    Clock,
    LogOut,
    Video,
    Star,
    Settings
} from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const StatCard = ({ icon: Icon, title, value, color, onClick, breakdown }) => (
        <div className="admin-stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            <div className="card-top">
                <div className="stat-icon" style={{ background: `${color}20` }}>
                    <Icon size={24} color={color} />
                </div>
                <div className="stat-content">
                    <span className="stat-title">{title}</span>
                    <span className="stat-value">{value}</span>
                </div>
            </div>
            {breakdown && (
                <div className="stat-breakdown">
                    {breakdown.map((item, index) => (
                        <div key={index} className="breakdown-item">
                            <span className="breakdown-label">{item.label}:</span>
                            <span className="breakdown-value" style={{ color: item.color }}>{item.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="admin-container">
                <div className="loading-state">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Admin Dashboard</h1>
                    <p className="admin-subtitle">Manage your platform</p>
                </div>
                <button className="logout-btn-admin" onClick={handleLogout}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    icon={Users}
                    title="Total Users"
                    value={stats?.users?.total || 0}
                    color="#6366f1"
                    onClick={() => navigate('/admin/users')}
                    breakdown={[
                        { label: 'Active', value: stats?.users?.active || 0, color: '#10b981' },
                        { label: 'Blocked', value: stats?.users?.blocked || 0, color: '#ef4444' }
                    ]}
                />
                <StatCard
                    icon={TrendingUp}
                    title="Total Recharges"
                    value={`$${(stats?.recharges?.completed || 0).toFixed(2)}`}
                    color="#10b981"
                    onClick={() => navigate('/admin/recharges')}
                    breakdown={[
                        { label: 'Pending', value: `$${(stats?.recharges?.pending || 0).toFixed(2)}`, color: '#f59e0b' },
                        { label: 'Rejected', value: `$${(stats?.recharges?.rejected || 0).toFixed(2)}`, color: '#ef4444' }
                    ]}
                />
                <StatCard
                    icon={TrendingDown}
                    title="Total Withdrawals"
                    value={`$${(stats?.withdrawals?.approved || 0).toFixed(2)}`}
                    color="#ef4444"
                    onClick={() => navigate('/admin/withdrawals')}
                    breakdown={[
                        { label: 'Pending', value: `$${(stats?.withdrawals?.pending || 0).toFixed(2)}`, color: '#f59e0b' },
                        { label: 'Rejected', value: `$${(stats?.withdrawals?.rejected || 0).toFixed(2)}`, color: '#94a3b8' }
                    ]}
                />
                <StatCard
                    icon={Package}
                    title="Active Packages"
                    value={stats?.packages?.active || 0}
                    color="#f59e0b"
                    onClick={() => navigate('/admin/packages')}
                    breakdown={[
                        { label: 'Pending', value: stats?.packages?.pending || 0, color: '#6366f1' },
                        { label: 'Expired', value: stats?.packages?.expired || 0, color: '#94a3b8' }
                    ]}
                />
                <StatCard
                    icon={Star}
                    title="User Ratings"
                    value={stats?.totalRatings || 0}
                    color="#f59e0b"
                    onClick={() => navigate('/admin/ratings')}
                />
            </div>

            {/* Pending Actions */}
            <div className="pending-section">
                <h2 className="section-title">Pending Actions</h2>
                <div className="pending-grid">
                    <div
                        className="pending-card"
                        onClick={() => navigate('/admin/recharges')}
                    >
                        <div className="pending-header">
                            <Clock size={20} color="#f59e0b" />
                            <span className="pending-title">Pending Recharges</span>
                        </div>
                        <span className="pending-count">{stats?.pendingRecharges || 0}</span>
                    </div>
                    <div
                        className="pending-card"
                        onClick={() => navigate('/admin/withdrawals')}
                    >
                        <div className="pending-header">
                            <Clock size={20} color="#f59e0b" />
                            <span className="pending-title">Pending Withdrawals</span>
                        </div>
                        <span className="pending-count">{stats?.pendingWithdrawals || 0}</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="actions-grid">
                    <button
                        className="action-btn"
                        onClick={() => navigate('/admin/users')}
                    >
                        <Users size={20} />
                        Manage Users
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => navigate('/admin/recharges')}
                    >
                        <DollarSign size={20} />
                        Manage Recharges
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => navigate('/admin/withdrawals')}
                    >
                        <TrendingDown size={20} />
                        Manage Withdrawals
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => navigate('/admin/packages')}
                    >
                        <Package size={20} />
                        Manage Packages
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => navigate('/admin/trailers')}
                    >
                        <Video size={20} />
                        Manage Trailers
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => navigate('/admin/levels')}
                    >
                        <TrendingUp size={20} />
                        User Levels
                    </button>
                    <button className="action-btn" onClick={() => navigate('/admin/ratings')}>
                        <Star size={20} />
                        User Ratings
                    </button>
                    <button className="action-btn" onClick={() => navigate('/admin/settings')}>
                        <Settings size={20} />
                        Level Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
