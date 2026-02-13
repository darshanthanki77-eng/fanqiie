import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RotateCw,
    ChevronRight,
    Globe,
    Lock,
    ShieldCheck,
    Mail,
    HelpCircle,
    Headphones,
    Bell,
    Download,
    PlayCircle,
    Film,
    Wallet,
    Users,
    TrendingUp,
    ArrowLeft
} from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import './Me.css';

const Me = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.data);
                localStorage.setItem('user', JSON.stringify(data.data));
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
    };

    const MenuItem = ({ icon, text, onClick }) => (
        <div className="menu-item" onClick={onClick}>
            <div className="menu-left">
                {icon}
                <span className="menu-text">{text}</span>
            </div>
            <ChevronRight size={16} color="#64748b" />
        </div>
    );

    if (loading || !user) return <div className="me-container" style={{ background: '#0f172a', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><span style={{ color: '#fff' }}>Loading profile...</span></div>;

    return (
        <div className="me-container">
            {/* Header */}
            <div className="me-header">
                <div className="app-top-nav">
                    <button className="back-btn-circle" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="profile-actions">
                        <RotateCw size={18} className="reload-icon" onClick={fetchUserProfile} />
                    </div>
                </div>
                <div className="user-info">
                    <div className="user-avatar-premium">
                        <div className="avatar-inner">
                            <PlayCircle size={40} fill="#6366f1" color="#6366f1" />
                        </div>
                    </div>
                    <div className="user-details">
                        <div className="user-email-row">
                            <span className="user-email">{user.email || user.mobile || 'User'}</span>
                        </div>
                        <div className="invite-code-row" onClick={() => copyToClipboard(user.invitationCode)}>
                            <span>Invitation Code: {user.invitationCode || 'N/A'}</span>
                            <span className="copy-badge">Copy</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallet Card */}
            <div className="wallet-card-premium">
                <div className="wallet-grid">
                    <div className="wallet-item-box" onClick={() => navigate('/electronic-wallet')}>
                        <div className="wallet-icon-title">
                            <Wallet size={16} color="#6366f1" />
                            <span className="wallet-label">Electronic wallet  </span>
                        </div>
                        <div className="wallet-value-premium">
                            <span className="currency">USDT</span>
                            <span className="amount">{(user.electronicWallet || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="wallet-item-box" onClick={() => navigate('/record', { state: { type: 'flexible' } })}>
                        <div className="wallet-icon-title">
                            <TrendingUp size={16} color="#a855f7" />
                            <span className="wallet-label">Flexible wallet</span>
                        </div>
                        <div className="wallet-value-premium">
                            <span className="currency">USDT</span>
                            {/* <span className="amount">{(user.flexibleWallet || 0).toFixed(2)}</span> */}
                            <span className="amount">{(0.0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="wallet-footer" onClick={() => navigate('/record', { state: { type: 'frozen' } })}>
                    <div className="footer-left">
                        <Lock size={14} color="#94a3b8" />
                        <span className="footer-label">Unlock Freeze</span>
                    </div>
                    <div className="footer-right">
                        <span className="footer-val">{(user.frozenWallet || 0).toFixed(2)} USDT</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-dashboard">
                <div className="stats-header-row">
                    <div className="stat-main-box">
                        <span className="stat-label-sub">TOTAL INCOME</span>
                        <span className="stat-val-main">{(user.totalIncome || 0).toFixed(2)}</span>
                    </div>
                    <div className="stat-divider-v"></div>
                    <div className="stat-main-box">
                        <span className="stat-label-sub">TEAM SIZE</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={16} color="#3b82f6" />
                            <span className="stat-val-main">{user.teamSize || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="stats-secondary-grid">
                    <div className="stat-sub-item">
                        <span className="sub-val">{(user.totalCommission || 0).toFixed(2)}</span>
                        <span className="sub-label">Total Commission</span>
                    </div>
                    <div className="stat-sub-item">
                        <span className="sub-val">{(user.totalRecharge || 0).toFixed(2)}</span>
                        <span className="sub-label">Recharge</span>
                    </div>
                    <div className="stat-sub-item" onClick={() => navigate('/withdraw')}>
                        <span className="sub-val">{(user.totalWithdraw || 0).toFixed(2)}</span>
                        <span className="sub-label">Withdrawal</span>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="menu-list">
                <div className="menu-group" style={{ marginBottom: '16px' }}>
                    <MenuItem icon={<Globe size={20} color="#fff" />} text=" Official Website" />
                    <MenuItem
                        icon={<Lock size={20} color="#fff" />}
                        text=" Login Password"
                        onClick={() => navigate('/login-password')}
                    />
                    <MenuItem
                        icon={<ShieldCheck size={20} color="#fff" />}
                        text="Security Password"
                        onClick={() => navigate('/security-password')}
                    />
                    <MenuItem
                        icon={<Mail size={20} color="#fff" />}
                        text="Record"
                        onClick={() => navigate('/record')}
                    />
                </div>

                <div className="menu-group">
                    <MenuItem icon={<HelpCircle size={20} color="#fff" />} text=" Help Center" />
                    <MenuItem icon={<Headphones size={20} color="#fff" />} text=" Contact Customer Service" />
                    <MenuItem
                        icon={<Globe size={20} color="#fff" />}
                        text="Switch Language"
                        onClick={() => navigate('/switch-lang')}
                    />
                    <MenuItem icon={<Bell size={20} color="#fff" />} text=" Notification" />
                    <MenuItem icon={<Download size={20} color="#fff" />} text=" APP Download" />
                </div>
            </div>

            {/* Logout */}
            <div className="logout-btn-container">
                <button className="logout-btn" onClick={handleLogout}>LogOut</button>
            </div>
        </div>
    );
};

export default Me;
