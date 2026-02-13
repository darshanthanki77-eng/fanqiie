import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, DollarSign } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import './MemberList.css';

const MemberList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { level } = location.state || { level: 1 };

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch(`${API_BASE_URL}/team/members?level=${level}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setMembers(data.data);
                }
            } catch (error) {
                console.error('Error fetching members:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [level]);

    return (
        <div className="member-list-container">
            {/* Header */}
            <div className="member-list-header">
                <button className="back-btn-circle" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="member-list-title">Level {level} Members</h2>
                <div style={{ width: '20px' }}></div>
            </div>

            {/* Stats Summary */}
            <div className="member-stats-card">
                <div className="stat-item">
                    <Users size={20} color="#6366f1" />
                    <div>
                        <span className="stat-value">{members.length}</span>
                        <span className="stat-label">Total Members</span>
                    </div>
                </div>
            </div>

            {/* Members List */}
            <div className="members-content">
                {loading ? (
                    <div className="loading-state">Loading members...</div>
                ) : members.length > 0 ? (
                    <div className="members-grid">
                        {members.map((member, index) => (
                            <div key={member._id} className="member-card">
                                <div className="member-header">
                                    <div className="member-avatar">
                                        <span>{member.email?.charAt(0).toUpperCase() || member.mobile?.charAt(0) || 'U'}</span>
                                    </div>
                                    <div className="member-info">
                                        <span className="member-name">{member.email || member.mobile || 'User'}</span>
                                        <span className="member-code">Code: {member.invitationCode}</span>
                                    </div>
                                </div>

                                <div className="member-stats-grid">
                                    <div className="member-stat">
                                        <TrendingUp size={14} color="#10b981" />
                                        <div>
                                            <span className="stat-val">{member.totalRecharge?.toFixed(2) || '0.00'}</span>
                                            <span className="stat-lbl">Recharge</span>
                                        </div>
                                    </div>
                                    <div className="member-stat">
                                        <DollarSign size={14} color="#f59e0b" />
                                        <div>
                                            <span className="stat-val">{member.totalIncome?.toFixed(2) || '0.00'}</span>
                                            <span className="stat-lbl">Income</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="member-footer">
                                    <span className="join-date">
                                        Joined: {new Date(member.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className={`member-status ${member.totalRecharge > 0 ? 'active' : 'inactive'}`}>
                                        {member.totalRecharge > 0 ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Users size={60} color="#334155" />
                        <p className="empty-text">No members in Level {level} yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberList;
