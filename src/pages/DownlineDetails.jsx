import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Filter, Search, ChevronRight, X, TrendingUp, DollarSign, Wallet, ArrowDownCircle } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import './DownlineDetails.css';

const DownlineDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get('userId'); // For admin use

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showBreakdown, setShowBreakdown] = useState(false);

    // Filters
    const [levelFilter, setLevelFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [minDeposit, setMinDeposit] = useState('');
    const [maxDeposit, setMaxDeposit] = useState('');
    const [packageType, setPackageType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) return;

            let url = `${API_BASE_URL}/team/downline-detailed?`;
            if (userId) url += `userId=${userId}&`;
            if (levelFilter) url += `level=${levelFilter}&`;
            if (statusFilter) url += `status=${statusFilter}&`;
            if (minDeposit) url += `minDeposit=${minDeposit}&`;
            if (maxDeposit) url += `maxDeposit=${maxDeposit}&`;
            if (packageType) url += `packageType=${packageType}&`;
            if (startDate) url += `startDate=${startDate}&`;
            if (endDate) url += `endDate=${endDate}&`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
                let result = data.data;

                // Client-side search for better responsiveness
                if (search) {
                    const s = search.toLowerCase();
                    result = result.filter(u =>
                        (u.email && u.email.toLowerCase().includes(s)) ||
                        (u.mobile && u.mobile.includes(s)) ||
                        (u.invitationCode && u.invitationCode.includes(s))
                    );
                }
                setMembers(result);
            }
        } catch (error) {
            console.error('Error fetching downline details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [levelFilter, statusFilter, packageType, startDate, endDate, search]);

    const handleApplyFilters = () => {
        fetchData();
    };

    const openBreakdown = (member) => {
        setSelectedMember(member);
        setShowBreakdown(true);
    };

    const closeBreakdown = () => {
        setShowBreakdown(false);
        setSelectedMember(null);
    };

    return (
        <div className="downline-details-container">
            {/* Header */}
            <div className="dd-header">
                <button className="back-btn-circle" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h2>Downline Overview</h2>
            </div>

            {/* Stats Grid */}
            <div className="dd-stats-grid">
                <div className="dd-stat-card">
                    <span className="dd-stat-label">Direct Referrals</span>
                    <span className="dd-stat-value">{stats?.totalDirect || 0}</span>
                </div>
                <div className="dd-stat-card">
                    <span className="dd-stat-label">Total Team</span>
                    <span className="dd-stat-value">{stats?.totalTeam || 0}</span>
                </div>
                <div className="dd-stat-card">
                    <span className="dd-stat-label">Active Users</span>
                    <span className="dd-stat-value active">{stats?.activeUsersCount || 0}</span>
                </div>
                <div className="dd-stat-card">
                    <span className="dd-stat-label">Inactive Users</span>
                    <span className="dd-stat-value inactive">{stats?.inactiveUsersCount || 0}</span>
                </div>
            </div>

            {/* Level Income Summary */}
            <div className="dd-level-income-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TrendingUp size={18} color="#818cf8" />
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Team Income Summary</span>
                </div>
                <div className="dd-level-grid">
                    <div className="dd-level-item">
                        <span className="dd-level-val">₹{stats?.levelIncomeSummary[1]?.toFixed(2) || '0.00'}</span>
                        <span className="dd-level-label">Level 1</span>
                    </div>
                    <div className="dd-level-item">
                        <span className="dd-level-val">₹{stats?.levelIncomeSummary[2]?.toFixed(2) || '0.00'}</span>
                        <span className="dd-level-label">Level 2</span>
                    </div>
                    <div className="dd-level-item">
                        <span className="dd-level-val">₹{stats?.levelIncomeSummary[3]?.toFixed(2) || '0.00'}</span>
                        <span className="dd-level-label">Level 3</span>
                    </div>
                </div>
                <div style={{ marginTop: '16px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Team Income: </span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#10b981' }}>₹{stats?.totalTeamIncome?.toFixed(2) || '0.00'}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="dd-filters-card">
                <div className="dd-filter-group">
                    <label className="dd-filter-label">Level</label>
                    <select className="dd-select" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                        <option value="">All Levels</option>
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                    </select>
                </div>
                <div className="dd-filter-group">
                    <label className="dd-filter-label">Status</label>
                    <select className="dd-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className="dd-filter-group">
                    <label className="dd-filter-label">Min Deposit</label>
                    <input
                        type="number"
                        className="dd-input"
                        placeholder="0"
                        value={minDeposit}
                        onChange={(e) => setMinDeposit(e.target.value)}
                        onBlur={handleApplyFilters}
                    />
                </div>
                <div className="dd-filter-group">
                    <label className="dd-filter-label">Package</label>
                    <input
                        type="text"
                        className="dd-input"
                        placeholder="e.g. VIP1"
                        value={packageType}
                        onChange={(e) => setPackageType(e.target.value)}
                    />
                </div>
                <div className="dd-filter-group">
                    <label className="dd-filter-label">Start Date</label>
                    <input
                        type="date"
                        className="dd-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="dd-filter-group">
                    <label className="dd-filter-label">End Date</label>
                    <input
                        type="date"
                        className="dd-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div className="dd-filter-group" style={{ flex: '1 1 100%' }}>
                    <div className="search-box-dd">
                        <Search size={16} color="#94a3b8" />
                        <input
                            type="text"
                            className="dd-search-input"
                            placeholder="Search by ID, email or mobile..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Members Table */}
            <div className="dd-table-container">
                <div className="dd-table-wrapper">
                    <table className="dd-table">
                        <thead>
                            <tr>
                                <th>User Info</th>
                                <th>Level</th>
                                <th>Financials</th>
                                <th>Package</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td>
                                </tr>
                            ) : members.length > 0 ? (
                                members.map(member => (
                                    <tr key={member._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div className={`dd-status-badge ${member.totalRecharge > 0 ? 'active' : 'inactive'}`}></div>
                                                <div>
                                                    <span className="dd-user-name">{member.email || member.mobile}</span>
                                                    <span className="dd-user-sub">ID: {member.invitationCode}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`dd-badge l${member.level}`}>L{member.level}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span>Dep: ₹{member.totalRecharge?.toFixed(2)}</span>
                                                <span style={{ color: '#10b981', fontSize: '11px' }}>Comm: ₹{member.commissionGiven?.toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ color: member.currentPackage !== 'None' ? '#f59e0b' : '#64748b' }}>
                                                {member.currentPackage}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="dd-action-btn" onClick={() => openBreakdown(member)}>
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No members found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Earning Breakdown Modal */}
            {showBreakdown && selectedMember && (
                <div className="dd-modal-overlay" onClick={closeBreakdown}>
                    <div className="dd-modal" onClick={e => e.stopPropagation()}>
                        <div className="dd-modal-header">
                            <h3 className="dd-modal-title">Earnings Breakdown</h3>
                            <button className="dd-close-btn" onClick={closeBreakdown}><X size={24} /></button>
                        </div>

                        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontWeight: '700', fontSize: '16px' }}>{selectedMember.email || selectedMember.mobile}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Joined: {new Date(selectedMember.createdAt).toLocaleDateString()}</div>
                        </div>

                        <div className="dd-breakdown-grid">
                            <div className="dd-breakdown-item">
                                <span className="dd-breakdown-label"><TrendingUp size={12} /> Self Income</span>
                                <span className="dd-breakdown-val">₹{selectedMember.selfIncome?.toFixed(2)}</span>
                            </div>
                            <div className="dd-breakdown-item">
                                <span className="dd-breakdown-label"><Users size={12} /> Ref Commission</span>
                                <span className="dd-breakdown-val">₹{selectedMember.totalCommission?.toFixed(2)}</span>
                            </div>
                            <div className="dd-breakdown-item">
                                <span className="dd-breakdown-label"><ArrowDownCircle size={12} /> Withdrawal</span>
                                <span className="dd-breakdown-val">₹{selectedMember.totalWithdraw?.toFixed(2)}</span>
                            </div>
                            <div className="dd-breakdown-item">
                                <span className="dd-breakdown-label"><Wallet size={12} /> Wallet Balance</span>
                                <span className="dd-breakdown-val">₹{selectedMember.walletBalance?.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <div className="dd-breakdown-item" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <span className="dd-breakdown-label" style={{ color: '#818cf8' }}>Total Income Generated</span>
                                <span className="dd-breakdown-val" style={{ fontSize: '18px', color: '#10b981' }}>₹{selectedMember.totalIncome?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DownlineDetails;
