import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Calendar, ChevronRight, Users, ArrowUpRight } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import './Promotion.css';

const Promotion = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeamStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${API_BASE_URL}/team/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Error fetching team stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamStats();
    }, []);

    const StatCard = ({ title, value }) => (
        <div className="promo-stat-card">
            <span className="promo-stat-title">{title}</span>
            <span className="promo-stat-value">{value}</span>
        </div>
    );

    const LevelData = ({ level, data, icon: Icon }) => (
        <div className="level-card premium-card">
            <div className="level-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {Icon && <Icon size={20} color="#6366f1" />}
                    <span className="level-title">Level {level} Data</span>
                </div>
                <button
                    className="member-list-btn"
                    onClick={() => navigate('/member-list', { state: { level } })}
                >
                    Member List <ChevronRight size={14} />
                </button>
            </div>
            <div className="level-grid">
                <div className="level-item">
                    <span className="level-val">{data?.headcount || 0}</span>
                    <span className="level-label">Headcount</span>
                </div>
                <div className="level-item">
                    <span className="level-val">{data?.active || 0}</span>
                    <span className="level-label">Active</span>
                </div>
                <div className="level-item">
                    <span className="level-val">{data?.topUp || 0}</span>
                    <span className="level-label">Top Up</span>
                </div>
                <div className="level-item">
                    <span className="level-val">0</span>
                    <span className="level-label">Return</span>
                </div>
                <div className="level-item">
                    <span className="level-val">{Number(data?.earnings || 0).toFixed(2)}</span>
                    <span className="level-label">Earnings</span>
                </div>
                <div className="level-item" style={{ opacity: 0.5 }}>
                    <ArrowUpRight size={16} color="#94a3b8" />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <div className="promotion-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>Loading team metrics...</div>;
    }

    return (
        <div className="promotion-container">
            {/* Header */}
            <div className="promo-header">
                <h2>Promotion</h2>
                <div className="qr-link" onClick={() => navigate('/downline-details')}>
                    <span>Detailed Overview</span>
                    <ChevronRight size={16} />
                </div>
                <div className="qr-link" onClick={() => navigate('/invite')}>
                    <span>Promotion QR Code</span>
                    <QrCode size={16} />
                </div>
            </div>

            {/* Top Stats */}
            <div className="stats-row">
                <StatCard
                    title="total user revenue"
                    value={`${Number((stats?.levels[1]?.earnings || 0) + (stats?.levels[2]?.earnings || 0) + (stats?.levels[3]?.earnings || 0)).toFixed(2)}USDT`}
                />
                <StatCard
                    title="Added income today"
                    value={`${Number(stats?.teamEarningsToday || 0).toFixed(2)}USDT`}
                />
            </div>

            {/* Team Stats Summary */}
            <div className="team-stats-container">
                <div className="date-selector premium-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={18} color="#6366f1" />
                        <span className="query-date-text">Select Query Date</span>
                    </div>
                </div>

                <div className="team-summary-section premium-card">
                    <div className="summary-row">
                        <span className="summary-label">Total number of team members:</span>
                        <span className="summary-val">{stats?.totalTeamMembers || 0}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Team total top up</span>
                        <span className="summary-val">{stats?.teamTotalTopup || 0} USDT</span>
                    </div>
                    <div className="added-today-row">
                        <span>Added today:</span>
                        <span className="added-count">{stats?.addedToday || 0}</span>
                    </div>
                </div>

                {/* Levels */}
                <div className="levels-container">
                    <LevelData level={1} data={stats?.levels[1]} icon={Users} />
                    <LevelData level={2} data={stats?.levels[2]} icon={Users} />
                    <LevelData level={3} data={stats?.levels[3]} icon={Users} />
                </div>
            </div>
        </div>
    );
};

export default Promotion;
